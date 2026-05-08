import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { getJwtSecret } from '../lib/env';

const JWT_SECRET = getJwtSecret();

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    prisma.user
      .findUnique({ where: { id: payload.userId }, select: { id: true, email: true, name: true } })
      .then((user) => {
        if (!user) {
          res.status(401).json({ error: 'User not found' });
          return;
        }
        req.user = user;
        next();
      })
      .catch(() => {
        res.status(401).json({ error: 'Authentication failed' });
      });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '7d' });
}
