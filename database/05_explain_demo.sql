-- Generate representative data before benchmarking in a disposable environment.
-- Example:
-- INSERT INTO audit_log(api_key_id,request_id,method,path,status_code,latency_ms)
-- SELECT 1,gen_random_uuid(),'GET','/api/v1/demo/data',200,(random()*100)::int
-- FROM generate_series(1,1000000);

EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM audit_log
WHERE api_key_id = 1
ORDER BY created_at DESC
LIMIT 100;

-- Compare the plan after temporarily dropping the composite index in a test database.
-- DROP INDEX idx_audit_api_key_created_at;
