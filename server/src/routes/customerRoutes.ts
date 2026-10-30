import { Router } from 'express';
import { CustomerController } from '../controllers/customerController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', CustomerController.listCustomers);
router.get('/:id', CustomerController.getCustomerDetails);

export default router;
