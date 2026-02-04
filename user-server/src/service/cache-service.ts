import { Redis } from 'ioredis';
import { config } from '../config/config.js';

class CacheService {
  private redis: Redis;
  private defaultTTL = 300; // 5 minutes in seconds

  constructor() {
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      db: config.redis.db,
      password: config.redis.password,
      keyPrefix: config.redis.keyPrefix,
    });

    this.redis.on('error', (err: Error) => {
      console.error('Redis connection error:', err);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const data = JSON.stringify(value);
      await this.redis.set(key, data, 'EX', ttl);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Cache del error for key ${key}:`, error);
    }
  }

  // Helper to generate cache keys
  generateKey(prefix: string, params: object): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${(params as any)[key]}`)
      .join(':');
    return `${prefix}:${sortedParams}`;
  }
}

export const cacheService = new CacheService();
