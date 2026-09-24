import { pool } from '../db';

const MAX_ATTEMPTS = 5;

export async function processDueDeliveries() {
  const { rows } = await pool.query(
    `SELECT wd.id,wd.webhook_id,wd.payload,w.url,wd.attempts
     FROM webhook_deliveries wd
     JOIN webhooks w ON w.id=wd.webhook_id
     WHERE wd.status='PENDING' AND wd.next_attempt_at<=NOW()
     ORDER BY wd.created_at
     LIMIT 20`
  );

  for (const delivery of rows) {
    try {
      const response = await fetch(delivery.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(delivery.payload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await pool.query(
        `UPDATE webhook_deliveries
         SET status='DELIVERED',delivered_at=NOW(),attempts=attempts+1,last_status_code=$1
         WHERE id=$2`,
        [response.status, delivery.id]
      );
    } catch (error) {
      const nextAttempts = delivery.attempts + 1;

      if (nextAttempts >= MAX_ATTEMPTS) {
        await pool.query(
          `UPDATE webhook_deliveries
           SET status='FAILED',attempts=$1,last_error=$2
           WHERE id=$3`,
          [nextAttempts, String(error), delivery.id]
        );
      } else {
        const delayMinutes = 2 ** (nextAttempts - 1);
        await pool.query(
          `UPDATE webhook_deliveries
           SET attempts=$1,last_error=$2,next_attempt_at=NOW()+($3 || ' minutes')::interval
           WHERE id=$4`,
          [nextAttempts, String(error), delayMinutes, delivery.id]
        );
      }
    }
  }
}
