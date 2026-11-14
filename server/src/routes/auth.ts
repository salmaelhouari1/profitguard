import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { serverDb, type UserRecord, type OrganizationRecord, type WorkspaceRecord, type MembershipRecord } from '../db/store.js';
import { JWT_SECRET, authMiddleware } from '../middleware/auth.js';

export const authRouter = Router();

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  workspaceName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/signup
authRouter.post('/signup', async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);
    const emailNormalized = data.email.trim().toLowerCase();

    // Check duplicate email
    for (const u of serverDb.users.values()) {
      if (u.email === emailNormalized) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const userId = crypto.randomUUID();
    const orgId = crypto.randomUUID();
    const workspaceId = crypto.randomUUID();
    const membershipId = crypto.randomUUID();
    const now = new Date().toISOString();

    const user: UserRecord = {
      id: userId,
      email: emailNormalized,
      fullName: data.fullName.trim(),
      passwordHash,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const org: OrganizationRecord = {
      id: orgId,
      name: data.organizationName.trim(),
      slug: data.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      billingPlan: 'starter',
      createdAt: now,
      updatedAt: now,
    };

    const workspace: WorkspaceRecord = {
      id: workspaceId,
      organizationId: orgId,
      name: data.workspaceName?.trim() || `${data.organizationName.trim()} Store`,
      isDemo: false, // Default is REAL empty workspace
      currency: 'USD',
      timezone: 'UTC',
      createdAt: now,
      updatedAt: now,
    };

    const membership: MembershipRecord = {
      id: membershipId,
      organizationId: orgId,
      userId: user.id,
      role: 'owner',
      createdAt: now,
    };

    serverDb.users.set(user.id, user);
    serverDb.organizations.set(org.id, org);
    serverDb.workspaces.set(workspace.id, workspace);
    serverDb.memberships.set(membership.id, membership);

    // Initial empty sets for real workspace
    serverDb.orders.set(workspace.id, []);
    serverDb.products.set(workspace.id, []);
    serverDb.expenses.set(workspace.id, []);
    serverDb.marketing.set(workspace.id, []);
    serverDb.inventory.set(workspace.id, []);
    serverDb.risks.set(workspace.id, []);
    serverDb.alerts.set(workspace.id, []);
    serverDb.auditLogs.set(workspace.id, [
      {
        id: crypto.randomUUID(),
        workspaceId: workspace.id,
        action: 'auth:signup',
        entityType: 'organization',
        details: { orgName: org.name, userEmail: user.email },
        userId: user.id,
        timestamp: now,
      },
    ]);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        orgId: org.id,
        workspaceId: workspace.id,
        role: membership.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: { id: user.id, email: user.email, fullName: user.fullName },
      organization: org,
      workspace,
      role: membership.role,
      token,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: (err as any).issues?.map((e: any) => e.message).join(', ') || 'Validation error' });
    } else {
      res.status(500).json({ error: err.message || 'Signup failed' });
    }
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const emailNormalized = data.email.trim().toLowerCase();

    let user: UserRecord | undefined;
    for (const u of serverDb.users.values()) {
      if (u.email === emailNormalized) {
        user = u;
        break;
      }
    }

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Find org membership
    let membership: MembershipRecord | undefined;
    for (const m of serverDb.memberships.values()) {
      if (m.userId === user.id) {
        membership = m;
        break;
      }
    }

    if (!membership) {
      res.status(403).json({ error: 'User does not belong to any organization' });
      return;
    }

    const org = serverDb.organizations.get(membership.organizationId);
    let workspace: WorkspaceRecord | undefined;
    for (const w of serverDb.workspaces.values()) {
      if (w.organizationId === org?.id) {
        workspace = w;
        break;
      }
    }

    if (!org || !workspace) {
      res.status(500).json({ error: 'Organization or workspace record missing' });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        orgId: org.id,
        workspaceId: workspace.id,
        role: membership.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: { id: user.id, email: user.email, fullName: user.fullName },
      organization: org,
      workspace,
      role: membership.role,
      token,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: (err as any).issues?.map((e: any) => e.message).join(', ') || 'Validation error' });
    } else {
      res.status(500).json({ error: err.message || 'Login failed' });
    }
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
authRouter.get('/me', authMiddleware, (req, res) => {
  const user = serverDb.users.get(req.user!.userId);
  const org = serverDb.organizations.get(req.user!.orgId);
  const workspace = serverDb.workspaces.get(req.user!.workspaceId);

  if (!user || !org || !workspace) {
    res.status(404).json({ error: 'Session context not found' });
    return;
  }

  res.json({
    user: { id: user.id, email: user.email, fullName: user.fullName },
    organization: org,
    workspace,
    role: req.user!.role,
  });
});
