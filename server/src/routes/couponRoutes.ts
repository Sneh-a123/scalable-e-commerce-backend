import { Router } from 'express';
import { CouponController } from '../controllers/couponController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createCouponSchema } from '../validators';

const router = Router();

// Validate coupon route (public for customers)
router.post('/validate', CouponController.validateCoupon);

// Admin-protected coupon management
router.get('/', authenticate, authorize('admin'), CouponController.listCoupons);
router.post('/', authenticate, authorize('admin'), validateBody(createCouponSchema), CouponController.createCoupon);
router.delete('/:id', authenticate, authorize('admin'), CouponController.deleteCoupon);

export default router;
