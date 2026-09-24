# VaultAPI — Secure REST API Gateway

A portfolio-ready Node.js + TypeScript REST API gateway demonstrating PostgreSQL database engineering, Redis-backed rate limiting, JWT authentication, API-key management, audit logging, webhook retries, testing, Docker and Swagger.

## Features

- API key creation with SHA-256 hashed secret storage
- Scoped API-key permissions
- JWT admin authentication
- Redis sliding-window rate limiter
- PostgreSQL request/audit logging
- Queryable audit trail
- Webhook delivery queue with retry/backoff and delivery status
- PostgreSQL reporting views
- Composite audit index for common dashboard query
- Pool monitoring in health endpoint
- Jest unit tests
- Docker Compose PostgreSQL + Redis
- Swagger/OpenAPI
- Postman collection

## Architecture

```text
Client
  |
  v
Express / TypeScript
  ├── API key authentication
  ├── scope authorization
  ├── Redis rate limiter
  ├── request/audit middleware
  ├── webhook service
  └── REST controllers
       |
       +---- PostgreSQL
       |      ├── api_keys
       |      ├── audit_log
       |      ├── webhooks
       |      └── delivery_attempts
       |
       +---- Redis
              └── sliding-window counters
```

## Run

Prerequisites: Docker Desktop, Node.js 20+.

```bash
docker compose up -d postgres redis
npm install
npm run dev
```

API: http://localhost:3000
Swagger: http://localhost:3000/docs
Health: http://localhost:3000/health

## Database

The PostgreSQL container runs:

```text
database/01_schema.sql
database/02_indexes.sql
database/03_views.sql
database/04_seed.sql
```

The schema is normalized around API keys, audit events, webhooks and delivery attempts.

## API

### Health

```http
GET /health
```

### API keys

```http
POST /api/v1/keys
GET  /api/v1/keys
POST /api/v1/keys/:id/revoke
```

### Protected demo endpoint

```http
GET /api/v1/demo/data
X-API-Key: <issued key>
```

The demo endpoint requires the `read:data` scope.

### Audit

```http
GET /api/v1/audit?apiKeyId=1&limit=50
```

### Webhooks

```http
POST /api/v1/webhooks
GET  /api/v1/webhooks
POST /api/v1/webhooks/:id/test
```

## Database optimization demo

The project includes a dashboard query:

```sql
SELECT *
FROM audit_log
WHERE api_key_id = $1
ORDER BY created_at DESC
LIMIT 100;
```

The index:

```sql
CREATE INDEX idx_audit_api_key_created_at
ON audit_log (api_key_id, created_at DESC);
```

is designed for this access pattern.

`database/05_explain_demo.sql` contains `EXPLAIN (ANALYZE, BUFFERS)` commands for comparing the indexed query plan.

The repository does not fabricate a benchmark result; run the script against your own generated/load-test data to reproduce measurements.

## Connection-pool troubleshooting

`GET /health` reports PostgreSQL pool state:

```json
{
  "status": "UP",
  "postgres": {
    "total": 10,
    "idle": 8,
    "waiting": 0
  },
  "redis": "UP"
}
```

Database calls use `try/finally` where a checked-out client is required, preventing connection leaks on error paths.

## Rate limiting

Redis keys are maintained using a sliding-window sorted set:

```text
rate-limit:<apiKeyId>:<route>
```

Old timestamps are removed, the current request is inserted, and the remaining count is checked atomically inside a Redis transaction.

## Webhook retries

Failed deliveries are persisted in `delivery_attempts`. Retry scheduling uses exponential backoff:

```text
attempt 1 -> 1 minute
attempt 2 -> 2 minutes
attempt 3 -> 4 minutes
attempt 4 -> 8 minutes
```

The worker is intentionally small so the retry behavior is easy to demonstrate and extend.

## Tests

```bash
npm test
npm run lint
```

Integration tests can be run against the Docker PostgreSQL service:

```bash
npm run test:integration
```

## GitHub

```bash
git init
git add .
git commit -m "Initial commit - VaultAPI secure REST API gateway"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/VaultAPI.git
git push -u origin main
```

## Portfolio note

Run the Docker stack and tests before presenting the project. Benchmark claims such as latency improvements should be described as measurements from your own reproducible load test, not as guaranteed production figures.
# VaultAPI-Secure-REST-API-Gateway-with-PostgreSQL
