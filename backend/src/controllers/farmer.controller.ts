import { Request, Response, NextFunction } from 'express';
import { FarmerService } from '../services/farmer.service';
import { ApiResponse } from '../types';

export class FarmerController {
  constructor(private farmerService: FarmerService) {}

  createFarmer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const farmer = await this.farmerService.createFarmer(req.body);
      const response: ApiResponse<typeof farmer> = {
        success: true,
        message: 'Farmer created successfully',
        data: farmer,
        timestamp: new Date().toISOString(),
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getFarmers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 5;
      const search = req.query.search as string;

      const result = await this.farmerService.getAllFarmers(page, limit, search);
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

  getFarmerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const farmer = await this.farmerService.getFarmerById(req.params.id);
      const response: ApiResponse<typeof farmer> = {
        success: true,
        data: farmer,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
