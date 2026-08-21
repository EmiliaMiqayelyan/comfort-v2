import { Router } from 'express';
import { downloadController } from './download.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';

const router = Router();

router.get('/', (req, res) => downloadController.list(req, res));
router.get('/:id', (req, res) => downloadController.getOne(req, res));
router.post('/', requireAuth, (req, res) => downloadController.create(req, res));
router.put('/:id', requireAuth, (req, res) => downloadController.update(req, res));
router.delete('/:id', requireAuth, (req, res) => downloadController.delete(req, res));

export { router as downloadRoutes };
