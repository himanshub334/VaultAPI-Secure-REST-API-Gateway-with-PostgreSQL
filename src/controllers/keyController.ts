import { Request, Response } from 'express';
import { ApiKeyService } from '../services/apiKeyService';

const service = new ApiKeyService();

export async function create(req: Request, res: Response) {
  const { name, scopes = [], expiresAt } = req.body;
  if (!name || !Array.isArray(scopes)) {
    return res.status(400).json({ message: 'name and scopes are required' });
  }

  const result = await service.create(
    name,
    scopes,
    expiresAt ? new Date(expiresAt) : undefined
  );
  res.status(201).json(result);
}

export async function list(req: Request, res: Response) {
  res.json(await service.list());
}

export async function revoke(req: Request, res: Response) {
  const ok = await service.revoke(Number(req.params.id));
  if (!ok) return res.status(404).json({ message: 'API key not found' });
  res.status(204).send();
}
