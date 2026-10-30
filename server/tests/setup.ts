import { beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { ENV } from '../src/config/env';
import { initRedis } from '../src/config/redis';

beforeAll(async () => {
  // Use test database
  const testDbUri = ENV.MONGO_URI.replace(/nexora_db.*$/, 'nexora_test_db');
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testDbUri);
  }
  await initRedis();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    // Optionally clear test collections
    await mongoose.connection.close();
  }
});
