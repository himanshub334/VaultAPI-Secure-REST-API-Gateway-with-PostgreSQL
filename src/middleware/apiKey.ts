import { Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/apiKeyService';
import { AuthenticatedRequest } from '../types';

const service = new ApiKeyService();

export async function apiKeyAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const raw = req.header('X-API-Key');
  if (!raw) return res.status(401).json({ message: 'X-API-Key required' });

  try {
    const key = await service.authenticate(raw);
    if (!key) return res.status(401).json({ message: 'Invalid or expired API key' });
    req.apiKey = key;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireScope(scope: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey?.scopes.includes(scope)) {
      return res.status(403).json({ message: `Missing scope: ${scope}` });
    }
    next();
  };
}
