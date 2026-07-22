import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

import { FarmerRepository } from '../repositories/farmer.repository';
import { BagRepository } from '../repositories/bag.repository';

import { TraceabilityService } from '../services/traceability.service';
import { FarmerService } from '../services/farmer.service';
import { BagService } from '../services/bag.service';
import { AnalyticsService } from '../services/analytics.service';

import { FarmerController } from '../controllers/farmer.controller';
import { BagController } from '../controllers/bag.controller';
import { AnalyticsController } from '../controllers/analytics.controller';

import { createFarmerRouter } from './farmer.routes';
import { createBagRouter } from './bag.routes';
import { createAnalyticsRouter } from './analytics.routes';

/**
 * Composition Root — all dependency wiring lives here.
 * This is the only place that knows the full object graph.
 * All services receive their dependencies via constructor injection.
 */
export const createApiRouter = (prisma: PrismaClient): Router => {
  const apiRouter = Router();

  // --- Repositories (Data Access Layer) ---
  const farmerRepo = new FarmerRepository(prisma);
  const bagRepo = new BagRepository(prisma);

  // --- Services (Business Logic Layer) ---
  const traceService = new TraceabilityService(prisma);
  const farmerService = new FarmerService(farmerRepo);
  const bagService = new BagService(bagRepo, farmerRepo, traceService);
  const analyticsService = new AnalyticsService(prisma);

  // --- Controllers (HTTP Presentation Layer) ---
  const farmerController = new FarmerController(farmerService);
  const bagController = new BagController(bagService, traceService);
  const analyticsController = new AnalyticsController(analyticsService);

  // API root — service discovery
  apiRouter.get('/', (_req, res) => {
    res.json({
      name: 'CoffeeTrace Traceability System REST API',
      version: 'v1',
      status: 'ONLINE',
      documentation: '/docs',
      endpoints: {
        farmers: '/api/v1/farmers',
        bags: '/api/v1/bags',
        analytics: '/api/v1/analytics/summary',
        health: '/health',
      },
    });
  });

  // Mount API Sub-routers
  apiRouter.use('/farmers', createFarmerRouter(farmerController));
  apiRouter.use('/bags', createBagRouter(bagController));
  apiRouter.use('/analytics', createAnalyticsRouter(analyticsController));

  return apiRouter;
};

// ============================================================
// Swagger / OpenAPI 3.0 Specification
// ============================================================
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'CoffeeTrace — Supply Chain Traceability REST API',
    version: '1.0.0',
    description:
      'Production-grade REST API for the SLR Enterprise Coffee Traceability Platform. ' +
      'Supports smallholder farmer management, multi-tier harvest bag tracking, ' +
      'recursive merge lineage, and farmer origin percentage attribution.\n\n' +
      '**Strict pagination constraint:** All list endpoints enforce a maximum of **5 records per page**.',
    contact: {
      name: 'SLR Enterprise CoffeeTrace',
      url: 'http://localhost:3000',
    },
  },
  servers: [
    { url: 'http://localhost:4000/api/v1', description: 'Local Development Server' },
  ],
  components: {
    schemas: {
      Farmer: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
          code: { type: 'string', example: 'FRM-RWA-001' },
          name: { type: 'string', example: 'Jean-Luc Habimana' },
          email: { type: 'string', format: 'email', example: 'habimana@huye.rw' },
          phone: { type: 'string', example: '+250-788-111-222' },
          region: { type: 'string', example: 'Huye District, Southern Province' },
          country: { type: 'string', example: 'Rwanda' },
          elevationM: { type: 'integer', example: 1850 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CoffeeBag: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          bagCode: { type: 'string', example: 'BAG-RWA-2026-H1' },
          initialWeightKg: { type: 'number', example: 60.0 },
          currentWeightKg: { type: 'number', example: 60.0 },
          moisturePercent: { type: 'number', example: 11.2 },
          qualityScore: { type: 'integer', example: 89 },
          variety: { type: 'string', enum: ['ARABICA', 'ROBUSTA', 'TYPICA', 'BOURBON', 'GEISHA'], example: 'BOURBON' },
          status: { type: 'string', enum: ['HARVESTED', 'IN_STORAGE', 'MERGED', 'EXPORTED'], example: 'HARVESTED' },
          farmerId: { type: 'string', format: 'uuid', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      FarmerAttribution: {
        type: 'object',
        properties: {
          farmerId: { type: 'string', format: 'uuid' },
          farmerCode: { type: 'string', example: 'FRM-RWA-001' },
          farmerName: { type: 'string', example: 'Jean-Luc Habimana' },
          region: { type: 'string', example: 'Huye District' },
          country: { type: 'string', example: 'Rwanda' },
          contributedWeightKg: { type: 'number', example: 60.0 },
          contributionPercentage: { type: 'number', example: 60.0 },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 5, description: 'Capped at 5 per strict assessment constraint' },
          totalRecords: { type: 'integer', example: 24 },
          totalPages: { type: 'integer', example: 5 },
          hasNextPage: { type: 'boolean' },
          hasPrevPage: { type: 'boolean' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Record not found.' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed.' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'bagCode' },
                message: { type: 'string', example: 'Bag code is required' },
              },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/farmers': {
      get: {
        tags: ['Farmers'],
        summary: 'List Registered Farmers',
        description: 'Get paginated list of registered smallholder coffee farmers. Limit is strictly capped at **5 records per page**. Supports free-text search across name, code, and region.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 }, description: 'Page number (1-indexed)' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 5, maximum: 5 }, description: 'Records per page (max 5)' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by farmer name, code, or region' },
        ],
        responses: {
          '200': {
            description: 'Successfully retrieved paginated farmer list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Farmer' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Farmers'],
        summary: 'Register a New Farmer',
        description: 'Onboard a new smallholder coffee farmer to the traceability platform.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'name', 'region'],
                properties: {
                  code: { type: 'string', example: 'FRM-RWA-007', minLength: 3 },
                  name: { type: 'string', example: 'Alphonse Kayitare', minLength: 2 },
                  email: { type: 'string', format: 'email', example: 'kayitare@huye.rw' },
                  phone: { type: 'string', example: '+250-788-999-000' },
                  region: { type: 'string', example: 'Huye District, Southern Province' },
                  country: { type: 'string', example: 'Rwanda', default: 'Rwanda' },
                  elevationM: { type: 'integer', example: 1900, minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Farmer registered successfully' },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
          '409': { description: 'Farmer code already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/farmers/{id}': {
      get: {
        tags: ['Farmers'],
        summary: 'Get Farmer Details',
        description: 'Retrieve a single farmer record by UUID or farmer code.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'FRM-RWA-001', description: 'Farmer UUID or code' }],
        responses: {
          '200': { description: 'Farmer details returned' },
          '404': { description: 'Farmer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/bags': {
      get: {
        tags: ['Coffee Bags'],
        summary: 'List Coffee Bags',
        description: 'Get paginated list of coffee bags. Supports filtering by status and variety, and free-text search. Limit strictly capped at 5.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 5, maximum: 5 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['HARVESTED', 'IN_STORAGE', 'MERGED', 'EXPORTED'] } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by bag code or farmer name' },
        ],
        responses: {
          '200': { description: 'Paginated coffee bags list' },
        },
      },
      post: {
        tags: ['Coffee Bags'],
        summary: 'Log Harvested Coffee Bag',
        description: 'Log a new single-farmer harvested coffee bag into the traceability system.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bagCode', 'initialWeightKg', 'variety', 'farmerId'],
                properties: {
                  bagCode: { type: 'string', example: 'BAG-RWA-2026-X9', minLength: 3 },
                  initialWeightKg: { type: 'number', example: 60.0, minimum: 0.01 },
                  moisturePercent: { type: 'number', example: 11.2, minimum: 0, maximum: 100 },
                  qualityScore: { type: 'integer', example: 89, minimum: 1, maximum: 100 },
                  variety: { type: 'string', enum: ['ARABICA', 'ROBUSTA', 'TYPICA', 'BOURBON', 'GEISHA'], example: 'BOURBON' },
                  farmerId: { type: 'string', format: 'uuid', description: 'UUID of the farmer who harvested this bag' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Coffee bag created successfully' },
          '400': { description: 'Validation error or duplicate bag code' },
          '404': { description: 'Farmer not found' },
        },
      },
    },
    '/bags/merge': {
      post: {
        tags: ['Coffee Bags'],
        summary: 'Execute Multi-Tier Bag Merge',
        description: 'Merge 2+ existing source bags into a new composite target lot. Source bags are marked MERGED. A new MergeRelation edge is created for each source→target pair. Cycle detection is enforced.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['targetBagCode', 'sourceBagIds'],
                properties: {
                  targetBagCode: { type: 'string', example: 'EXPORT-RWANDA-LOT-02', minLength: 3 },
                  sourceBagIds: {
                    type: 'array',
                    minItems: 2,
                    items: { type: 'string', format: 'uuid' },
                    description: 'UUIDs of all source bags to merge (minimum 2)',
                  },
                  variety: { type: 'string', enum: ['ARABICA', 'ROBUSTA', 'TYPICA', 'BOURBON', 'GEISHA'] },
                  moisturePercent: { type: 'number', example: 11.0 },
                  qualityScore: { type: 'integer', example: 93 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Merge executed — new composite bag created' },
          '400': { description: 'Cycle detected, invalid source bags, or duplicate target code' },
        },
      },
    },
    '/bags/{id}': {
      get: {
        tags: ['Coffee Bags'],
        summary: 'Get Coffee Bag Details',
        description: 'Retrieve a single coffee bag by its UUID or bag code, including farmer and merge relation details.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Bag UUID or bag code (e.g. EXPORT-SUPER-LOT-01)' }],
        responses: {
          '200': { description: 'Coffee bag details' },
          '404': { description: 'Bag not found' },
        },
      },
    },
    '/bags/{id}/trace': {
      get: {
        tags: ['Traceability'],
        summary: '⭐ Execute Recursive Backward Lineage Trace',
        description:
          'Core traceability engine. Executes BFS traversal up the merge DAG from the target bag to all original farmer harvest bags. ' +
          'Returns the complete lineage graph (nodes + directed edges) and per-farmer origin attribution percentages. ' +
          'Cycle-safe with O(N+E) complexity. Supports unlimited recursion depth (capped at 100 levels).\n\n' +
          '**Example:** Trace `EXPORT-SUPER-LOT-01` to see recursive farmer attributions across 3 tiers.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'EXPORT-SUPER-LOT-01', description: 'Bag UUID or bag code to trace' },
        ],
        responses: {
          '200': {
            description: 'Traceability result with lineage DAG and farmer attributions',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        targetBag: { $ref: '#/components/schemas/CoffeeBag' },
                        totalOriginFarmersCount: { type: 'integer', example: 4 },
                        farmerAttributions: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/FarmerAttribution' },
                        },
                        graphNodes: { type: 'array', items: { type: 'object' } },
                        graphEdges: { type: 'array', items: { type: 'object' } },
                      },
                    },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '404': { description: 'Bag not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/analytics/summary': {
      get: {
        tags: ['Analytics'],
        summary: 'Dashboard Summary Metrics',
        description: 'Retrieve aggregated supply chain metrics: total farmers, total bags, volume by variety, active storage counts, and recent activity feed.',
        responses: {
          '200': { description: 'Dashboard summary data' },
        },
      },
    },
  },
};
