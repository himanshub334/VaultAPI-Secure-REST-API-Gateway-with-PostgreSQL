# Troubleshooting and Root Cause Notes

## Connection pool exhaustion

### Symptom
Requests began waiting for database connections under concurrent load.

### Investigation
Use:

```sql
SELECT pid,state,wait_event_type,wait_event,query
FROM pg_stat_activity
WHERE datname=current_database();
```

Compare active connections with the configured pool size and inspect application paths that acquire a `PoolClient`.

### Root cause pattern
A checked-out client was not released on an exception path.

### Fix
Use:

```ts
const client = await pool.connect();
try {
  // database work
} finally {
  client.release();
}
```

`src/db.ts` contains a reusable `withClient()` helper implementing this pattern.

## Slow audit query

Frequent query:

```sql
SELECT *
FROM audit_log
WHERE api_key_id = $1
ORDER BY created_at DESC
LIMIT 100;
```

The supporting composite index is:

```sql
CREATE INDEX idx_audit_api_key_created_at
ON audit_log (api_key_id, created_at DESC);
```

Use `database/05_explain_demo.sql` with realistic data and `EXPLAIN (ANALYZE, BUFFERS)` to verify the plan on your environment.
