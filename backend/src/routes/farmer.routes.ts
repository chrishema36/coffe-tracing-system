import { Router } from 'express';
import { FarmerController } from '../controllers/farmer.controller';
import { validateBody } from '../middleware/validate';
import { CreateFarmerSchema, UpdateFarmerSchema } from '../dtos';

export const createFarmerRouter = (farmerController: FarmerController): Router => {
  const router = Router();

  router.get('/', farmerController.getFarmers);
  router.post('/', validateBody(CreateFarmerSchema), farmerController.createFarmer);
  router.get('/:id', farmerController.getFarmerById);
  router.patch('/:id', validateBody(UpdateFarmerSchema), farmerController.updateFarmer);
  router.delete('/:id', farmerController.deleteFarmer);

  return router;
};
