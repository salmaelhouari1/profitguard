import { Router } from 'express';
import { serverDb } from '../db/store.js';
import { authMiddleware, requireWorkspaceAccess } from '../middleware/auth.js';
import { FinancialEngine } from '../../../src/backend/modules/engine/financialEngine.js';

export const financialsRouter = Router();

financialsRouter.use(authMiddleware);
financialsRouter.use(requireWorkspaceAccess);

// Helper to get workspace from query or user session
function resolveWorkspaceId(req: any): string {
  return (req.query.workspaceId as string) || req.user.workspaceId;
}

// GET /api/financials/summary
financialsRouter.get('/summary', (req, res) => {
  const wsId = resolveWorkspaceId(req);
  const orders = serverDb.orders.get(wsId) || [];
  const expenses = serverDb.expenses.get(wsId) || [];
  const marketing = serverDb.marketing.get(wsId) || [];

  if (orders.length === 0) {
    // Clean genuine zero-state for empty workspaces
    res.json({
      grossRevenue: 0,
      netRevenue: 0,
      totalCogs: 0,
      adSpend: 0,
      shippingCost: 0,
      operatingExpenses: 0,
      discounts: 0,
      refunds: 0,
      paymentFees: 0,
      netProfit: 0,
      netMargin: 0,
      blendedRoas: 0,
      beRoas: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      ordersAtRisk: 0,
    });
    return;
  }

  const grossRevenue = orders.reduce((s, o) => s + (o.revenue || 0), 0);
  const totalCogs = orders.reduce((s, o) => s + (o.cogs || 0), 0);
  const shippingCost = orders.reduce((s, o) => s + (o.shipping || 0), 0);
  const discounts = orders.reduce((s, o) => s + (o.discount || 0), 0);
  const paymentFees = 0;
  const adSpend = marketing.reduce((s, m) => s + (m.spend || 0), 0);
  const operatingExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const netRevenue = grossRevenue - discounts;
  const netProfit = netRevenue - (totalCogs + shippingCost + paymentFees + adSpend + operatingExpenses);
  const netMargin = FinancialEngine.calculateMargin(netProfit, netRevenue);
  const blendedRoas = adSpend > 0 ? Number((grossRevenue / adSpend).toFixed(2)) : 0;
  const beRoas = netMargin > 0 ? FinancialEngine.calculateBreakEvenRoas(netMargin) : 0;
  const ordersAtRisk = orders.filter(o => o.marginStatus === 'negative' || o.marginStatus === 'missing').length;

  res.json({
    grossRevenue: Number(grossRevenue.toFixed(2)),
    netRevenue: Number(netRevenue.toFixed(2)),
    totalCogs: Number(totalCogs.toFixed(2)),
    adSpend: Number(adSpend.toFixed(2)),
    shippingCost: Number(shippingCost.toFixed(2)),
    operatingExpenses: Number(operatingExpenses.toFixed(2)),
    discounts: Number(discounts.toFixed(2)),
    refunds: 0,
    paymentFees: Number(paymentFees.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    netMargin: Number(netMargin.toFixed(2)),
    blendedRoas,
    beRoas,
    totalOrders: orders.length,
    averageOrderValue: Number((grossRevenue / orders.length).toFixed(2)),
    ordersAtRisk,
  });
});

// GET /api/financials/orders
financialsRouter.get('/orders', (req, res) => {
  const wsId = resolveWorkspaceId(req);
  res.json(serverDb.orders.get(wsId) || []);
});

// GET /api/financials/products
financialsRouter.get('/products', (req, res) => {
  const wsId = resolveWorkspaceId(req);
  res.json(serverDb.products.get(wsId) || []);
});

// GET /api/financials/expenses
financialsRouter.get('/expenses', (req, res) => {
  const wsId = resolveWorkspaceId(req);
  res.json(serverDb.expenses.get(wsId) || []);
});

// GET /api/financials/marketing
financialsRouter.get('/marketing', (req, res) => {
  const wsId = resolveWorkspaceId(req);
  res.json(serverDb.marketing.get(wsId) || []);
});

// GET /api/financials/inventory
financialsRouter.get('/inventory', (req, res) => {
  const wsId = resolveWorkspaceId(req);
  res.json(serverDb.inventory.get(wsId) || []);
});

// GET /api/financials/risks
financialsRouter.get('/risks', (req, res) => {
  const wsId = resolveWorkspaceId(req);
  res.json(serverDb.risks.get(wsId) || []);
});

// GET /api/financials/alerts
financialsRouter.get('/alerts', (req, res) => {
  const wsId = resolveWorkspaceId(req);
  res.json(serverDb.alerts.get(wsId) || []);
});
