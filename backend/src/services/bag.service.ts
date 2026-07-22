import { CoffeeBag, BagStatus } from '@prisma/client';
import { BagRepository } from '../repositories/bag.repository';
import { FarmerRepository } from '../repositories/farmer.repository';
import { TraceabilityService } from './traceability.service';
import { CreateBagDTO, MergeBagsDTO } from '../dtos';
import { PaginatedResult } from '../types';
import { AppError } from '../middleware/errorHandler';

/** Maximum pagination page size — strictly enforced per SLR assessment spec */
const MAX_PAGE_SIZE = 5;

export class BagService {
  constructor(
    private readonly bagRepo: BagRepository,
    private readonly farmerRepo: FarmerRepository,
    private readonly traceService: TraceabilityService
  ) {}

  async createBag(data: CreateBagDTO): Promise<CoffeeBag> {
    // 1. Verify referenced farmer exists
    const farmer = await this.farmerRepo.findById(data.farmerId);
    if (!farmer) {
      throw new AppError(404, `Farmer with ID '${data.farmerId}' not found.`);
    }

    // 2. Enforce unique bag code
    const existing = await this.bagRepo.findByCode(data.bagCode);
    if (existing) {
      throw new AppError(409, `Coffee bag with code '${data.bagCode}' already exists.`);
    }

    return this.bagRepo.create(data);
  }

  async getBagById(id: string): Promise<CoffeeBag> {
    const bag = await this.bagRepo.findById(id);
    if (!bag) {
      throw new AppError(404, `Coffee bag with ID '${id}' not found.`);
    }
    return bag;
  }

  async getAllBags(
    page: number = 1,
    limit: number = MAX_PAGE_SIZE,
    status?: BagStatus,
    search?: string
  ): Promise<PaginatedResult<CoffeeBag>> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit));
    return this.bagRepo.findAll(safePage, safeLimit, status, search);
  }

  async mergeBags(data: MergeBagsDTO): Promise<CoffeeBag> {
    // 1. Ensure target bag code is not already taken
    const existingTarget = await this.bagRepo.findByCode(data.targetBagCode);
    if (existingTarget) {
      throw new AppError(409, `Target bag code '${data.targetBagCode}' already exists.`);
    }

    // 2. Resolve and validate all source bags
    const sourceBags = await this.bagRepo.findManyByIds(data.sourceBagIds);
    if (sourceBags.length !== data.sourceBagIds.length) {
      const foundIds = new Set(sourceBags.map((b) => b.id));
      const missing = data.sourceBagIds.filter((id) => !foundIds.has(id));
      throw new AppError(404, `Source bags not found: ${missing.join(', ')}`);
    }

    // 3. Validate each source bag is eligible for merge
    for (const bag of sourceBags) {
      if (bag.status === BagStatus.MERGED) {
        throw new AppError(
          400,
          `Bag '${bag.bagCode}' has already been fully merged and cannot be re-merged.`
        );
      }
      if (bag.status === BagStatus.EXPORTED) {
        throw new AppError(400, `Bag '${bag.bagCode}' has been exported and cannot be merged.`);
      }
      if (bag.currentWeightKg <= 0) {
        throw new AppError(400, `Bag '${bag.bagCode}' has zero available weight for merging.`);
      }
    }

    // 4. Pre-merge cycle detection — prevents DAG becoming a cyclic graph
    const hasCycle = await this.traceService.checkCycle(data.sourceBagIds, data.targetBagCode);
    if (hasCycle) {
      throw new AppError(
        400,
        'Merge rejected: this operation would create a circular merge reference (cycle detected in lineage DAG).'
      );
    }

    // 5. Calculate composite target weight
    const totalWeightKg = sourceBags.reduce((sum, bag) => sum + bag.currentWeightKg, 0);
    const variety = data.variety ?? sourceBags[0].variety;

    // 6. Execute atomic merge transaction
    return this.bagRepo.createMerge(data.sourceBagIds, {
      bagCode: data.targetBagCode,
      initialWeightKg: totalWeightKg,
      variety,
      moisturePercent: data.moisturePercent,
      qualityScore: data.qualityScore,
    });
  }
}
