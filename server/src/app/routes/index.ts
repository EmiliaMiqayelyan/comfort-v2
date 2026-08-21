import { Router } from 'express';
import { authRoutes } from '../../modules/auth/auth.routes';
import { productRoutes } from '../../modules/products/product.routes';
import { categoryRoutes } from '../../modules/categories/category.routes';
import { collectionRoutes } from '../../modules/collections/collection.routes';
import { projectRoutes } from '../../modules/projects/project.routes';
import { blogRoutes } from '../../modules/blog/blog.routes';
import { userRoutes } from '../../modules/users/user.routes';
import { mediaRoutes } from '../../modules/media/media.routes';
import { contactRoutes } from '../../modules/contact/contact.routes';
import { calculatorRoutes } from '../../modules/calculator/calculator.routes';
import { certificateRoutes } from '../../modules/certificates/certificate.routes';
import { downloadRoutes } from '../../modules/downloads/download.routes';
import { settingsRoutes } from '../../modules/settings/settings.routes';
import { sequelize } from '../../shared/database/sequelize';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/collections', collectionRoutes);
router.use('/projects', projectRoutes);
router.use('/blog', blogRoutes);
router.use('/users', userRoutes);
router.use('/media', mediaRoutes);
router.use('/contact', contactRoutes);
router.use('/calculator', calculatorRoutes);
router.use('/certificates', certificateRoutes);
router.use('/downloads', downloadRoutes);
router.use('/settings', settingsRoutes);

router.get('/health', async (_req, res) => {
  await sequelize.authenticate();
  res.json({ ok: true, service: 'comfort-api', database: 'connected' });
});

export { router as apiRouter };
