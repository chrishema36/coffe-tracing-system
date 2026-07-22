import { TraceabilityService } from '../../src/services/traceability.service';
import { AppError } from '../../src/middleware/errorHandler';

describe('TraceabilityService (Unit Tests)', () => {
  let mockPrisma: any;
  let traceService: TraceabilityService;

  beforeEach(() => {
    mockPrisma = {
      coffeeBag: {
        findFirst: jest.fn(),
      },
      mergeRelation: {
        findMany: jest.fn(),
      },
    };
    traceService = new TraceabilityService(mockPrisma as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // getBackwardTrace — Happy Path
  // -----------------------------------------------------------------------
  describe('getBackwardTrace()', () => {
    it('should throw AppError 404 when target bag is not found', async () => {
      mockPrisma.coffeeBag.findFirst.mockResolvedValue(null);
      await expect(traceService.getBackwardTrace('NONEXISTENT-BAG')).rejects.toThrow(AppError);
      await expect(traceService.getBackwardTrace('NONEXISTENT-BAG')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should correctly attribute a single-farmer leaf bag with no merge parents', async () => {
      const leafBag = {
        id: 'bag-leaf-1',
        bagCode: 'BAG-LEAF-001',
        initialWeightKg: 50.0,
        currentWeightKg: 50.0,
        status: 'HARVESTED',
        variety: 'BOURBON',
        qualityScore: 90,
        moisturePercent: 11.0,
        farmerId: 'farmer-1',
        farmer: { id: 'farmer-1', code: 'FRM-001', name: 'Jean Bosco', region: 'Huye', country: 'Rwanda' },
      };

      mockPrisma.coffeeBag.findFirst.mockResolvedValue(leafBag);
      mockPrisma.mergeRelation.findMany.mockResolvedValue([]); // No parents

      const result = await traceService.getBackwardTrace('BAG-LEAF-001');

      expect(result.targetBag.bagCode).toBe('BAG-LEAF-001');
      expect(result.farmerAttributions).toHaveLength(1);
      expect(result.farmerAttributions[0].contributionPercentage).toBe(100.0);
      expect(result.graphNodes).toHaveLength(1);
      expect(result.graphEdges).toHaveLength(0);
    });

    it('should correctly calculate two-farmer attribution for a first-level merge', async () => {
      const rootBag = {
        id: 'target-1',
        bagCode: 'COMP-100',
        initialWeightKg: 100.0,
        currentWeightKg: 100.0,
        status: 'IN_STORAGE',
        variety: 'ARABICA',
        qualityScore: 91,
        moisturePercent: 11.0,
        farmerId: null,
        farmer: null,
      };

      mockPrisma.coffeeBag.findFirst.mockResolvedValue(rootBag);

      // Root bag has two parents
      mockPrisma.mergeRelation.findMany.mockResolvedValueOnce([
        {
          parentBagId: 'bag-a',
          childBagId: 'target-1',
          weightUsedKg: 60.0,
          parentBag: {
            id: 'bag-a',
            bagCode: 'BAG-A',
            initialWeightKg: 60.0,
            currentWeightKg: 0.0,
            status: 'MERGED',
            variety: 'ARABICA',
            qualityScore: 89,
            farmerId: 'farmer-1',
            farmer: { id: 'farmer-1', code: 'FRM-001', name: 'Abebe Bikila', region: 'Yirgacheffe', country: 'Ethiopia' },
          },
        },
        {
          parentBagId: 'bag-b',
          childBagId: 'target-1',
          weightUsedKg: 40.0,
          parentBag: {
            id: 'bag-b',
            bagCode: 'BAG-B',
            initialWeightKg: 40.0,
            currentWeightKg: 0.0,
            status: 'MERGED',
            variety: 'GEISHA',
            qualityScore: 92,
            farmerId: 'farmer-2',
            farmer: { id: 'farmer-2', code: 'FRM-002', name: 'Tigist Assefa', region: 'Sidama', country: 'Ethiopia' },
          },
        },
      ]);

      // Both leaf bags have no further parents
      mockPrisma.mergeRelation.findMany.mockResolvedValue([]);

      const result = await traceService.getBackwardTrace('COMP-100');

      expect(result.targetBag.bagCode).toBe('COMP-100');
      expect(result.totalOriginFarmersCount).toBe(2);
      expect(result.farmerAttributions).toHaveLength(2);

      const abebe = result.farmerAttributions.find((f) => f.farmerCode === 'FRM-001');
      const tigist = result.farmerAttributions.find((f) => f.farmerCode === 'FRM-002');

      expect(abebe?.contributionPercentage).toBe(60.0);
      expect(tigist?.contributionPercentage).toBe(40.0);
    });

    it('should return farmer attributions sorted descending by contribution %', async () => {
      const rootBag = {
        id: 'root-sorted',
        bagCode: 'SORT-TEST',
        initialWeightKg: 100.0,
        currentWeightKg: 100.0,
        status: 'IN_STORAGE',
        variety: 'BOURBON',
        qualityScore: 90,
        moisturePercent: 11.0,
        farmerId: null,
        farmer: null,
      };

      mockPrisma.coffeeBag.findFirst.mockResolvedValue(rootBag);
      mockPrisma.mergeRelation.findMany.mockResolvedValueOnce([
        {
          parentBagId: 'bag-small',
          childBagId: 'root-sorted',
          weightUsedKg: 20.0,
          parentBag: {
            id: 'bag-small', bagCode: 'BAG-SMALL', initialWeightKg: 20, currentWeightKg: 0,
            status: 'MERGED', variety: 'BOURBON', qualityScore: 88,
            farmerId: 'f-small',
            farmer: { id: 'f-small', code: 'FRM-S', name: 'Small Farmer', region: 'R', country: 'C' },
          },
        },
        {
          parentBagId: 'bag-large',
          childBagId: 'root-sorted',
          weightUsedKg: 80.0,
          parentBag: {
            id: 'bag-large', bagCode: 'BAG-LARGE', initialWeightKg: 80, currentWeightKg: 0,
            status: 'MERGED', variety: 'BOURBON', qualityScore: 92,
            farmerId: 'f-large',
            farmer: { id: 'f-large', code: 'FRM-L', name: 'Large Farmer', region: 'R', country: 'C' },
          },
        },
      ]);
      mockPrisma.mergeRelation.findMany.mockResolvedValue([]);

      const result = await traceService.getBackwardTrace('SORT-TEST');

      expect(result.farmerAttributions[0].contributionPercentage).toBe(80.0);
      expect(result.farmerAttributions[1].contributionPercentage).toBe(20.0);
    });

    it('should handle a bag with no farmers and no merge relations (anonymous bag)', async () => {
      const anonBag = {
        id: 'anon-1',
        bagCode: 'ANON-BAG',
        initialWeightKg: 50.0,
        currentWeightKg: 50.0,
        status: 'IN_STORAGE',
        variety: 'ROBUSTA',
        qualityScore: null,
        moisturePercent: null,
        farmerId: null,
        farmer: null,
      };
      mockPrisma.coffeeBag.findFirst.mockResolvedValue(anonBag);
      mockPrisma.mergeRelation.findMany.mockResolvedValue([]);

      const result = await traceService.getBackwardTrace('ANON-BAG');

      expect(result.farmerAttributions).toHaveLength(0);
      expect(result.totalOriginFarmersCount).toBe(0);
      expect(result.graphNodes).toHaveLength(1);
    });

    it('should include qualityScore and moisturePercent in targetBag response', async () => {
      const bag = {
        id: 'q-bag', bagCode: 'Q-BAG', initialWeightKg: 70, currentWeightKg: 70,
        status: 'HARVESTED', variety: 'GEISHA', qualityScore: 94, moisturePercent: 10.5,
        farmerId: null, farmer: null,
      };
      mockPrisma.coffeeBag.findFirst.mockResolvedValue(bag);
      mockPrisma.mergeRelation.findMany.mockResolvedValue([]);

      const result = await traceService.getBackwardTrace('Q-BAG');

      expect(result.targetBag.qualityScore).toBe(94);
      expect(result.targetBag.moisturePercent).toBe(10.5);
    });
  });

  // -----------------------------------------------------------------------
  // checkCycle — Cycle Detection Tests
  // -----------------------------------------------------------------------
  describe('checkCycle()', () => {
    it('should detect a direct self-reference cycle (sourceBag === targetBag)', async () => {
      const isCycle = await traceService.checkCycle(['bag-x'], 'bag-x');
      expect(isCycle).toBe(true);
    });

    it('should detect an indirect cycle: bag-y → bag-x (making bag-x child of its ancestor)', async () => {
      // bag-y's parent is bag-x → so linking bag-y → bag-x would be a cycle
      mockPrisma.mergeRelation.findMany.mockResolvedValueOnce([
        { parentBagId: 'bag-x', childBagId: 'bag-y' },
      ]);

      const isCycle = await traceService.checkCycle(['bag-y'], 'bag-x');
      expect(isCycle).toBe(true);
    });

    it('should return false when no cycle exists', async () => {
      // bag-c has no ancestors (leaf node)
      mockPrisma.mergeRelation.findMany.mockResolvedValue([]);

      const isCycle = await traceService.checkCycle(['bag-c'], 'bag-new-target');
      expect(isCycle).toBe(false);
    });

    it('should return false when source and target are unrelated', async () => {
      mockPrisma.mergeRelation.findMany.mockResolvedValue([
        { parentBagId: 'some-other-bag', childBagId: 'bag-c' },
      ]);

      const isCycle = await traceService.checkCycle(['bag-c'], 'completely-new-bag');
      expect(isCycle).toBe(false);
    });

    it('should handle multiple source bags and detect cycle in any of them', async () => {
      // bag-safe has no ancestors, bag-cycle has target as ancestor
      mockPrisma.mergeRelation.findMany
        .mockResolvedValueOnce([]) // bag-safe: no ancestors
        .mockResolvedValueOnce([{ parentBagId: 'target-bag', childBagId: 'bag-cycle' }]) // bag-cycle → target-bag
        .mockResolvedValue([]);

      const isCycle = await traceService.checkCycle(['bag-safe', 'bag-cycle'], 'target-bag');
      expect(isCycle).toBe(true);
    });
  });
});
