import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { idempotency } from '../middleware/idempotency';
import { checkoutLimiter } from '../middleware/rateLimiter';
import { createOrderSchema, updateOrderStatusSchema } from '../validators';

const router = Router();

// Customer order routes
router.post(
  '/',
  authenticate,
  checkoutLimiter,
  idempotency(3600), // Cache identical checkout requests for 1 hour
  validateBody(createOrderSchema),
  OrderController.createOrder
);

router.get('/my-orders', authenticate, OrderController.listUserOrders);
router.get('/:id', authenticate, OrderController.getOrder);
router.post('/:id/cancel', authenticate, OrderController.cancelOrder);

// Admin order routes
router.get('/', authenticate, authorize('admin'), OrderController.listAllOrders);
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validateBody(updateOrderStatusSchema),
  OrderController.updateStatus
);

export default router;
