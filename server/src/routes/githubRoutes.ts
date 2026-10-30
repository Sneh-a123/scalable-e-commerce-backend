import { Router } from 'express';
import { GithubController } from '../controllers/githubController';

const router = Router();

router.get('/repo', GithubController.getRepoInfo);

export default router;
