import { CreateFarmerSchema, CreateBagSchema, MergeBagsSchema, UpdateFarmerSchema } from '../../src/dtos';

describe('Zod Validation DTO Schemas (Unit Tests)', () => {
  describe('CreateFarmerSchema', () => {
    it('should validate a valid farmer payload', () => {
      const input = {
        code: 'FRM-RWA-001',
        name: 'Jean-Luc Habimana',
        email: 'habimana@huye.rw',
        phone: '+250-788-111-222',
        region: 'Huye District',
        country: 'Rwanda',
        elevationM: 1850,
      };
      const result = CreateFarmerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail when farmer code is missing or too short', () => {
      const input = {
        code: 'AB',
        name: 'Short Code',
        region: 'Region',
      };
      const result = CreateFarmerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should fail when email is invalid', () => {
      const input = {
        code: 'FRM-001',
        name: 'Valid Name',
        email: 'invalid-email-format',
        region: 'Region',
      };
      const result = CreateFarmerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateFarmerSchema', () => {
    it('should accept a partial update payload', () => {
      const result = UpdateFarmerSchema.safeParse({ name: 'Updated Name', region: 'Rubavu' });
      expect(result.success).toBe(true);
    });

    it('should reject an empty update payload', () => {
      const result = UpdateFarmerSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('CreateBagSchema', () => {
    it('should validate a valid bag payload', () => {
      const input = {
        bagCode: 'BAG-RWA-2026-01',
        initialWeightKg: 60.0,
        moisturePercent: 11.2,
        qualityScore: 88,
        variety: 'BOURBON',
        farmerId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const result = CreateBagSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail when initialWeightKg is negative or zero', () => {
      const input = {
        bagCode: 'BAG-ZERO',
        initialWeightKg: 0,
        variety: 'ARABICA',
        farmerId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const result = CreateBagSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('MergeBagsSchema', () => {
    it('should validate a valid merge payload with at least 2 source bags', () => {
      const input = {
        targetBagCode: 'EXPORT-LOT-01',
        sourceBagIds: [
          '550e8400-e29b-41d4-a716-446655440000',
          '550e8400-e29b-41d4-a716-446655440001',
        ],
        variety: 'BOURBON',
      };
      const result = MergeBagsSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sources).toHaveLength(2);
      }
    });

    it('should validate partial-weight sources payload', () => {
      const result = MergeBagsSchema.safeParse({
        targetBagCode: 'EXPORT-LOT-02',
        sources: [
          { bagId: '550e8400-e29b-41d4-a716-446655440000', weightUsedKg: 20 },
          { bagId: '550e8400-e29b-41d4-a716-446655440001', weightUsedKg: 15 },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should fail when fewer than 2 source bags are provided', () => {
      const input = {
        targetBagCode: 'EXPORT-LOT-01',
        sourceBagIds: ['550e8400-e29b-41d4-a716-446655440000'],
      };
      const result = MergeBagsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
