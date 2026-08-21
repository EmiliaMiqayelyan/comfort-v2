import { Router } from 'express';
import { certificateController } from './certificate.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';

const router = Router();

router.get('/', (req, res) => certificateController.list(req, res));
router.get('/:id', (req, res) => certificateController.getOne(req, res));
router.post('/', requireAuth, (req, res) => certificateController.create(req, res));
router.put('/:id', requireAuth, (req, res) => certificateController.update(req, res));
router.delete('/:id', requireAuth, (req, res) => certificateController.delete(req, res));

export { router as certificateRoutes };
