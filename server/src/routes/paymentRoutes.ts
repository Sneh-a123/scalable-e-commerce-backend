import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { verifyPaymentSchema } from '../validators';

const router = Router();

router.post('/create-order', authenticate, PaymentController.createOrder);
router.post('/verify', authenticate, validateBody(verifyPaymentSchema), PaymentController.verify);
router.get('/:id', authenticate, PaymentController.getPayment);

// Admin-only payment endpoints
router.get('/', authenticate, authorize('admin'), PaymentController.listPayments);
router.post('/:id/refund', authenticate, authorize('admin'), PaymentController.refund);

export default router;
