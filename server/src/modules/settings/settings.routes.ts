import { Router } from 'express';
import { settingsController } from './settings.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';

const router = Router();

router.get('/contact', (req, res) => settingsController.getContact(req, res));
router.put('/contact', requireAuth, (req, res) => settingsController.updateContact(req, res));

export { router as settingsRoutes };
