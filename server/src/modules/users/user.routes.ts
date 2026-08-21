import { Router } from 'express';
import { userController } from './user.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, (req, res) => userController.list(req, res));

export { router as userRoutes };
