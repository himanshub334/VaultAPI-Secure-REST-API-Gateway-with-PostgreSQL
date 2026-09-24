jest.mock('../src/db', () => ({
  pool: { query: jest.fn() }
}));

import { ApiKeyService } from '../src/services/apiKeyService';
import { pool } from '../src/db';

test('rejects missing API key parts', async () => {
  const service = new ApiKeyService();
  await expect(service.authenticate('invalid')).resolves.toBeNull();
  expect(pool.query).not.toHaveBeenCalled();
});

test('rejects expired/inactive key returned by database', async () => {
  (pool.query as jest.Mock).mockResolvedValueOnce({
    rows: [{ id: 1, scopes: ['read:data'], active: false, expires_at: null }]
  });

  const service = new ApiKeyService();
  await expect(service.authenticate('vlt_test.secret')).resolves.toBeNull();
});
