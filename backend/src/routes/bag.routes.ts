import { Router } from 'express';
import { BagController } from '../controllers/bag.controller';
import { validateBody } from '../middleware/validate';
import { CreateBagSchema, MergeBagsSchema } from '../dtos';

export const createBagRouter = (bagController: BagController): Router => {
  const router = Router();

  router.get('/', bagController.getBags);
  router.post('/', validateBody(CreateBagSchema), bagController.createBag);
  router.post('/merge', validateBody(MergeBagsSchema), bagController.mergeBags);
  router.get('/:id', bagController.getBagById);
  router.get('/:id/trace', bagController.getBagTrace);

  return router;
};
