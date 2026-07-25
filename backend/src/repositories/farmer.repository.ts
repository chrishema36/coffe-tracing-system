import { PrismaClient, Farmer, Prisma } from '@prisma/client';
import { CreateFarmerDTO, UpdateFarmerDTO } from '../dtos';
import { PaginatedResult } from '../types';

export class FarmerRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateFarmerDTO): Promise<Farmer> {
    return this.prisma.farmer.create({
      data,
    });
  }

  async update(id: string, data: UpdateFarmerDTO): Promise<Farmer> {
    return this.prisma.farmer.update({
      where: { id },
      data: data as Prisma.FarmerUpdateInput,
      include: {
        _count: { select: { bags: true } },
      },
    });
  }

  async delete(id: string): Promise<Farmer> {
    return this.prisma.farmer.delete({
      where: { id },
    });
  }

  async countBags(farmerId: string): Promise<number> {
    return this.prisma.coffeeBag.count({ where: { farmerId } });
  }

  async findById(id: string): Promise<Farmer | null> {
    return this.prisma.farmer.findFirst({
      where: {
        OR: [{ id }, { code: id }],
      },
      include: {
        bags: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: {
          select: { bags: true },
        },
      },
    });
  }

  async findByCode(code: string): Promise<Farmer | null> {
    return this.prisma.farmer.findUnique({
      where: { code },
    });
  }

  async findAll(page: number = 1, limit: number = 5, search?: string): Promise<PaginatedResult<Farmer>> {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
            { region: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [totalRecords, data] = await Promise.all([
      this.prisma.farmer.count({ where }),
      this.prisma.farmer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { bags: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      data,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async count(): Promise<number> {
    return this.prisma.farmer.count();
  }
}
