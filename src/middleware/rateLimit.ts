import { NextFunction, Response } from 'express';
import { checkRateLimit } from '../services/rateLimiter';
import { AuthenticatedRequest } from '../types';

export async function rateLimit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.apiKey) return next();

  try {
    const result = await checkRateLimit(`${req.apiKey.id}:${req.path}`);
    res.setHeader('X-RateLimit-Remaining', result.remaining);

    if (!result.allowed) {
      return res.status(429).json({ message: 'Rate limit exceeded' });
    }
    next();
  } catch (error) {
    next(error);
  }
}
