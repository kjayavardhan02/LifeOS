import { Redis } from 'ioredis';
import { logger } from './logger.js';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

redis.on('connect', () => logger.info('[Redis] Connected'));
redis.on('error', (err) => logger.error('[Redis] Connection error:', err));
