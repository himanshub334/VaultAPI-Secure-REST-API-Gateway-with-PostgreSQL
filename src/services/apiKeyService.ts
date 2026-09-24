import { pool } from '../db';
import { generateApiSecret, hashApiSecret } from '../security';

export class ApiKeyService {
  async create(name: string, scopes: string[], expiresAt?: Date) {
    const secret = generateApiSecret();
    const prefix = `vlt_${secret.slice(0, 8)}`;
    const hash = hashApiSecret(secret);

    const result = await pool.query(
      `INSERT INTO api_keys(name,key_prefix,secret_hash,scopes,expires_at)
       VALUES($1,$2,$3,$4,$5)
       RETURNING id,name,key_prefix,scopes,active,expires_at,created_at`,
      [name, prefix, hash, scopes, expiresAt || null]
    );

    return {
      ...result.rows[0],
      apiKey: `${prefix}.${secret}`
    };
  }

  async authenticate(rawKey: string) {
    const [prefix, secret] = rawKey.split('.');
    if (!prefix || !secret) return null;

    const result = await pool.query(
      `SELECT id,scopes,active,expires_at
       FROM api_keys
       WHERE key_prefix=$1 AND secret_hash=$2`,
      [prefix, hashApiSecret(secret)]
    );

    const key = result.rows[0];
    if (!key || !key.active) return null;
    if (key.expires_at && new Date(key.expires_at) <= new Date()) return null;

    await pool.query('UPDATE api_keys SET last_used_at=NOW() WHERE id=$1', [key.id]);
    return { id: Number(key.id), scopes: key.scopes || [] };
  }

  async list() {
    const { rows } = await pool.query(
      `SELECT id,name,key_prefix,scopes,active,expires_at,last_used_at,created_at
       FROM api_keys ORDER BY created_at DESC`
    );
    return rows;
  }

  async revoke(id: number) {
    const { rowCount } = await pool.query(
      'UPDATE api_keys SET active=false WHERE id=$1',
      [id]
    );
    return rowCount === 1;
  }
}
