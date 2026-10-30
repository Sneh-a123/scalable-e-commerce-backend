import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema, updateProfileSchema, addressSchema } from '../validators';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);
router.patch('/profile', authenticate, validateBody(updateProfileSchema), AuthController.updateProfile);
router.post('/addresses', authenticate, validateBody(addressSchema), AuthController.addAddress);

export default router;
