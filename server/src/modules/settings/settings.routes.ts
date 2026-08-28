import { Router } from 'express';
import { settingsController } from './settings.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';

const router = Router();

router.get('/contact', (req, res) => settingsController.getContact(req, res));
router.put('/contact', requireAuth, (req, res) => settingsController.updateContact(req, res));
router.get('/hero', (req, res) => settingsController.getHero(req, res));
router.put('/hero', requireAuth, (req, res) => settingsController.updateHero(req, res));

export { router as settingsRoutes };
