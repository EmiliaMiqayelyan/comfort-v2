import { Router } from 'express';
import { projectController } from './project.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';

const router = Router();

router.get('/', (req, res) => projectController.list(req, res));
router.get('/:slug', (req, res) => projectController.getOne(req, res));
router.post('/', requireAuth, (req, res) => projectController.create(req, res));
router.put('/:id', requireAuth, (req, res) => projectController.update(req, res));
router.delete('/:id', requireAuth, (req, res) => projectController.delete(req, res));

export { router as projectRoutes };
