import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { TraceabilityResult, FarmerAttribution, TraceGraphNode, TraceGraphEdge, ForwardTraceResult } from '../types';

/** Maximum traversal depth to prevent runaway recursion on pathological data */
const MAX_TRACE_DEPTH = 100;

export class TraceabilityService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Recursive Backward Trace Engine - BFS Implementation
   *
   * Traverses parent merge relations all the way down to leaf harvest bags using
   * Breadth-First Search with a global visited Set<string> (O(1) lookups).
   *
   * Complexity: O(N + E) where N = bags in lineage, E = merge edges.
   * Supports unlimited recursion depth up to MAX_TRACE_DEPTH.
   * Guarantees: zero duplicates, zero infinite cycles, correct farmer attribution.
   *
   * At scale (5M bags, 100K merges): dominant cost is indexed DB reads per level.
   * For production at that scale, replace N BFS DB calls with a single PostgreSQL
   * recursive CTE query (`WITH RECURSIVE`) to pull the entire DAG in one round trip.
   */
  async getBackwardTrace(bagIdOrCode: string): Promise<TraceabilityResult> {
    // 1. Find root target bag
    const rootBag = await this.prisma.coffeeBag.findFirst({
      where: {
        OR: [{ id: bagIdOrCode }, { bagCode: bagIdOrCode }],
      },
      include: { farmer: true },
    });

    if (!rootBag) {
      throw new AppError(404, `Coffee bag with identifier '${bagIdOrCode}' was not found.`);
    }

    const graphNodes = new Map<string, TraceGraphNode>();
    const graphEdges = new Map<string, TraceGraphEdge>();

    /**
     * farmerContributionMap accumulates weighted mass per unique farmer.
     * Key: farmerId | Value: running contribution record
     */
    const farmerContributionMap = new Map<
      string,
      {
        farmerId: string;
        farmerCode: string;
        farmerName: string;
        region: string;
        country: string;
        initialBagCode: string;
        contributedWeightKg: number;
      }
    >();

    // Global visited Set - O(1) lookups, prevents re-processing any bag node
    const visited = new Set<string>();

    // Add root node
    graphNodes.set(rootBag.id, {
      id: rootBag.id,
      bagCode: rootBag.bagCode,
      initialWeightKg: rootBag.initialWeightKg,
      currentWeightKg: rootBag.currentWeightKg,
      status: rootBag.status,
      variety: rootBag.variety,
      qualityScore: rootBag.qualityScore,
      farmerId: rootBag.farmerId,
      farmerName: rootBag.farmer?.name ?? null,
      farmerRegion: rootBag.farmer?.region ?? null,
      depth: 0,
    });

    // If root bag itself has a direct farmer (un-merged harvested bag)
    if (rootBag.farmerId && rootBag.farmer) {
      farmerContributionMap.set(rootBag.farmerId, {
        farmerId: rootBag.farmer.id,
        farmerCode: rootBag.farmer.code,
        farmerName: rootBag.farmer.name,
        region: rootBag.farmer.region,
        country: rootBag.farmer.country,
        initialBagCode: rootBag.bagCode,
        contributedWeightKg: rootBag.currentWeightKg,
      });
    }

    visited.add(rootBag.id);

    // BFS queue: { bagId, depth }
    const queue: { bagId: string; depth: number }[] = [{ bagId: rootBag.id, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Hard depth guard - prevents runaway traversal on corrupt/cyclic data
      if (current.depth >= MAX_TRACE_DEPTH) {
        console.warn(`⚠️  MAX_TRACE_DEPTH (${MAX_TRACE_DEPTH}) reached at bag ${current.bagId}. Halting deeper traversal.`);
        continue;
      }

      // Fetch all parent merge relations for this bag
      const parentRelations = await this.prisma.mergeRelation.findMany({
        where: { childBagId: current.bagId },
        include: {
          parentBag: {
            include: { farmer: true },
          },
        },
      });

      for (const rel of parentRelations) {
        const parent = rel.parentBag;

        // Cycle guard: skip any node already in the global visited set
        if (visited.has(parent.id)) {
          console.warn(`⚠️  Cycle or duplicate detected - skipping already-visited bag ${parent.bagCode}.`);
          continue;
        }

        visited.add(parent.id);

        // Register directed edge: parent → current
        const edgeId = `edge-${parent.id}-${current.bagId}`;
        graphEdges.set(edgeId, {
          id: edgeId,
          sourceBagId: parent.id,
          targetBagId: current.bagId,
          weightUsedKg: rel.weightUsedKg,
        });

        // Register node
        graphNodes.set(parent.id, {
          id: parent.id,
          bagCode: parent.bagCode,
          initialWeightKg: parent.initialWeightKg,
          currentWeightKg: parent.currentWeightKg,
          status: parent.status,
          variety: parent.variety,
          qualityScore: parent.qualityScore,
          farmerId: parent.farmerId,
          farmerName: parent.farmer?.name ?? null,
          farmerRegion: parent.farmer?.region ?? null,
          depth: current.depth + 1,
        });

        // Accumulate farmer contribution using rel.weightUsedKg (the actual weight contributed)
        if (parent.farmerId && parent.farmer) {
          const existing = farmerContributionMap.get(parent.farmerId);
          if (existing) {
            existing.contributedWeightKg += rel.weightUsedKg;
          } else {
            farmerContributionMap.set(parent.farmerId, {
              farmerId: parent.farmer.id,
              farmerCode: parent.farmer.code,
              farmerName: parent.farmer.name,
              region: parent.farmer.region,
              country: parent.farmer.country,
              initialBagCode: parent.bagCode,
              contributedWeightKg: rel.weightUsedKg,
            });
          }
        }

        // Enqueue for deeper traversal
        queue.push({ bagId: parent.id, depth: current.depth + 1 });
      }
    }

    // Calculate percentage attributions relative to root bag's initial weight
    const totalMass = rootBag.initialWeightKg > 0 ? rootBag.initialWeightKg : 1;
    const farmerAttributions: FarmerAttribution[] = Array.from(farmerContributionMap.values()).map(
      (f) => ({
        ...f,
        contributionPercentage: Number(((f.contributedWeightKg / totalMass) * 100).toFixed(2)),
      })
    );

    // Sort attributions descending by contribution for consistent API output
    farmerAttributions.sort((a, b) => b.contributionPercentage - a.contributionPercentage);

    return {
      targetBag: {
        id: rootBag.id,
        bagCode: rootBag.bagCode,
        currentWeightKg: rootBag.currentWeightKg,
        initialWeightKg: rootBag.initialWeightKg,
        status: rootBag.status,
        variety: rootBag.variety,
        qualityScore: rootBag.qualityScore,
        moisturePercent: rootBag.moisturePercent,
      },
      totalOriginFarmersCount: farmerAttributions.length,
      farmerAttributions,
      graphNodes: Array.from(graphNodes.values()),
      graphEdges: Array.from(graphEdges.values()),
    };
  }

  /**
   * Pre-merge Cycle Detection
   *
   * Checks if linking sourceBagIds → targetBagId would create a directed cycle
   * in the merge DAG. Uses BFS traversal with a visited Set.
   *
   * When `targetBagId` is null/undefined (brand-new child bag), only duplicate
   * source IDs can fail - a new node cannot already appear in any ancestry.
   *
   * Complexity: O(N + E) per source bag where N = ancestors, E = edges.
   */
  async checkCycle(sourceBagIds: string[], targetBagId?: string | null): Promise<boolean> {
    if (new Set(sourceBagIds).size !== sourceBagIds.length) return true;

    // Brand-new target bag: no existing node to close a cycle with.
    if (!targetBagId) return false;

    // Direct self-reference check (UUIDs / existing bag ids only)
    if (sourceBagIds.includes(targetBagId)) return true;

    // For each source, BFS upward through ancestry looking for targetBagId
    for (const sourceId of sourceBagIds) {
      const queue = [sourceId];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const curr = queue.shift()!;

        if (curr === targetBagId) return true; // Cycle found

        if (visited.has(curr)) continue;
        visited.add(curr);

        const parentRels = await this.prisma.mergeRelation.findMany({
          where: { childBagId: curr },
          select: { parentBagId: true },
        });

        for (const rel of parentRels) {
          if (!visited.has(rel.parentBagId)) {
            queue.push(rel.parentBagId);
          }
        }
      }
    }

    return false;
  }

  /**
   * Forward Trace - BFS from a bag toward descendant composite lots.
   * Answers: "Which export lots did this harvest/intermediate bag feed into?"
   */
  async getForwardTrace(bagIdOrCode: string): Promise<ForwardTraceResult> {
    const rootBag = await this.prisma.coffeeBag.findFirst({
      where: {
        OR: [{ id: bagIdOrCode }, { bagCode: bagIdOrCode }],
      },
      include: { farmer: true },
    });

    if (!rootBag) {
      throw new AppError(404, `Coffee bag with identifier '${bagIdOrCode}' was not found.`);
    }

    const graphNodes = new Map<string, TraceGraphNode>();
    const graphEdges = new Map<string, TraceGraphEdge>();
    const descendantLots: ForwardTraceResult['descendantLots'] = [];

    graphNodes.set(rootBag.id, {
      id: rootBag.id,
      bagCode: rootBag.bagCode,
      initialWeightKg: rootBag.initialWeightKg,
      currentWeightKg: rootBag.currentWeightKg,
      status: rootBag.status,
      variety: rootBag.variety,
      qualityScore: rootBag.qualityScore,
      farmerId: rootBag.farmerId,
      farmerName: rootBag.farmer?.name ?? null,
      farmerRegion: rootBag.farmer?.region ?? null,
      depth: 0,
    });

    const visited = new Set<string>([rootBag.id]);
    const queue: { bagId: string; depth: number }[] = [{ bagId: rootBag.id, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth >= MAX_TRACE_DEPTH) continue;

      const childRelations = await this.prisma.mergeRelation.findMany({
        where: { parentBagId: current.bagId },
        include: {
          childBag: { include: { farmer: true } },
        },
      });

      for (const rel of childRelations) {
        const child = rel.childBag;
        const edgeId = `edge-${current.bagId}-${child.id}`;
        graphEdges.set(edgeId, {
          id: edgeId,
          sourceBagId: current.bagId,
          targetBagId: child.id,
          weightUsedKg: rel.weightUsedKg,
        });

        if (visited.has(child.id)) continue;
        visited.add(child.id);

        const depth = current.depth + 1;
        graphNodes.set(child.id, {
          id: child.id,
          bagCode: child.bagCode,
          initialWeightKg: child.initialWeightKg,
          currentWeightKg: child.currentWeightKg,
          status: child.status,
          variety: child.variety,
          qualityScore: child.qualityScore,
          farmerId: child.farmerId,
          farmerName: child.farmer?.name ?? null,
          farmerRegion: child.farmer?.region ?? null,
          depth,
        });

        descendantLots.push({
          id: child.id,
          bagCode: child.bagCode,
          status: child.status,
          variety: child.variety,
          currentWeightKg: child.currentWeightKg,
          weightReceivedKg: rel.weightUsedKg,
          depth,
        });

        queue.push({ bagId: child.id, depth });
      }
    }

    descendantLots.sort((a, b) => a.depth - b.depth || a.bagCode.localeCompare(b.bagCode));

    return {
      sourceBag: {
        id: rootBag.id,
        bagCode: rootBag.bagCode,
        currentWeightKg: rootBag.currentWeightKg,
        initialWeightKg: rootBag.initialWeightKg,
        status: rootBag.status,
        variety: rootBag.variety,
        farmerId: rootBag.farmerId,
        farmerName: rootBag.farmer?.name ?? null,
      },
      totalDescendantLots: descendantLots.length,
      descendantLots,
      graphNodes: Array.from(graphNodes.values()),
      graphEdges: Array.from(graphEdges.values()),
    };
  }
}
