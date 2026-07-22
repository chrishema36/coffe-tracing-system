import { PrismaClient } from '@prisma/client';
import { DashboardSummary } from '../types';

/**
 * AnalyticsService encapsulates all dashboard/reporting business logic.
 * Extracted from AnalyticsController to adhere to Single Responsibility Principle.
 */
export class AnalyticsService {
  constructor(private prisma: PrismaClient) {}

  async getDashboardSummary(): Promise<DashboardSummary> {
    const [totalFarmers, totalBags, volumeAgg, activeBags, varietyGroup, recentBags, recentMerges] =
      await Promise.all([
        this.prisma.farmer.count(),
        this.prisma.coffeeBag.count(),
        this.prisma.coffeeBag.aggregate({
          _sum: { initialWeightKg: true, currentWeightKg: true },
        }),
        this.prisma.coffeeBag.count({ where: { status: 'IN_STORAGE' } }),
        this.prisma.coffeeBag.groupBy({
          by: ['variety'],
          _count: { id: true },
          _sum: { initialWeightKg: true },
        }),
        // 5 most recently created harvest bags
        this.prisma.coffeeBag.findMany({
          where: { status: { not: 'MERGED' } },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, bagCode: true, createdAt: true, status: true },
        }),
        // 5 most recently merged bags
        this.prisma.coffeeBag.findMany({
          where: { status: { in: ['MERGED', 'IN_STORAGE', 'EXPORTED'] }, farmerId: null },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, bagCode: true, createdAt: true, status: true },
        }),
      ]);

    const varietyBreakdown = varietyGroup.map(
      (v: { variety: string; _count: { id: number }; _sum: { initialWeightKg: number | null } }) => ({
        variety: v.variety,
        count: v._count.id,
        volumeKg: v._sum.initialWeightKg ?? 0,
      })
    );

    // Build recent activity from bag events
    const recentActivity = [
      ...recentBags.map((b) => ({
        id: b.id,
        type: 'BAG_CREATED' as const,
        bagCode: b.bagCode,
        details: `Harvest bag ${b.bagCode} logged with status ${b.status}`,
        timestamp: b.createdAt,
      })),
      ...recentMerges.map((b) => ({
        id: b.id,
        type: 'BAG_MERGED' as const,
        bagCode: b.bagCode,
        details: `Composite lot ${b.bagCode} created via merge`,
        timestamp: b.createdAt,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8);

    return {
      totalFarmers,
      totalCoffeeBags: totalBags,
      totalCoffeeVolumeKg: volumeAgg._sum.initialWeightKg ?? 0,
      totalMergedVolumeKg:
        (volumeAgg._sum.initialWeightKg ?? 0) - (volumeAgg._sum.currentWeightKg ?? 0),
      activeStorageBagsCount: activeBags,
      varietyBreakdown,
      recentActivity,
    };
  }
}
