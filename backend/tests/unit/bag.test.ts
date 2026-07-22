import { BagService } from '../../src/services/bag.service';
import { AppError } from '../../src/middleware/errorHandler';

describe('BagService (Unit Tests)', () => {
  let mockBagRepo: any;
  let mockFarmerRepo: any;
  let mockTraceService: any;
  let bagService: BagService;

  beforeEach(() => {
    mockBagRepo = {
      create: jest.fn(),
      findByCode: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findManyByIds: jest.fn(),
      createMerge: jest.fn(),
    };
    mockFarmerRepo = {
      findById: jest.fn(),
      findByCode: jest.fn(),
    };
    mockTraceService = {
      checkCycle: jest.fn().mockResolvedValue(false),
    };
    bagService = new BagService(mockBagRepo, mockFarmerRepo, mockTraceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // createBag()
  // -----------------------------------------------------------------------
  describe('createBag()', () => {
    it('should create a harvest bag successfully', async () => {
      const mockFarmer = { id: 'farmer-1', code: 'FARM-001', name: 'Jean Bosco' };
      const mockCreatedBag = {
        id: 'bag-1',
        bagCode: 'BAG-2026-A1',
        initialWeightKg: 50.0,
        currentWeightKg: 50.0,
        status: 'HARVESTED',
        variety: 'ARABICA',
        farmerId: 'farmer-1',
        farmer: mockFarmer,
      };

      mockFarmerRepo.findById.mockResolvedValue(mockFarmer);
      mockBagRepo.findByCode.mockResolvedValue(null);
      mockBagRepo.create.mockResolvedValue(mockCreatedBag);

      const result = await bagService.createBag({
        bagCode: 'BAG-2026-A1',
        initialWeightKg: 50.0,
        variety: 'ARABICA' as any,
        farmerId: 'farmer-1',
      });

      expect(result.bagCode).toBe('BAG-2026-A1');
      expect(result.initialWeightKg).toBe(50.0);
      expect(mockBagRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError 404 if farmer is not found', async () => {
      mockFarmerRepo.findById.mockResolvedValue(null);

      await expect(
        bagService.createBag({
          bagCode: 'BAG-INVALID',
          initialWeightKg: 50.0,
          variety: 'ARABICA' as any,
          farmerId: 'non-existent-farmer',
        })
      ).rejects.toThrow(AppError);

      await expect(
        bagService.createBag({
          bagCode: 'BAG-INVALID',
          initialWeightKg: 50.0,
          variety: 'ARABICA' as any,
          farmerId: 'non-existent-farmer',
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw AppError 409 if bag code already exists', async () => {
      mockFarmerRepo.findById.mockResolvedValue({ id: 'f1', name: 'Test Farmer' });
      mockBagRepo.findByCode.mockResolvedValue({ id: 'existing-bag', bagCode: 'DUPLICATE-CODE' });

      await expect(
        bagService.createBag({
          bagCode: 'DUPLICATE-CODE',
          initialWeightKg: 50.0,
          variety: 'ARABICA' as any,
          farmerId: 'f1',
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  // -----------------------------------------------------------------------
  // getBagById()
  // -----------------------------------------------------------------------
  describe('getBagById()', () => {
    it('should return bag when found', async () => {
      const mockBag = { id: 'bag-1', bagCode: 'BAG-001', status: 'HARVESTED' };
      mockBagRepo.findById.mockResolvedValue(mockBag);

      const result = await bagService.getBagById('bag-1');
      expect(result.bagCode).toBe('BAG-001');
    });

    it('should throw AppError 404 when bag not found', async () => {
      mockBagRepo.findById.mockResolvedValue(null);
      await expect(bagService.getBagById('missing-id')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // -----------------------------------------------------------------------
  // getAllBags() — Pagination Guard
  // -----------------------------------------------------------------------
  describe('getAllBags() pagination guard', () => {
    it('should enforce max limit of 5 regardless of input', async () => {
      mockBagRepo.findAll.mockResolvedValue({ data: [], pagination: { limit: 5 } });

      await bagService.getAllBags(1, 999);
      expect(mockBagRepo.findAll).toHaveBeenCalledWith(1, 5, undefined, undefined);
    });

    it('should enforce minimum page of 1 for page=0', async () => {
      mockBagRepo.findAll.mockResolvedValue({ data: [], pagination: { limit: 5 } });

      await bagService.getAllBags(0, 5);
      expect(mockBagRepo.findAll).toHaveBeenCalledWith(1, 5, undefined, undefined);
    });

    it('should enforce minimum limit of 1 for limit=0', async () => {
      mockBagRepo.findAll.mockResolvedValue({ data: [], pagination: { limit: 1 } });

      await bagService.getAllBags(1, 0);
      expect(mockBagRepo.findAll).toHaveBeenCalledWith(1, 1, undefined, undefined);
    });
  });

  // -----------------------------------------------------------------------
  // mergeBags()
  // -----------------------------------------------------------------------
  describe('mergeBags()', () => {
    it('should throw AppError 409 if target bag code already exists', async () => {
      mockBagRepo.findByCode.mockResolvedValue({ id: 'existing-id', bagCode: 'EXPORT-EXISTING' });

      await expect(
        bagService.mergeBags({
          targetBagCode: 'EXPORT-EXISTING',
          sourceBagIds: ['source-1', 'source-2'],
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('should throw AppError 404 if source bags not found', async () => {
      mockBagRepo.findByCode.mockResolvedValue(null); // target is free
      mockBagRepo.findManyByIds.mockResolvedValue([{ id: 'source-1', bagCode: 'BAG-1', status: 'HARVESTED', currentWeightKg: 50 }]); // only 1 of 2 found

      await expect(
        bagService.mergeBags({
          targetBagCode: 'NEW-LOT',
          sourceBagIds: ['source-1', 'source-2'],
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw AppError 400 if a source bag is already MERGED', async () => {
      mockBagRepo.findByCode.mockResolvedValue(null);
      mockBagRepo.findManyByIds.mockResolvedValue([
        { id: 'source-1', bagCode: 'BAG-1', status: 'MERGED', currentWeightKg: 0 },
        { id: 'source-2', bagCode: 'BAG-2', status: 'HARVESTED', currentWeightKg: 50 },
      ]);

      await expect(
        bagService.mergeBags({
          targetBagCode: 'NEW-LOT',
          sourceBagIds: ['source-1', 'source-2'],
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw AppError 400 if a source bag has zero weight', async () => {
      mockBagRepo.findByCode.mockResolvedValue(null);
      mockBagRepo.findManyByIds.mockResolvedValue([
        { id: 'source-1', bagCode: 'BAG-1', status: 'HARVESTED', currentWeightKg: 0 },
        { id: 'source-2', bagCode: 'BAG-2', status: 'HARVESTED', currentWeightKg: 50 },
      ]);

      await expect(
        bagService.mergeBags({
          targetBagCode: 'NEW-LOT',
          sourceBagIds: ['source-1', 'source-2'],
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw AppError 400 if cycle detection returns true', async () => {
      mockBagRepo.findByCode.mockResolvedValue(null);
      mockBagRepo.findManyByIds.mockResolvedValue([
        { id: 'source-1', bagCode: 'BAG-1', status: 'HARVESTED', currentWeightKg: 50, variety: 'BOURBON' },
        { id: 'source-2', bagCode: 'BAG-2', status: 'HARVESTED', currentWeightKg: 50, variety: 'BOURBON' },
      ]);
      mockTraceService.checkCycle.mockResolvedValue(true);

      await expect(
        bagService.mergeBags({
          targetBagCode: 'CYCLE-LOT',
          sourceBagIds: ['source-1', 'source-2'],
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should successfully execute merge and call createMerge with correct weight sum', async () => {
      const mockMergedBag = { id: 'merged-1', bagCode: 'MERGED-LOT', status: 'IN_STORAGE', initialWeightKg: 110 };
      mockBagRepo.findByCode.mockResolvedValue(null);
      mockBagRepo.findManyByIds.mockResolvedValue([
        { id: 'source-1', bagCode: 'BAG-1', status: 'HARVESTED', currentWeightKg: 60, variety: 'BOURBON' },
        { id: 'source-2', bagCode: 'BAG-2', status: 'IN_STORAGE', currentWeightKg: 50, variety: 'BOURBON' },
      ]);
      mockTraceService.checkCycle.mockResolvedValue(false);
      mockBagRepo.createMerge.mockResolvedValue(mockMergedBag);

      const result = await bagService.mergeBags({
        targetBagCode: 'MERGED-LOT',
        sourceBagIds: ['source-1', 'source-2'],
      });

      expect(result.bagCode).toBe('MERGED-LOT');
      expect(mockBagRepo.createMerge).toHaveBeenCalledWith(
        ['source-1', 'source-2'],
        expect.objectContaining({ bagCode: 'MERGED-LOT', initialWeightKg: 110 })
      );
    });
  });
});
