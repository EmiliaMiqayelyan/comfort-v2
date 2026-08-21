import { Router } from 'express';
import { collectionController } from './collection.controller';
import { requireAuth } from '../../app/middleware/auth.middleware';

const router = Router();

router.get('/', (req, res) => collectionController.list(req, res));
router.get('/:slug', (req, res) => collectionController.getOne(req, res));
router.post('/', requireAuth, (req, res) => collectionController.create(req, res));
router.put('/:id', requireAuth, (req, res) => collectionController.update(req, res));
router.delete('/:id', requireAuth, (req, res) => collectionController.delete(req, res));

export { router as collectionRoutes };
