import { createApp } from './app';
import { connectDB } from './config/db';
import { initRedis } from './config/redis';
import { ENV } from './config/env';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Initialize Redis (with graceful in-memory fallback)
    await initRedis();

    // 3. Initialize Express
    const app = createApp();

    const server = app.listen(ENV.PORT, () => {
      logger.success(`====================================================`);
      logger.success(`🚀 NEXORA E-COMMERCE SERVER RUNNING`);
      logger.success(`📡 Port: ${ENV.PORT}`);
      logger.success(`🌐 Environment: ${ENV.NODE_ENV}`);
      logger.success(`🔗 API Base: http://localhost:${ENV.PORT}/api/v1`);
      logger.success(`💓 Health: http://localhost:${ENV.PORT}/health`);
      logger.success(`====================================================`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error: any) {
    logger.error(`Failed to launch server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
