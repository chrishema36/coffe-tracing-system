import request from 'supertest';
import { createApp } from '../../src/app';

describe('API Integration, Validation & Endpoint Tests', () => {
  let app: any;
  let mockPrisma: any;

  beforeEach(() => {
    const now = new Date();
    mockPrisma = {
      farmer: {
        count: jest.fn().mockResolvedValue(12),
        findMany: jest.fn().mockResolvedValue([
          { id: 'f-1', code: 'FRM-001', name: 'Jean Bosco', region: 'Huye', country: 'Rwanda' },
          { id: 'f-2', code: 'FRM-002', name: 'Marie Claire', region: 'Nyamagabe', country: 'Rwanda' },
          { id: 'f-3', code: 'FRM-003', name: 'Alphonse K', region: 'Gisenyi', country: 'Rwanda' },
          { id: 'f-4', code: 'FRM-004', name: 'Clarisse U', region: 'Rulindo', country: 'Rwanda' },
          { id: 'f-5', code: 'FRM-005', name: 'Divine M', region: 'Karongi', country: 'Rwanda' },
        ]),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          const id = where?.OR?.[0]?.id;
          const code = where?.OR?.[1]?.code;
          if (id === 'f-1' || code === 'FRM-001') {
            return Promise.resolve({ id: 'f-1', code: 'FRM-001', name: 'Jean Bosco', region: 'Huye', country: 'Rwanda', _count: { bags: 2 } });
          }
          return Promise.resolve(null);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'f-1' || where.code === 'FRM-001') {
            return Promise.resolve({ id: 'f-1', code: 'FRM-001', name: 'Jean Bosco', region: 'Huye', country: 'Rwanda' });
          }
          return Promise.resolve(null);
        }),
        create: jest.fn().mockResolvedValue({
          id: 'f-new', code: 'FRM-NEW', name: 'New Farmer', region: 'Kigali', country: 'Rwanda'
        }),
      },
      coffeeBag: {
        count: jest.fn().mockResolvedValue(8),
        findMany: jest.fn().mockResolvedValue([
          { id: 'b-1', bagCode: 'BAG-001', initialWeightKg: 60, currentWeightKg: 60, status: 'HARVESTED', variety: 'BOURBON', farmerId: 'f-1', createdAt: now }
        ]),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          const matchCode = where.OR?.find((item: any) => item.bagCode === 'BAG-001' || item.id === 'b-1');
          if (matchCode || where.bagCode === 'BAG-001' || where.id === 'b-1') {
            return Promise.resolve({
              id: 'b-1', bagCode: 'BAG-001', initialWeightKg: 60, currentWeightKg: 60, status: 'HARVESTED', variety: 'BOURBON', farmerId: 'f-1', farmer: { id: 'f-1', code: 'FRM-001', name: 'Jean Bosco', region: 'Huye', country: 'Rwanda' }, createdAt: now
            });
          }
          return Promise.resolve(null);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'b-1' || where.bagCode === 'BAG-001') {
            return Promise.resolve({ id: 'b-1', bagCode: 'BAG-001', initialWeightKg: 60, currentWeightKg: 60, status: 'HARVESTED', variety: 'BOURBON', farmerId: 'f-1', createdAt: now });
          }
          return Promise.resolve(null);
        }),
        create: jest.fn().mockResolvedValue({
          id: 'b-new', bagCode: 'BAG-NEW-01', initialWeightKg: 60, currentWeightKg: 60, status: 'HARVESTED', variety: 'ARABICA', createdAt: now
        }),
        groupBy: jest.fn().mockResolvedValue([
          { variety: 'ARABICA', _count: { id: 5 }, _sum: { initialWeightKg: 300 } },
          { variety: 'BOURBON', _count: { id: 3 }, _sum: { initialWeightKg: 180 } },
        ]),
        aggregate: jest.fn().mockResolvedValue({
          _sum: { initialWeightKg: 480, currentWeightKg: 480 },
        }),
      },
      mergeRelation: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(4),
      },
      $transaction: jest.fn(),
    };

    app = createApp(mockPrisma as any);
  });

  // Health Check
  describe('GET /health', () => {
    it('should return UP status and service info', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toBe('CoffeeTrace Backend API');
    });
  });

  // Farmers API
  describe('GET /api/v1/farmers', () => {
    it('should strictly limit response to 5 records per page', async () => {
      const res = await request(app).get('/api/v1/farmers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should cap high limit values at 5 per strict assessment constraint', async () => {
      const res = await request(app).get('/api/v1/farmers?limit=100');
      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/v1/farmers/:id', () => {
    it('should return farmer by ID when found', async () => {
      const res = await request(app).get('/api/v1/farmers/f-1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('FRM-001');
    });

    it('should return 404 when farmer is not found', async () => {
      const res = await request(app).get('/api/v1/farmers/nonexistent-id');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/farmers', () => {
    it('should reject invalid payloads with 400 validation error', async () => {
      const res = await request(app).post('/api/v1/farmers').send({ code: 'X' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  // Coffee Bags API
  describe('GET /api/v1/bags', () => {
    it('should return paginated bags', async () => {
      const res = await request(app).get('/api/v1/bags');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/v1/bags/:id/trace', () => {
    it('should return lineage trace for valid bag', async () => {
      const res = await request(app).get('/api/v1/bags/BAG-001/trace');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.targetBag.bagCode).toBe('BAG-001');
    });

    it('should return 404 for invalid bag code', async () => {
      const res = await request(app).get('/api/v1/bags/NONEXISTENT/trace');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // Analytics API
  describe('GET /api/v1/analytics/summary', () => {
    it('should return aggregated metrics', async () => {
      const res = await request(app).get('/api/v1/analytics/summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalFarmers).toBeDefined();
      expect(res.body.data.totalCoffeeBags).toBeDefined();
    });
  });
});
