import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { adjustStockSchema } from '../validators';

const router = Router();

// All inventory management routes are restricted to Admin
router.use(authenticate, authorize('admin'));

router.get('/', InventoryController.getOverview);
router.get('/logs', InventoryController.getLogs);
router.patch('/:productId', validateBody(adjustStockSchema), InventoryController.adjustStock);

export default router;
