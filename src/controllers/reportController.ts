import { Request, Response } from 'express';
import { pool } from '../db';

export async function reports(req: Request, res: Response) {
  const [requests, errors, latency] = await Promise.all([
    pool.query('SELECT * FROM v_requests_per_key_day ORDER BY request_day DESC LIMIT 100'),
    pool.query('SELECT * FROM v_error_rate_by_endpoint ORDER BY requests DESC'),
    pool.query('SELECT * FROM v_latency_percentiles ORDER BY path')
  ]);

  res.json({
    requestsPerKeyPerDay: requests.rows,
    errorRateByEndpoint: errors.rows,
    latencyPercentiles: latency.rows
  });
}
