jest.mock('../src/redis', () => ({
  redis: { multi: jest.fn() }
}));

import { checkRateLimit } from '../src/services/rateLimiter';
import { redis } from '../src/redis';

test('allows request below rate limit boundary', async () => {
  const exec = jest.fn().mockResolvedValue([
    [null, 1],
    [null, 2],
    [null, 1],
    [null, 1]
  ]);

  (redis.multi as jest.Mock).mockReturnValue({
    zremrangebyscore: jest.fn().mockReturnThis(),
    zcard: jest.fn().mockReturnThis(),
    zadd: jest.fn().mockReturnThis(),
    pexpire: jest.fn().mockReturnThis(),
    exec
  });

  const result = await checkRateLimit('test-key');
  expect(result.allowed).toBe(true);
});
