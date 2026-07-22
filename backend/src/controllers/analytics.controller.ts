import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { ApiResponse, DashboardSummary } from '../types';

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  getDashboardSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.analyticsService.getDashboardSummary();
      const response: ApiResponse<DashboardSummary> = {
        success: true,
        data: summary,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
