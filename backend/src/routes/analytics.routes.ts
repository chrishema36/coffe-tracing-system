import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

export const createAnalyticsRouter = (analyticsController: AnalyticsController): Router => {
  const router = Router();

  router.get('/summary', analyticsController.getDashboardSummary);

  return router;
};
