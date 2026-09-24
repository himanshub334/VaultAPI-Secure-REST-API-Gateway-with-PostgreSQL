CREATE OR REPLACE VIEW v_requests_per_key_day AS
SELECT api_key_id, DATE_TRUNC('day',created_at)::date AS request_day,
       COUNT(*)::bigint AS request_count
FROM audit_log
GROUP BY api_key_id, DATE_TRUNC('day',created_at);

CREATE OR REPLACE VIEW v_error_rate_by_endpoint AS
SELECT path,
       COUNT(*)::bigint AS requests,
       COUNT(*) FILTER (WHERE status_code >= 400)::bigint AS errors,
       ROUND(100.0 * COUNT(*) FILTER (WHERE status_code >= 400) / NULLIF(COUNT(*),0),2) AS error_rate_pct
FROM audit_log
GROUP BY path;

CREATE OR REPLACE VIEW v_latency_percentiles AS
SELECT path,
       ROUND((PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms))::numeric,2) AS p50_ms,
       ROUND((PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms))::numeric,2) AS p95_ms,
       ROUND((PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms))::numeric,2) AS p99_ms
FROM audit_log
GROUP BY path;
