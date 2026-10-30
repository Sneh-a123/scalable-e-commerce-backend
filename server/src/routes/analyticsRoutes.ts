import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Analytics endpoints are restricted to Admin
router.use(authenticate, authorize('admin'));

router.get('/overview', AnalyticsController.getOverview);
router.get('/revenue', AnalyticsController.getRevenue);
router.get('/monthly', AnalyticsController.getMonthlySales);
router.get('/products', AnalyticsController.getBestSelling);
router.get('/categories', AnalyticsController.getCategoryPerformance);
router.get('/orders', AnalyticsController.getOrderStatusDistribution);
router.get('/customers', AnalyticsController.getCustomerGrowth);

export default router;
