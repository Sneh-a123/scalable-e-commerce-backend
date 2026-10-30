import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexora_db',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'nexora_super_secret_jwt_key_2026_genz_saas',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'nexora_refresh_secret_jwt_key_2026_future',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@nexora.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@12345',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_nexora_mock_key',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'nexora_rzp_mock_secret_key_999',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
};
