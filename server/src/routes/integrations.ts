import { Router } from 'express';
import { z } from 'zod';
import { serverDb, type StoreRecord } from '../db/store.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export const integrationsRouter = Router();

integrationsRouter.use(authMiddleware);

// GET /api/integrations/stores
integrationsRouter.get('/stores', (req, res) => {
  const wsId = (req.query.workspaceId as string) || req.user!.workspaceId;
  const stores: StoreRecord[] = [];
  for (const s of serverDb.stores.values()) {
    if (s.workspaceId === wsId) {
      stores.push(s);
    }
  }
  res.json(stores);
});

// POST /api/integrations/shopify/connect
integrationsRouter.post('/shopify/connect', requireRole(['owner', 'admin']), (req, res) => {
  const schema = z.object({
    shopDomain: z.string().min(3),
    apiKey: z.string().optional(),
  });

  try {
    const data = schema.parse(req.body);
    const wsId = req.user!.workspaceId;
    const storeId = `store_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const store: StoreRecord = {
      id: storeId,
      workspaceId: wsId,
      platform: 'shopify',
      storeName: data.shopDomain.replace('.myshopify.com', ''),
      storeDomain: data.shopDomain,
      currency: 'USD',
      status: 'active',
      lastSyncedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    serverDb.stores.set(store.id, store);

    // Audit log
    serverDb.auditLogs.set(wsId, [
      ...(serverDb.auditLogs.get(wsId) || []),
      {
        id: crypto.randomUUID(),
        workspaceId: wsId,
        action: 'store:connected',
        entityType: 'store',
        details: { storeDomain: data.shopDomain, platform: 'shopify' },
        userId: req.user!.userId,
        timestamp: now,
      },
    ]);

    res.status(201).json(store);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/integrations/cogs/upload - CSV bulk upload
integrationsRouter.post('/cogs/upload', requireRole(['owner', 'admin', 'financial_analyst']), (req, res) => {
  const schema = z.object({
    rows: z.array(
      z.object({
        sku: z.string(),
        cogs: z.number().min(0),
      })
    ),
  });

  try {
    const { rows } = schema.parse(req.body);
    const wsId = req.user!.workspaceId;
    const products = serverDb.products.get(wsId) || [];
    let updatedCount = 0;

    const skuMap = new Map(rows.map(r => [r.sku, r.cogs]));

    const updatedProducts = products.map(p => {
      if (skuMap.has(p.sku)) {
        const newCogs = skuMap.get(p.sku)!;
        const profit = p.revenue - newCogs;
        const margin = p.revenue > 0 ? Number(((profit / p.revenue) * 100).toFixed(1)) : 0;
        updatedCount++;
        return {
          ...p,
          cogs: newCogs,
          contributionProfit: profit,
          margin,
          status: (margin >= 40 ? 'healthy' : margin > 0 ? 'low' : 'negative') as any,
        };
      }
      return p;
    });

    serverDb.products.set(wsId, updatedProducts);

    res.json({
      message: `Successfully updated COGS for ${updatedCount} products`,
      updatedCount,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
