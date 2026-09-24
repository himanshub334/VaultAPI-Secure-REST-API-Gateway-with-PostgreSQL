INSERT INTO api_keys(name,key_prefix,secret_hash,scopes)
VALUES
('Dashboard Demo','vlt_demo','8a8f6d4c2a1e8fbb7d9f2e2e0a2f4d8d6f7b0c9d4a3e7b1c8f5a2d9e6c3b7a1f',
 ARRAY['read:data','read:audit'])
ON CONFLICT (key_prefix) DO NOTHING;
