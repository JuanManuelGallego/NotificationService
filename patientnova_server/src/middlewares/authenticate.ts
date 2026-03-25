import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config.js';
import { apiError } from '../utils/apiUtils.js';

export interface AuthPayload {
  sub: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Verifies the JWT from the Authorization: Bearer <token> header.
 * Attaches the decoded payload to req.user.
 * Rejects with 401 if missing/invalid.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    apiError(res, 'Authentication required', 401);
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.auth.jwtSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    apiError(res, 'Invalid or expired token', 401);
  }
}

/**
 * Requires SUPER_ADMIN role. Must be used after authenticate().
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'SUPER_ADMIN') {
    apiError(res, 'Insufficient permissions', 403);
    return;
  }
  next();
}
