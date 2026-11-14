import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { serverDb } from '../db/store.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'profitguard-dev-secret-super-safe-2026';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  orgId: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'financial_analyst' | 'viewer';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No session token provided.' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    
    // Verify user exists and is active
    const user = serverDb.users.get(payload.userId);
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User account is inactive or not found.' });
      return;
    }

    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function requireRole(allowedRoles: ('owner' | 'admin' | 'financial_analyst' | 'viewer')[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: role '${req.user.role}' lacks permission for this resource.`,
      });
      return;
    }

    next();
  };
}

export function requireWorkspaceAccess(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const requestedWorkspaceId = (req.params.workspaceId || req.query.workspaceId || req.body?.workspaceId) as string;

  if (requestedWorkspaceId && requestedWorkspaceId !== req.user.workspaceId) {
    // Check if user has membership in the workspace's organization
    const ws = serverDb.workspaces.get(requestedWorkspaceId);
    if (!ws || ws.organizationId !== req.user.orgId) {
      res.status(403).json({ error: 'Forbidden: cross-organization workspace access is denied.' });
      return;
    }
  }

  next();
}
