import { Farmer } from '@prisma/client';
import { FarmerRepository } from '../repositories/farmer.repository';
import { CreateFarmerDTO } from '../dtos';
import { PaginatedResult } from '../types';
import { AppError } from '../middleware/errorHandler';

export class FarmerService {
  constructor(private farmerRepo: FarmerRepository) {}

  async createFarmer(data: CreateFarmerDTO): Promise<Farmer> {
    const existing = await this.farmerRepo.findByCode(data.code);
    if (existing) {
      throw new AppError(409, `Farmer with code '${data.code}' already exists.`);
    }
    return this.farmerRepo.create(data);
  }

  async getFarmerById(id: string): Promise<Farmer> {
    const farmer = await this.farmerRepo.findById(id);
    if (!farmer) {
      throw new AppError(404, `Farmer with ID '${id}' not found.`);
    }
    return farmer;
  }

  async getAllFarmers(
    page: number = 1,
    limit: number = 5,
    search?: string
  ): Promise<PaginatedResult<Farmer>> {
    // Enforce strict 5 per page maximum constraint
    const safeLimit = Math.min(5, Math.max(1, limit));
    return this.farmerRepo.findAll(page, safeLimit, search);
  }
}
