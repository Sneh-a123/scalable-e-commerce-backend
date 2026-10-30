import mongoose from 'mongoose';
import { ENV } from './env';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    logger.success(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    // If not in test, exit on failure
    if (ENV.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully');
  } catch (error: any) {
    logger.error(`MongoDB Disconnection Error: ${error.message}`);
  }
};
