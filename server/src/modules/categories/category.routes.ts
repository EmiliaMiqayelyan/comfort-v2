import { Router } from 'express';
import { categoryController } from './category.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';

const router = Router();

router.get('/', (req, res) => categoryController.list(req, res));
router.get('/:slug', (req, res) => categoryController.getOne(req, res));
router.post('/', requireAuth, (req, res) => categoryController.create(req, res));
router.put('/:id', requireAuth, (req, res) => categoryController.update(req, res));
router.delete('/:id', requireAuth, (req, res) => categoryController.delete(req, res));

export { router as categoryRoutes };
