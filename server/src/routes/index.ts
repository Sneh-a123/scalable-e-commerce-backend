import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import cartRoutes from './cartRoutes';
import orderRoutes from './orderRoutes';
import paymentRoutes from './paymentRoutes';
import inventoryRoutes from './inventoryRoutes';
import analyticsRoutes from './analyticsRoutes';
import customerRoutes from './customerRoutes';
import couponRoutes from './couponRoutes';
import aiRoutes from './aiRoutes';
import githubRoutes from './githubRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/customers', customerRoutes);
router.use('/coupons', couponRoutes);
router.use('/ai', aiRoutes);
router.use('/github', githubRoutes);

export default router;
