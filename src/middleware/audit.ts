import { randomUUID } from 'crypto';
import { NextFunction, Response } from 'express';
import { writeAudit } from '../services/auditService';
import { AuthenticatedRequest } from '../types';

export function auditMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const requestId = randomUUID();
  const start = process.hrtime.bigint();

  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const latencyMs = Number(process.hrtime.bigint() - start) / 1e6;
    writeAudit({
      apiKeyId: req.apiKey?.id,
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      latencyMs: Math.round(latencyMs)
    }).catch(error => console.error('audit write failed', error));
  });

  next();
}
