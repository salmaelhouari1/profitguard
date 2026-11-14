import { Router } from 'express';
import { z } from 'zod';
import { serverDb, type WorkspaceRecord } from '../db/store.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { FinancialEngine } from '../../../src/backend/modules/engine/financialEngine.js';
import {
  orders as demoOrders,
  products as demoProducts,
  expenses as demoExpenses,
  marketingChannels as demoMarketing,
  inventoryItems as demoInventory,
  risks as demoRisks,
  alerts as demoAlerts,
} from '../../../src/data/demo.js';

export const workspacesRouter = Router();

// All workspace routes require valid auth
workspacesRouter.use(authMiddleware);

// GET /api/workspaces - list workspaces for authenticated user's organization
workspacesRouter.get('/', (req, res) => {
  const orgId = req.user!.orgId;
  const workspaces: WorkspaceRecord[] = [];
  for (const w of serverDb.workspaces.values()) {
    if (w.organizationId === orgId) {
      workspaces.push(w);
    }
  }
  res.json(workspaces);
});

// POST /api/workspaces - create new real workspace
workspacesRouter.post('/', requireRole(['owner', 'admin']), (req, res) => {
  const schema = z.object({
    name: z.string().min(2, 'Workspace name must be at least 2 characters'),
    currency: z.string().default('USD'),
    timezone: z.string().default('UTC'),
  });

  try {
    const data = schema.parse(req.body);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const workspace: WorkspaceRecord = {
      id,
      organizationId: req.user!.orgId,
      name: data.name,
      isDemo: false,
      currency: data.currency,
      timezone: data.timezone,
      createdAt: now,
      updatedAt: now,
    };

    serverDb.workspaces.set(workspace.id, workspace);
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
        action: 'workspace:created',
        entityType: 'workspace',
        details: { name: workspace.name },
        userId: req.user!.userId,
        timestamp: now,
      },
    ]);

    res.status(201).json(workspace);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/workspaces/sample - opt-in load sample workspace
workspacesRouter.post('/sample', requireRole(['owner', 'admin']), (req, res) => {
  const id = `ws_sample_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  const workspace: WorkspaceRecord = {
    id,
    organizationId: req.user!.orgId,
    name: 'Demo Sample Store (Read-Only)',
    isDemo: true,
    currency: 'USD',
    timezone: 'America/New_York',
    createdAt: now,
    updatedAt: now,
  };

  serverDb.workspaces.set(workspace.id, workspace);

  // Normalize demo orders through financial engine
  const normalizedOrders = demoOrders.map((o) => {
    const calculatedProfit = o.marginStatus === 'missing'
      ? 0
      : FinancialEngine.calculateContributionProfit({
          revenue: o.revenue,
          cogs: o.cogs,
          shipping: o.shipping,
          discount: o.discount,
        });
    const calculatedMargin = o.marginStatus === 'missing'
      ? 0
      : FinancialEngine.calculateMargin(calculatedProfit, o.revenue);
    const calculatedStatus = FinancialEngine.determineMarginStatus({
      cogs: o.cogs,
      margin: calculatedMargin,
    });

    return {
      ...o,
      profit: calculatedProfit,
      margin: calculatedMargin,
      marginStatus: calculatedStatus,
    };
  });

  serverDb.orders.set(workspace.id, normalizedOrders);
  serverDb.products.set(workspace.id, demoProducts);
  serverDb.expenses.set(workspace.id, demoExpenses);
  serverDb.marketing.set(workspace.id, demoMarketing);
  serverDb.inventory.set(workspace.id, demoInventory);
  serverDb.risks.set(workspace.id, demoRisks);
  serverDb.alerts.set(workspace.id, demoAlerts);

  serverDb.auditLogs.set(workspace.id, [
    {
      id: crypto.randomUUID(),
      workspaceId: workspace.id,
      action: 'workspace:opt_in_sample_created',
      entityType: 'workspace',
      details: { name: workspace.name, isDemo: true, ordersCount: normalizedOrders.length },
      userId: req.user!.userId,
      timestamp: now,
    },
  ]);

  res.status(201).json(workspace);
});
