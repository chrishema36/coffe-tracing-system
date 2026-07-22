import { Request, Response, NextFunction } from 'express';
import { BagService } from '../services/bag.service';
import { TraceabilityService } from '../services/traceability.service';
import { ApiResponse } from '../types';
import { BagStatus } from '@prisma/client';

export class BagController {
  constructor(
    private bagService: BagService,
    private traceService: TraceabilityService
  ) {}

  createBag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bag = await this.bagService.createBag(req.body);
      const response: ApiResponse<typeof bag> = {
        success: true,
        message: 'Coffee bag created successfully',
        data: bag,
        timestamp: new Date().toISOString(),
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getBags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 5;
      const status = req.query.status as BagStatus | undefined;
      const search = req.query.search as string | undefined;

      const result = await this.bagService.getAllBags(page, limit, status, search);
      const response: ApiResponse<typeof result.data> = {
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getBagById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bag = await this.bagService.getBagById(req.params.id);
      const response: ApiResponse<typeof bag> = {
        success: true,
        data: bag,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  mergeBags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetBag = await this.bagService.mergeBags(req.body);
      const response: ApiResponse<typeof targetBag> = {
        success: true,
        message: 'Coffee bags merged successfully',
        data: targetBag,
        timestamp: new Date().toISOString(),
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getBagTrace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const traceResult = await this.traceService.getBackwardTrace(req.params.id);
      const response: ApiResponse<typeof traceResult> = {
        success: true,
        data: traceResult,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
