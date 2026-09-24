import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from './config';

export function generateApiSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashApiSecret(secret: string): string {
  return crypto
    .createHmac('sha256', config.apiKeyPepper)
    .update(secret)
    .digest('hex');
}

export function createAdminToken(subject: string): string {
  return jwt.sign({ sub: subject, role: 'ADMIN' }, config.jwtSecret, { expiresIn: '1h' });
}
