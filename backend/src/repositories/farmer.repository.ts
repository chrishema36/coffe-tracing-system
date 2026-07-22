import { PrismaClient, Farmer } from '@prisma/client';
import { CreateFarmerDTO } from '../dtos';
import { PaginatedResult } from '../types';

export class FarmerRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateFarmerDTO): Promise<Farmer> {
    return this.prisma.farmer.create({
      data,
    });
  }

  async findById(id: string): Promise<Farmer | null> {
    return this.prisma.farmer.findUnique({
      where: { id },
      include: {
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
