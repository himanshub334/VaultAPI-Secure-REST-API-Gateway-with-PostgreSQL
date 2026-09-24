import { randomUUID } from 'crypto';
import { pool } from '../db';

export async function createWebhook(apiKeyId: number, url: string, eventType: string) {
  const { rows } = await pool.query(
    `INSERT INTO webhooks(api_key_id,url,event_type)
     VALUES($1,$2,$3) RETURNING *`,
    [apiKeyId, url, eventType]
  );
  return rows[0];
}

export async function queueWebhook(
  webhookId: number,
  payload: Record<string, unknown>
) {
  const { rows } = await pool.query(
    `INSERT INTO webhook_deliveries(webhook_id,event_id,payload)
     VALUES($1,$2,$3) RETURNING *`,
    [webhookId, randomUUID(), payload]
  );
  return rows[0];
}

export async function listWebhooks(apiKeyId: number) {
  const { rows } = await pool.query(
    `SELECT * FROM webhooks WHERE api_key_id=$1 ORDER BY created_at DESC`,
    [apiKeyId]
  );
  return rows;
}
