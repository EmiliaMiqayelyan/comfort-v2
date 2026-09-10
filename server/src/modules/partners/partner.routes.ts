import { Router } from 'express';
import { partnerController } from './partner.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';

const router = Router();

router.get('/', (req, res) => partnerController.list(req, res));
router.get('/:id', (req, res) => partnerController.getOne(req, res));
router.post('/', requireAuth, (req, res) => partnerController.create(req, res));
router.put('/:id', requireAuth, (req, res) => partnerController.update(req, res));
router.delete('/:id', requireAuth, (req, res) => partnerController.delete(req, res));

export { router as partnerRoutes };
