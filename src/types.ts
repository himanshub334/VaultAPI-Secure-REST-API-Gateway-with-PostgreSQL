import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  apiKey?: {
    id: number;
    scopes: string[];
  };
}
