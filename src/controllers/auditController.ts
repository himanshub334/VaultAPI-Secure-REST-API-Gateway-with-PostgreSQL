import { Request, Response } from 'express';
import { pool } from '../db';

export async function list(req: Request, res: Response) {
  const apiKeyId = req.query.apiKeyId ? Number(req.query.apiKeyId) : null;
  const limit = Math.min(Number(req.query.limit || 50), 500);

  const { rows } = await pool.query(
    `SELECT id,api_key_id,request_id,method,path,status_code,latency_ms,error_code,created_at
     FROM audit_log
     WHERE ($1::bigint IS NULL OR api_key_id=$1)
     ORDER BY created_at DESC
     LIMIT $2`,
    [apiKeyId, limit]
  );

  res.json(rows);
}
