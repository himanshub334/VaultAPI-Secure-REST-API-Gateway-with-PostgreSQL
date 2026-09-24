# Interview Demo

1. `docker compose up -d postgres redis`
2. `npm install`
3. `npm run dev`
4. Open `/docs`.
5. Call `/health` and explain pool metrics.
6. Seed/create an API key with `admin:keys`, `read:data`, `read:audit`, `manage:webhooks`.
7. Call `/api/v1/demo/data`.
8. Exceed the configured rate limit and show HTTP 429.
9. Query `/api/v1/audit`.
10. Run the reporting endpoint.
11. Create a webhook and test a delivery.
12. Run `EXPLAIN (ANALYZE, BUFFERS)` for the audit query.
13. Run `npm test`.
