import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkisiz' });
  }
  const token = auth.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev') as { sub: number };
    (req as any).userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: 'Token geçersiz' });
  }
}


