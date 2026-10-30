import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../validators';

const router = Router();

// Public routes
router.get('/', ProductController.listProducts);
router.get('/:id', ProductController.getProduct);

// Admin-protected routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateBody(createProductSchema),
  ProductController.createProduct
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validateBody(updateProductSchema),
  ProductController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  ProductController.deleteProduct
);

export default router;
