jest.mock('../src/db', () => ({
  pool: {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    totalCount: 1,
    idleCount: 1,
    waitingCount: 0
  }
}));

jest.mock('../src/redis', () => ({
  redis: { ping: jest.fn().mockResolvedValue('PONG') }
}));

import request from 'supertest';
import { app } from '../src/app';

test('health exposes pool metrics', async () => {
  const response = await request(app).get('/health');
  expect(response.statusCode).toBe(200);
  expect(response.body.postgres).toHaveProperty('waiting');
});
