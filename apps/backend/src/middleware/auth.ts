import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../modules/auth/auth.service.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : queryToken;

  if (!token) {
    res.status(401).json({ error: { message: 'Authentication required', code: 'UNAUTHORIZED' } });
    return;
  }

  try {
    const { userId } = verifyToken(token);
    (req as Request & { userId: string }).userId = userId;
    next();
  } catch {
    res.status(401).json({ error: { message: 'Invalid or expired token', code: 'INVALID_TOKEN' } });
  }
}
