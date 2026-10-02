/**
 * BFS – Bank Fraud Shield
 * Authentication and Role-Based Authorization Middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bfs_banking_fraud_shield_secure_jwt_secret_key_2026_x99';

export interface AuthUserPayload {
  userId: number;
  email: string;
  name: string;
  roleId: number;
  roleName: 'Customer' | 'Admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyAuthToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. No Bearer token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized. Authentication required.' });
    return;
  }

  if (req.user.roleId !== 2) {
    res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required to access this resource.' });
    return;
  }

  next();
}
