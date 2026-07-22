import { z } from 'zod';
import { CoffeeVariety } from '@prisma/client';

export const PaginationQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  // STRICT CONSTRAINT: Limit defaults to 5 and is strictly capped at max 5
  limit: z.string().optional().transform((val) => {
    if (!val) return 5;
    const parsed = parseInt(val, 10);
    return Math.min(5, Math.max(1, parsed));
  }),
});

export const CreateFarmerSchema = z.object({
  code: z.string().min(3, 'Farmer code must be at least 3 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  region: z.string().min(2, 'Region is required'),
  country: z.string().default('Rwanda'),
  elevationM: z.number().int().positive().optional(),
});

export const CreateBagSchema = z.object({
  bagCode: z.string().min(3, 'Bag code is required'),
  initialWeightKg: z.number().positive('Initial weight must be greater than 0'),
  moisturePercent: z.number().min(0).max(100).optional(),
  qualityScore: z.number().int().min(1).max(100).optional(),
  variety: z.nativeEnum(CoffeeVariety).default(CoffeeVariety.ARABICA),
  farmerId: z.string().uuid('Farmer ID must be a valid UUID'),
});

export const MergeBagsSchema = z.object({
  sourceBagIds: z.array(z.string().uuid()).min(2, 'Must provide at least 2 source bags to merge'),
  targetBagCode: z.string().min(3, 'Target bag code is required'),
  variety: z.nativeEnum(CoffeeVariety).optional(),
  moisturePercent: z.number().min(0).max(100).optional(),
  qualityScore: z.number().int().min(1).max(100).optional(),
});

export type CreateFarmerDTO = z.infer<typeof CreateFarmerSchema>;
export type CreateBagDTO = z.infer<typeof CreateBagSchema>;
export type MergeBagsDTO = z.infer<typeof MergeBagsSchema>;
