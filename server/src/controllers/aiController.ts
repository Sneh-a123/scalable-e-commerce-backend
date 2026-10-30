import { Request, Response, NextFunction } from 'express';
import { AiService } from '../services/aiService';
import { ApiResponse } from '../utils/apiResponse';

export class AiController {
  static async ask(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== 'string') {
        return ApiResponse.error(res, 'Message is required', 400);
      }
      const result = await AiService.askCopilot(message, history);
      return ApiResponse.success(res, result, 'AI recommendation generated');
    } catch (err) {
      next(err);
    }
  }
}
