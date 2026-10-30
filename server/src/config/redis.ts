import Redis from 'ioredis';
import { ENV } from './env';
import { logger } from '../utils/logger';

// In-memory fallback cache with TTL
class InMemoryCache {
  private store = new Map<string, { value: string; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    const ttlMs = duration ? duration * 1000 : 3600 * 1000;
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(key)) count++;
    }
    return count;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matching: string[] = [];
    const now = Date.now();
    for (const [k, v] of this.store.entries()) {
      if (now <= v.expiresAt && regex.test(k)) {
        matching.push(k);
      }
    }
    return matching;
  }

  async flushall(): Promise<'OK'> {
    this.store.clear();
    return 'OK';
  }
}

const memoryCache = new InMemoryCache();
let redisClient: Redis | null = null;
let useRedis = false;

export const initRedis = async () => {
  try {
    const client = new Redis(ENV.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      retryStrategy: () => null, // Don't hang trying to reconnect continuously in development if not present
    });

    client.on('error', (err) => {
      if (!useRedis) {
        // Expected if Redis is not running
        return;
      }
      logger.warn(`Redis connection error: ${err.message}. Gracefully falling back to in-memory cache.`);
      useRedis = false;
    });

    client.on('connect', () => {
      logger.success('Redis connected successfully');
      useRedis = true;
    });

    await client.connect();
    redisClient = client;
    useRedis = true;
    logger.success(`Redis connected at ${ENV.REDIS_URL}`);
  } catch (error: any) {
    logger.warn(`Redis unavailable (${error.message}). Using high-performance in-memory cache fallback.`);
    useRedis = false;
  }
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    let raw: string | null = null;
    if (useRedis && redisClient) {
      raw = await redisClient.get(key);
    } else {
      raw = await memoryCache.get(key);
    }
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err: any) {
    logger.debug(`Cache get failed for key "${key}": ${err.message}`);
    return null;
  }
};

export const cacheSet = async (key: string, value: any, ttlSeconds: number = 300): Promise<void> => {
  try {
    const serialized = JSON.stringify(value);
    if (useRedis && redisClient) {
      await redisClient.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await memoryCache.set(key, serialized, 'EX', ttlSeconds);
    }
  } catch (err: any) {
    logger.debug(`Cache set failed for key "${key}": ${err.message}`);
  }
};

export const cacheDel = async (keyOrPattern: string): Promise<void> => {
  try {
    if (keyOrPattern.includes('*')) {
      // Pattern deletion
      let matchingKeys: string[] = [];
      if (useRedis && redisClient) {
        matchingKeys = await redisClient.keys(keyOrPattern);
      } else {
        matchingKeys = await memoryCache.keys(keyOrPattern);
      }
      if (matchingKeys.length > 0) {
        if (useRedis && redisClient) {
          await redisClient.del(...matchingKeys);
        } else {
          await memoryCache.del(...matchingKeys);
        }
        logger.debug(`Invalidated ${matchingKeys.length} cache keys matching "${keyOrPattern}"`);
      }
    } else {
      if (useRedis && redisClient) {
        await redisClient.del(keyOrPattern);
      } else {
        await memoryCache.del(keyOrPattern);
      }
    }
  } catch (err: any) {
    logger.debug(`Cache delete failed for pattern "${keyOrPattern}": ${err.message}`);
  }
};

export const isRedisActive = (): boolean => useRedis;
export const getRedisClient = (): Redis | null => redisClient;
