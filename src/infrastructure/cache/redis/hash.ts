import { createClient } from 'redis';
import { Cache } from '../../../application/interfaces/cache';

type RedisClient = ReturnType<typeof createClient>;

const get = async (redis: RedisClient, key: string) => {
  return redis.get(key);
};

const set = async (redis: RedisClient, key: string, value: string, ttl?: number) => {
  await redis.set(key, value, { EX: ttl });
}

const newRedisCache = (redis: RedisClient): Cache => ({
  get: async (key: string) => get(redis, key),
  set: async (key: string, value: string, options: { ttl ?: number }) => set(redis, key, value, options.ttl),
});

export { newRedisCache };
