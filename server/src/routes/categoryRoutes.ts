import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createCategorySchema } from '../validators';

const router = Router();

router.get('/', optionalAuthenticate, CategoryController.listCategories);
router.get('/:slug', CategoryController.getCategory);

// Admin-protected
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateBody(createCategorySchema),
  CategoryController.createCategory
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  CategoryController.deleteCategory
);

export default router;
