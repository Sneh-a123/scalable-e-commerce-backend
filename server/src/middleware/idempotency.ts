import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet } from '../config/redis';
import { logger } from '../utils/logger';

export const idempotency = (ttlSeconds: number = 3600) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const key = (req.headers['x-idempotency-key'] as string) || (req.headers['idempotency-key'] as string);

    if (!key) {
      return next();
    }

    req.idempotencyKey = key;
    const cacheKey = `idempotency:${req.user?.id || 'anon'}:${key}`;

    try {
      const cached = await cacheGet<{ statusCode: number; body: any }>(cacheKey);
      if (cached) {
        logger.info(`Idempotent request detected for key "${key}". Returning cached response.`);
        res.setHeader('X-Idempotency-Hit', 'true');
        return res.status(cached.statusCode).json(cached.body);
      }

      // Intercept res.json to cache response
      const originalJson = res.json.bind(res);
      res.json = (body: any): Response => {
        // Only cache 2xx and 4xx responses, not 500 server crashes
        if (res.statusCode >= 200 && res.statusCode < 500) {
          cacheSet(cacheKey, { statusCode: res.statusCode, body }, ttlSeconds).catch((err) => {
            logger.warn(`Failed to cache idempotent response: ${err.message}`);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err: any) {
      logger.error(`Idempotency middleware error: ${err.message}`);
      next();
    }
  };
};
