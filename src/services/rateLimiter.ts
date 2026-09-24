import { redis } from '../redis';
import { config } from '../config';

export async function checkRateLimit(
  key: string
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const min = now - config.rateLimitWindowMs;
  const redisKey = `rate-limit:${key}`;

  const tx = redis.multi();
  tx.zremrangebyscore(redisKey, 0, min);
  tx.zcard(redisKey);
  tx.zadd(redisKey, now, `${now}-${Math.random()}`);
  tx.pexpire(redisKey, config.rateLimitWindowMs);

  const result = await tx.exec();
  const countBeforeInsert = Number(result?.[1]?.[1] || 0);

  return {
    allowed: countBeforeInsert < config.rateLimitMax,
    remaining: Math.max(0, config.rateLimitMax - countBeforeInsert - 1)
  };
}
