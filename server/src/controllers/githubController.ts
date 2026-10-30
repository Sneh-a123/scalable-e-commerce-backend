import { Request, Response, NextFunction } from 'express';
import { GithubService } from '../services/githubService';
import { ApiResponse } from '../utils/apiResponse';

export class GithubController {
  static async getRepoInfo(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const owner = (req.query.owner as string) || 'nexora-team';
      const repo = (req.query.repo as string) || 'nexora-ecommerce';
      const info = await GithubService.getRepoInfo(owner, repo);
      return ApiResponse.success(res, info, 'GitHub repository info retrieved');
    } catch (err) {
      next(err);
    }
  }
}
