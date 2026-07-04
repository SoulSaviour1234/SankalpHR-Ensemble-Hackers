import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-hrms-key';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    loginId: string;
    role: 'admin' | 'employee';
    companyId: string;
    name: string;
    email: string;
  };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session token. Please log in again.' });
    }

    req.user = decoded as AuthenticatedRequest['user'];
    next();
  });
}

export function requireRole(role: 'admin' | 'employee') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Permission denied. Admin role required.' });
    }

    next();
  };
}

export function requireAdminOrSelf() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Permission denied. You can only access your own profile.' });
    }

    next();
  };
}
