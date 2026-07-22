import { FarmerService } from '../../src/services/farmer.service';
import { AppError } from '../../src/middleware/errorHandler';

describe('FarmerService (Unit Tests)', () => {
  let mockFarmerRepo: any;
  let farmerService: FarmerService;

  beforeEach(() => {
    mockFarmerRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(),
    };
    farmerService = new FarmerService(mockFarmerRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFarmer()', () => {
    it('should successfully create a new farmer when code is unique', async () => {
      const dto = {
        code: 'FRM-RWA-999',
        name: 'Emmanuel Nshimiyimana',
        email: 'emmanuel@huye.rw',
        phone: '+250788111999',
        region: 'Huye District',
        country: 'Rwanda',
        elevationM: 1750,
      };

      mockFarmerRepo.findByCode.mockResolvedValue(null);
      mockFarmerRepo.create.mockResolvedValue({ id: 'uuid-999', ...dto, createdAt: new Date() });

      const result = await farmerService.createFarmer(dto);

      expect(mockFarmerRepo.findByCode).toHaveBeenCalledWith('FRM-RWA-999');
      expect(mockFarmerRepo.create).toHaveBeenCalledWith(dto);
      expect(result.code).toBe('FRM-RWA-999');
    });

    it('should throw AppError 409 when farmer code already exists', async () => {
      const dto = {
        code: 'FRM-RWA-001',
        name: 'Duplicate Code Farmer',
        region: 'Gisenyi',
        country: 'Rwanda',
      };

      mockFarmerRepo.findByCode.mockResolvedValue({ id: 'existing-id', code: 'FRM-RWA-001' });

      await expect(farmerService.createFarmer(dto)).rejects.toThrow(AppError);
      await expect(farmerService.createFarmer(dto)).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe('getFarmerById()', () => {
    it('should return farmer when found', async () => {
      const farmer = { id: 'uuid-1', code: 'FRM-001', name: 'Alice', region: 'Kigali', country: 'Rwanda' };
      mockFarmerRepo.findById.mockResolvedValue(farmer);

      const result = await farmerService.getFarmerById('uuid-1');

      expect(result).toEqual(farmer);
    });

    it('should throw AppError 404 when farmer does not exist', async () => {
      mockFarmerRepo.findById.mockResolvedValue(null);

      await expect(farmerService.getFarmerById('non-existent')).rejects.toThrow(AppError);
      await expect(farmerService.getFarmerById('non-existent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('getAllFarmers()', () => {
    it('should enforce MAX_PAGE_SIZE = 5 limit', async () => {
      mockFarmerRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 5, totalRecords: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      });

      await farmerService.getAllFarmers(1, 100);

      expect(mockFarmerRepo.findAll).toHaveBeenCalledWith(1, 5, undefined);
    });
  });
});
