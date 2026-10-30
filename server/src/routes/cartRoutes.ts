import { Router } from 'express';
import { CartController } from '../controllers/cartController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { addToCartSchema, updateCartItemSchema, applyCouponSchema } from '../validators';

const router = Router();

// All cart routes require customer authentication
router.use(authenticate);

router.get('/', CartController.getCart);
router.post('/items', validateBody(addToCartSchema), CartController.addItem);
router.patch('/items/:id', validateBody(updateCartItemSchema), CartController.updateItem);
router.delete('/items/:id', CartController.removeItem);
router.delete('/', CartController.clearCart);

// Coupons
router.post('/coupon', validateBody(applyCouponSchema), CartController.applyCoupon);
router.delete('/coupon', CartController.removeCoupon);

export default router;
