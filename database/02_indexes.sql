CREATE INDEX IF NOT EXISTS idx_audit_api_key_created_at
ON audit_log (api_key_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_created_at
ON audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_delivery_due
ON webhook_deliveries (status, next_attempt_at);

CREATE INDEX IF NOT EXISTS idx_webhook_api_key
ON webhooks (api_key_id);
