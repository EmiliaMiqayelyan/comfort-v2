import { Router } from 'express';
import { productController } from './product.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';

const router = Router();

router.get('/', (req, res) => productController.list(req, res));
router.get('/:slug', (req, res) => productController.getOne(req, res));
router.post('/', requireAuth, (req, res) => productController.create(req, res));
router.put('/:id', requireAuth, (req, res) => productController.update(req, res));
router.delete('/:id', requireAuth, (req, res) => productController.delete(req, res));

export { router as productRoutes };
