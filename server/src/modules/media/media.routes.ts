import { Router } from 'express';
import { mediaController } from './media.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';
import { upload } from '../../app/middleware/upload.middleware';

const router = Router();

router.get('/', requireAuth, (req, res) => mediaController.list(req, res));
router.post('/', requireAuth, upload.single('file'), (req, res) => mediaController.upload(req, res));

export { router as mediaRoutes };
