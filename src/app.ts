import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { apiKeyAuth, requireScope } from './middleware/apiKey';
import { rateLimit } from './middleware/rateLimit';
import { auditMiddleware } from './middleware/audit';
import * as keys from './controllers/keyController';
import * as audit from './controllers/auditController';
import * as reports from './controllers/reportController';
import * as webhooks from './controllers/webhookController';
import { pool } from './db';
import { redis } from './redis';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(auditMiddleware);

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    await redis.ping();
    res.json({
      status: 'UP',
      postgres: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      },
      redis: 'UP'
    });
  } catch {
    res.status(503).json({ status: 'DOWN' });
  }
});

app.use('/api/v1', apiKeyAuth, rateLimit);

app.post('/api/v1/keys', requireScope('admin:keys'), keys.create);
app.get('/api/v1/keys', requireScope('admin:keys'), keys.list);
app.post('/api/v1/keys/:id/revoke', requireScope('admin:keys'), keys.revoke);

app.get('/api/v1/demo/data', requireScope('read:data'), (_req, res) => {
  res.json({
    service: 'VaultAPI',
    message: 'Authenticated API access successful',
    generatedAt: new Date().toISOString()
  });
});

app.get('/api/v1/audit', requireScope('read:audit'), audit.list);
app.get('/api/v1/reports', requireScope('read:audit'), reports.reports);

app.post('/api/v1/webhooks', requireScope('manage:webhooks'), webhooks.create);
app.get('/api/v1/webhooks', requireScope('manage:webhooks'), webhooks.list);
app.post('/api/v1/webhooks/:id/test', requireScope('manage:webhooks'), webhooks.test);

app.get('/docs', swaggerUi.serve, swaggerUi.setup({
  openapi: '3.0.3',
  info: { title: 'VaultAPI', version: '1.0.0' },
  servers: [{ url: 'http://localhost:3000' }],
  components: {
    securitySchemes: {
      apiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key' }
    }
  },
  paths: {
    '/health': { get: { summary: 'Health and pool status' } },
    '/api/v1/demo/data': { get: { security: [{ apiKey: [] }], summary: 'Protected demo endpoint' } },
    '/api/v1/audit': { get: { security: [{ apiKey: [] }], summary: 'Audit trail' } },
    '/api/v1/reports': { get: { security: [{ apiKey: [] }], summary: 'Reporting views' } }
  }
}));

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});
