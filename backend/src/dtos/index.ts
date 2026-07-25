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

/** Farmer code is immutable after registration */
export const UpdateFarmerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').nullish(),
    phone: z.string().nullish(),
    region: z.string().min(2, 'Region is required').optional(),
    country: z.string().min(2).optional(),
    elevationM: z.number().int().positive().nullish(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'At least one field must be provided to update',
  });

export const CreateBagSchema = z.object({
  bagCode: z.string().min(3, 'Bag code is required'),
  initialWeightKg: z.number().positive('Initial weight must be greater than 0'),
  moisturePercent: z.number().min(0).max(100).optional(),
  qualityScore: z.number().int().min(1).max(100).optional(),
  variety: z.nativeEnum(CoffeeVariety).default(CoffeeVariety.ARABICA),
  farmerId: z.string().uuid('Farmer ID must be a valid UUID'),
});

const MergeSourceSchema = z.object({
  bagId: z.string().uuid(),
  /** Optional partial weight; defaults to the bag's full currentWeightKg */
  weightUsedKg: z.number().positive('Weight used must be greater than 0').optional(),
});

export const MergeBagsSchema = z
  .object({
    /** Preferred: per-source weights for partial merges */
    sources: z.array(MergeSourceSchema).min(2).optional(),
    /** Legacy: full-weight merge from bag IDs only */
    sourceBagIds: z.array(z.string().uuid()).min(2).optional(),
    targetBagCode: z.string().min(3, 'Target bag code is required'),
    variety: z.nativeEnum(CoffeeVariety).optional(),
    moisturePercent: z.number().min(0).max(100).optional(),
    qualityScore: z.number().int().min(1).max(100).optional(),
  })
  .refine((data) => (data.sources?.length ?? 0) >= 2 || (data.sourceBagIds?.length ?? 0) >= 2, {
    message: 'Must provide at least 2 source bags to merge',
    path: ['sources'],
  })
  .transform((data) => {
    const sources =
      data.sources ??
      (data.sourceBagIds ?? []).map((bagId) => ({ bagId, weightUsedKg: undefined as number | undefined }));
    return {
      sources,
      targetBagCode: data.targetBagCode,
      variety: data.variety,
      moisturePercent: data.moisturePercent,
      qualityScore: data.qualityScore,
    };
  });

export type CreateFarmerDTO = z.infer<typeof CreateFarmerSchema>;
export type UpdateFarmerDTO = z.infer<typeof UpdateFarmerSchema>;
export type CreateBagDTO = z.infer<typeof CreateBagSchema>;
export type MergeBagsDTO = {
  sources: { bagId: string; weightUsedKg?: number }[];
  targetBagCode: string;
  variety?: CoffeeVariety;
  moisturePercent?: number;
  qualityScore?: number;
};