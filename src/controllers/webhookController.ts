import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { createWebhook, listWebhooks, queueWebhook } from '../services/webhookService';

export async function create(req: AuthenticatedRequest, res: Response) {
  if (!req.apiKey) return res.status(401).json({ message: 'API key required' });
  const { url, eventType } = req.body;

  if (!url || !eventType) {
    return res.status(400).json({ message: 'url and eventType are required' });
  }

  res.status(201).json(await createWebhook(req.apiKey.id, url, eventType));
}

export async function list(req: AuthenticatedRequest, res: Response) {
  if (!req.apiKey) return res.status(401).json({ message: 'API key required' });
  res.json(await listWebhooks(req.apiKey.id));
}

export async function test(req: AuthenticatedRequest, res: Response) {
  if (!req.apiKey) return res.status(401).json({ message: 'API key required' });
  const { rows } = await import('../db').then(db =>
    db.pool.query(
      'SELECT id FROM webhooks WHERE id=$1 AND api_key_id=$2',
      [req.params.id, req.apiKey!.id]
    )
  );

  if (!rows[0]) return res.status(404).json({ message: 'Webhook not found' });

  const delivery = await queueWebhook(Number(req.params.id), {
    event: 'vaultapi.test',
    timestamp: new Date().toISOString()
  });

  res.status(202).json(delivery);
}
