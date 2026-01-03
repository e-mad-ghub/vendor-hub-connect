import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  role: 'admin' | 'vendor';
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authGuard(roles?: Array<'admin' | 'vendor'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.auth;
    if (!token) return res.status(401).json({ error: 'unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      if (roles && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'forbidden' });
      }
      (req as any).user = decoded;
      next();
    } catch {
      return res.status(401).json({ error: 'unauthorized' });
    }
  };
}
