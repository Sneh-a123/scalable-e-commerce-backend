import { Router } from 'express';
import { AiController } from '../controllers/aiController';

const router = Router();

router.post('/ask', AiController.ask);

export default router;
