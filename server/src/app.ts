import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { ENV } from './config/env';
import { isRedisActive } from './config/redis';
import { ApiResponse } from './utils/apiResponse';

export const createApp = (): Application => {
  const app: Application = express();

  // Security Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key', 'Idempotency-Key']
    })
  );

  // Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Logging
  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Global Rate Limiting
  app.use('/api', apiLimiter);

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    const mongoState = mongoose.connection.readyState;
    const mongoStatusMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return ApiResponse.success(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: mongoStatusMap[mongoState] || 'unknown',
        databaseName: mongoose.connection.name
      },
      cache: {
        type: isRedisActive() ? 'redis' : 'in-memory-ttl',
        connected: true
      },
      environment: ENV.NODE_ENV
    }, 'Nexora API is operational');
  });

  // Mount API v1 routes
  app.use('/api/v1', routes);

  // 404 Handler
  app.use('*', (req: Request, res: Response) => {
    return ApiResponse.error(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
