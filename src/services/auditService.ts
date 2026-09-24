import { pool } from '../db';

export async function writeAudit(input: {
  apiKeyId?: number;
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  errorCode?: string;
}) {
  await pool.query(
    `INSERT INTO audit_log
      (api_key_id,request_id,method,path,status_code,latency_ms,error_code)
     VALUES($1,$2,$3,$4,$5,$6,$7)`,
    [
      input.apiKeyId || null,
      input.requestId,
      input.method,
      input.path,
      input.statusCode,
      input.latencyMs,
      input.errorCode || null
    ]
  );
}
