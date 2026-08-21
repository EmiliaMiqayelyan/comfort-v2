import { Router } from 'express';
import { blogController } from './blog.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';

const router = Router();

router.get('/', (req, res) => blogController.list(req, res));
router.get('/:slug', (req, res) => blogController.getOne(req, res));
router.post('/', requireAuth, (req, res) => blogController.create(req, res));
router.put('/:id', requireAuth, (req, res) => blogController.update(req, res));
router.delete('/:id', requireAuth, (req, res) => blogController.delete(req, res));

export { router as blogRoutes };
