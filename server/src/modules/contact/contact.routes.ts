import { Router } from 'express';
import { contactController } from './contact.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';

const router = Router();

router.post('/', (req, res) => contactController.create(req, res));
router.get('/', requireAuth, (req, res) => contactController.list(req, res));

export { router as contactRoutes };
