import { Router } from 'express';
import { authController } from './auth.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';

const router = Router();

router.post('/login', (req, res) => authController.login(req, res));
router.get('/me', requireAuth, (req, res) => authController.me(req, res));

export { router as authRoutes };
