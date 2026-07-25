import { Farmer } from '@prisma/client';
import { FarmerRepository } from '../repositories/farmer.repository';
import { CreateFarmerDTO, UpdateFarmerDTO } from '../dtos';
import { PaginatedResult } from '../types';
import { AppError } from '../middleware/errorHandler';

/** Maximum pagination page size — strictly enforced per SLR assessment spec */
const MAX_PAGE_SIZE = 5;

export class FarmerService {
  constructor(private readonly farmerRepo: FarmerRepository) {}

  async createFarmer(data: CreateFarmerDTO): Promise<Farmer> {
    // Enforce unique farmer code
    const existing = await this.farmerRepo.findByCode(data.code);
    if (existing) {
      throw new AppError(409, `Farmer with code '${data.code}' already exists.`);
    }
    return this.farmerRepo.create(data);
  }

  async updateFarmer(idOrCode: string, data: UpdateFarmerDTO): Promise<Farmer> {
    const farmer = await this.farmerRepo.findById(idOrCode);
    if (!farmer) {
      throw new AppError(404, `Farmer with ID or code '${idOrCode}' not found.`);
    }
    return this.farmerRepo.update(farmer.id, data);
  }

  async deleteFarmer(idOrCode: string): Promise<void> {
    const farmer = await this.farmerRepo.findById(idOrCode);
    if (!farmer) {
      throw new AppError(404, `Farmer with ID or code '${idOrCode}' not found.`);
    }

    const bagCount = await this.farmerRepo.countBags(farmer.id);
    if (bagCount > 0) {
      throw new AppError(
        409,
        `Cannot delete farmer '${farmer.code}': ${bagCount} coffee bag(s) are still linked. Reassign or archive bags first.`
      );
    }

    await this.farmerRepo.delete(farmer.id);
  }

  async getFarmerById(id: string): Promise<Farmer> {
    const farmer = await this.farmerRepo.findById(id);
    if (!farmer) {
      throw new AppError(404, `Farmer with ID or code '${id}' not found.`);
    }
    return farmer;
  }

  async getAllFarmers(
    page: number = 1,
    limit: number = MAX_PAGE_SIZE,
    search?: string
  ): Promise<PaginatedResult<Farmer>> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit));
    return this.farmerRepo.findAll(safePage, safeLimit, search);
  }
}
