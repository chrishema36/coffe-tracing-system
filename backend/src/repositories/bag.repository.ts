import { PrismaClient, CoffeeBag, BagStatus, Prisma } from '@prisma/client';
import { CreateBagDTO } from '../dtos';
import { PaginatedResult } from '../types';

export class BagRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateBagDTO): Promise<CoffeeBag> {
    return this.prisma.coffeeBag.create({
      data: {
        bagCode: data.bagCode,
        initialWeightKg: data.initialWeightKg,
        currentWeightKg: data.initialWeightKg,
        moisturePercent: data.moisturePercent,
        qualityScore: data.qualityScore,
        variety: data.variety,
        status: BagStatus.HARVESTED,
        farmerId: data.farmerId,
      },
      include: {
        farmer: true,
      },
    });
  }

  async findById(id: string): Promise<CoffeeBag | null> {
    return this.prisma.coffeeBag.findFirst({
      where: {
        OR: [{ id }, { bagCode: id }],
      },
      include: {
        farmer: true,
        parentRelations: { include: { parentBag: true } },
        childRelations: { include: { childBag: true } },
      },
    });
  }

  async findByCode(bagCode: string): Promise<CoffeeBag | null> {
    return this.prisma.coffeeBag.findUnique({
      where: { bagCode },
      include: {
        farmer: true,
      },
    });
  }

  async findManyByIds(ids: string[]): Promise<CoffeeBag[]> {
    return this.prisma.coffeeBag.findMany({
      where: { id: { in: ids } },
      include: { farmer: true },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 5,
    status?: BagStatus,
    search?: string
  ): Promise<PaginatedResult<CoffeeBag>> {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { bagCode: { contains: search, mode: 'insensitive' } },
        { farmer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [totalRecords, data] = await Promise.all([
      this.prisma.coffeeBag.count({ where }),
      this.prisma.coffeeBag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          farmer: true,
          _count: { select: { parentRelations: true, childRelations: true } },
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

  async createMerge(
    sourceBagIds: string[],
    targetBagData: {
      bagCode: string;
      initialWeightKg: number;
      variety?: CoffeeBag['variety'];
      moisturePercent?: number;
      qualityScore?: number;
    }
  ): Promise<CoffeeBag> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create target merged bag
      const targetBag = await tx.coffeeBag.create({
        data: {
          bagCode: targetBagData.bagCode,
          initialWeightKg: targetBagData.initialWeightKg,
          currentWeightKg: targetBagData.initialWeightKg,
          variety: targetBagData.variety,
          moisturePercent: targetBagData.moisturePercent,
          qualityScore: targetBagData.qualityScore,
          status: BagStatus.IN_STORAGE,
          farmerId: null,
        },
      });

      // 2. Fetch source bags
      const sourceBags = await tx.coffeeBag.findMany({
        where: { id: { in: sourceBagIds } },
      });

      // 3. Create MergeRelations and update source bags status
      for (const source of sourceBags) {
        await tx.mergeRelation.create({
          data: {
            parentBagId: source.id,
            childBagId: targetBag.id,
            weightUsedKg: source.currentWeightKg,
          },
        });

        await tx.coffeeBag.update({
          where: { id: source.id },
          data: {
            currentWeightKg: 0.0,
            status: BagStatus.MERGED,
          },
        });
      }

      return tx.coffeeBag.findUniqueOrThrow({
        where: { id: targetBag.id },
        include: {
          parentRelations: { include: { parentBag: { include: { farmer: true } } } },
        },
      });
    });
  }

  async count(): Promise<number> {
    return this.prisma.coffeeBag.count();
  }
}
