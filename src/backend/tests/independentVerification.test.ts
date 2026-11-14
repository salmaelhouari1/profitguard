import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../database/db';
import { FinancialEngine } from '../modules/engine/financialEngine';
import { AuthGuard } from '../modules/auth/authGuard';
import { TenancyService } from '../modules/tenancy/tenancyService';
import { AnalyticsService } from '../modules/analytics/analyticsService';
import { AnalystService } from '../modules/analyst/analystService';
import { SeedService, DEMO_WORKSPACE_ID, DEMO_ORG_ID, DEMO_USER_ID } from '../seed/seedService';
import { api, type SessionContext } from '../api';
import type { Order } from '../../types';

describe('Milestone 1: Independent Adversarial & Edge-Case Verification', () => {
  let orgB: { id: string; name: string; slug: string; billingPlan: 'enterprise'; createdAt: string; updatedAt: string };
  let userB: { id: string; email: string; fullName: string; isActive: boolean; createdAt: string };
  let wsB: { id: string; organizationId: string; name: string; isDemo: boolean; currency: string; timezone: string; createdAt: string; updatedAt: string };

  beforeEach(() => {
    db.reset();
    SeedService.seedDemoWorkspace();

    orgB = {
      id: 'org_comp_bravo',
      name: 'Bravo Corporation',
      slug: 'bravo-corp',
      billingPlan: 'enterprise' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.getState().organizations.set(orgB.id, orgB);

    userB = {
      id: 'usr_bravo_admin',
      email: 'admin@bravocorp.com',
      fullName: 'Bravo Administrator',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    db.getState().users.set(userB.id, userB);

    wsB = {
      id: 'ws_bravo_live',
      organizationId: orgB.id,
      name: 'Bravo Flagship Store',
      isDemo: false,
      currency: 'USD',
      timezone: 'America/Chicago',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.getState().workspaces.set(wsB.id, wsB);

    const bravoOrders: Order[] = [
      {
        id: 'ord_bravo_001',
        orderNumber: '#BV-9901',
        product: 'Confidential Enterprise Widget',
        date: '2026-11-01',
        revenue: 5000,
        cogs: 1200,
        shipping: 150,
        discount: 0,
        profit: 3650,
        margin: 73.0,
        status: 'fulfilled',
        marginStatus: 'healthy',
      },
    ];
    db.getState().orders.set(wsB.id, bravoOrders);
  });

  describe('1. Multi-Tenant Security', () => {
    it('1.1 Cross-organization data access must be blocked', () => {
      const sessionSpoofed: SessionContext = {
        userId: DEMO_USER_ID,
        userRole: 'owner',
        orgId: DEMO_ORG_ID,
        workspaceId: wsB.id,
      };

      expect(() => api.getOrders(sessionSpoofed)).toThrow();
    });

    it('1.2 Workspace ownership verification', () => {
      const sessionNonExistentWs: SessionContext = {
        userId: DEMO_USER_ID,
        userRole: 'owner',
        orgId: DEMO_ORG_ID,
        workspaceId: 'ws_fake_does_not_exist',
      };

      expect(() => api.getFinancialSummary(sessionNonExistentWs)).toThrow();
    });

    it('1.3 Unauthorized write attempt by viewer role is blocked', () => {
      const sessionViewer: SessionContext = {
        userId: DEMO_USER_ID,
        userRole: 'viewer',
        orgId: DEMO_ORG_ID,
        workspaceId: DEMO_WORKSPACE_ID,
      };

      expect(() => api.createLiveWorkspace(sessionViewer, 'Unauthorized Workspace')).toThrow();
    });

    it('1.4 Workspace ID tampering in API request must be rejected', () => {
      const sessionTampered: SessionContext = {
        userId: userB.id,
        userRole: 'owner',
        orgId: orgB.id,
        workspaceId: DEMO_WORKSPACE_ID,
      };

      expect(() => api.getFinancialSummary(sessionTampered)).toThrow();
    });
  });

  describe('2. Demo / Live Isolation', () => {
    it('2.1 Direct backend writes to demo workspaces must be blocked', () => {
      expect(() => AuthGuard.assertNotDemoWrite(true, 'store:connect')).toThrow();
    });

    it('2.2 Demo records must never enter live financial calculations', () => {
      const cleanLiveWs = TenancyService.createLiveWorkspace({
        orgId: DEMO_ORG_ID,
        name: 'Clean Live Test',
        userRole: 'owner',
        userId: DEMO_USER_ID,
      });

      const liveOrder: Order = {
        id: 'ord_live_only',
        orderNumber: '#LIVE-100',
        product: 'Live Store Product',
        date: '2026-11-08',
        revenue: 200,
        cogs: 50,
        shipping: 20,
        discount: 0,
        profit: 130,
        margin: 65,
        status: 'fulfilled',
        marginStatus: 'healthy',
      };
      db.getState().orders.set(cleanLiveWs.id, [liveOrder]);

      const summary = AnalyticsService.getFinancialSummary(cleanLiveWs.id, 'owner');
      expect(summary.revenue).toBe(200);
      expect(summary.orders).toBe(1);
    });

    it('2.3 Live workspace data must not appear in demo queries', () => {
      const demoSummary = AnalyticsService.getFinancialSummary(DEMO_WORKSPACE_ID, 'owner');
      const demoOrders = AnalyticsService.getOrders(DEMO_WORKSPACE_ID, 'owner');

      expect(demoOrders.some((o) => o.id === 'ord_live_only' || o.orderNumber === '#LIVE-100')).toBe(false);
      expect(demoSummary.revenue).not.toBe(200);
    });

    it('2.4 Switching between workspaces maintains strict partition boundaries', () => {
      const demoWs = TenancyService.getWorkspaceById(DEMO_WORKSPACE_ID);
      const liveWs = TenancyService.getWorkspaceById(wsB.id);

      expect(demoWs?.isDemo).toBe(true);
      expect(liveWs?.isDemo).toBe(false);
    });
  });

  describe('3. Authentication & Permissions', () => {
    it('3.1 Missing session must throw unauthorized error', () => {
      // @ts-expect-error Runtime invalid argument test
      expect(() => api.getFinancialSummary(undefined)).toThrow();
    });

    it('3.2 Invalid or deactivated user session must be rejected', () => {
      db.getState().users.set('usr_deactivated', {
        id: 'usr_deactivated',
        email: 'fired@profitguard.ai',
        fullName: 'Former Employee',
        isActive: false,
        createdAt: new Date().toISOString(),
      });

      const sessionDeactivated: SessionContext = {
        userId: 'usr_deactivated',
        userRole: 'owner',
        orgId: DEMO_ORG_ID,
        workspaceId: DEMO_WORKSPACE_ID,
      };

      expect(() => api.getFinancialSummary(sessionDeactivated)).toThrow();
    });

    it('3.3 Role permission enforcement on audit logs', () => {
      const sessionAnalyst: SessionContext = {
        userId: DEMO_USER_ID,
        userRole: 'financial_analyst',
        orgId: DEMO_ORG_ID,
        workspaceId: DEMO_WORKSPACE_ID,
      };

      expect(() => api.getAuditLogs(sessionAnalyst)).toThrow();
    });
  });

  describe('4. Financial Engine Edge Cases', () => {
    it('4.1 Zero revenue with positive COGS must not yield NaN or Infinity', () => {
      const margin = FinancialEngine.calculateMargin(-50, 0);
      expect(isNaN(margin)).toBe(false);
      expect(isFinite(margin)).toBe(true);
      expect(margin).toBe(0);
    });

    it('4.2 Negative revenue (full refund) calculation', () => {
      const profit = FinancialEngine.calculateContributionProfit({
        revenue: -120,
        cogs: 0,
        shipping: 15,
        discount: 0,
      });
      expect(profit).toBe(-135);
    });

    it('4.3 Partial refunds & discount interaction', () => {
      const profit = FinancialEngine.calculateContributionProfit({
        revenue: 110,
        cogs: 30,
        shipping: 10,
        discount: 20,
      });
      expect(profit).toBe(50);
      const margin = FinancialEngine.calculateMargin(profit, 110);
      expect(margin).toBe(45.5);
    });

    it('4.4 Missing COGS is classified as missing and not false-healthy', () => {
      const status = FinancialEngine.determineMarginStatus({
        cogs: 0,
        margin: 95.0,
      });
      expect(status).toBe('missing');
    });

    it('4.5 Decimal rounding precision without floating-point artifacts', () => {
      const profit = FinancialEngine.calculateContributionProfit({
        revenue: 19.99,
        cogs: 5.33,
        shipping: 4.99,
        discount: 2.11,
        paymentFees: 0.88,
      });
      expect(profit).toBe(6.68);
    });

    it('4.6 Break-even ROAS with zero or negative margin', () => {
      expect(FinancialEngine.calculateBreakEvenRoas(0)).toBe(0);
      expect(FinancialEngine.calculateBreakEvenRoas(-15)).toBe(0);
      expect(FinancialEngine.calculateBreakEvenRoas(100)).toBe(1.0);
    });

    it('4.7 Duplicate order records must not double-count revenue', () => {
      const duplicateBatch: Order[] = [
        {
          id: 'ord_dup_1',
          orderNumber: '#DUP-01',
          product: 'Widget A',
          date: '2026-11-01',
          revenue: 100,
          cogs: 30,
          shipping: 10,
          discount: 0,
          profit: 60,
          margin: 60,
          status: 'fulfilled',
          marginStatus: 'healthy',
        },
        {
          id: 'ord_dup_2',
          orderNumber: '#DUP-01',
          product: 'Widget A',
          date: '2026-11-01',
          revenue: 100,
          cogs: 30,
          shipping: 10,
          discount: 0,
          profit: 60,
          margin: 60,
          status: 'fulfilled',
          marginStatus: 'healthy',
        },
      ];

      const summary = FinancialEngine.computeSummary({
        orders: duplicateBatch,
        advertisingSpend: 0,
        dateRange: 'Nov 2026',
      });

      expect(summary.revenue).toBe(100);
    });
  });

  describe('5. AI Analyst Verification', () => {
    it('5.1 Incomplete/Empty data must not hallucinate orders or metrics', () => {
      const emptyWsId = 'ws_empty_intelligence';
      db.getState().workspaces.set(emptyWsId, {
        id: emptyWsId,
        organizationId: DEMO_ORG_ID,
        name: 'Empty Workspace',
        isDemo: false,
        currency: 'USD',
        timezone: 'UTC',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      db.getState().orders.set(emptyWsId, []);
      db.getState().products.set(emptyWsId, []);
      db.getState().marketingChannels.set(emptyWsId, []);
      db.getState().risks.set(emptyWsId, []);

      const response = AnalystService.query({
        workspaceId: emptyWsId,
        question: 'Which orders are unprofitable?',
        role: 'owner',
        userId: DEMO_USER_ID,
      });

      expect(response.answer.includes('#10490')).toBe(false);
      expect(response.groundedMetrics.ordersCount).toBe(0);
    });

    it('5.2 Unavailable metrics must be acknowledged as unavailable', () => {
      const response = AnalystService.query({
        workspaceId: DEMO_WORKSPACE_ID,
        question: 'What is our TikTok customer retention rate and organic churn rate?',
        role: 'owner',
        userId: DEMO_USER_ID,
      });

      expect(response.answer.includes('retention rate is')).toBe(false);
      expect(response.answer.includes('churn rate is')).toBe(false);
    });

    it('5.3 Citations must reference actual records existing in the workspace', () => {
      const response = AnalystService.query({
        workspaceId: DEMO_WORKSPACE_ID,
        question: 'Where is our margin leaking?',
        role: 'owner',
        userId: DEMO_USER_ID,
      });

      const demoOrders = db.getState().orders.get(DEMO_WORKSPACE_ID) || [];
      const demoProducts = db.getState().products.get(DEMO_WORKSPACE_ID) || [];
      const demoChannels = db.getState().marketingChannels.get(DEMO_WORKSPACE_ID) || [];

      for (const citation of response.evidenceCitations) {
        if (citation.entityType === 'order') {
          const exists = demoOrders.some((o) => o.orderNumber === citation.identifier);
          expect(exists).toBe(true);
        } else if (citation.entityType === 'product') {
          const exists = demoProducts.some((p) => p.sku === citation.identifier);
          expect(exists).toBe(true);
        } else if (citation.entityType === 'channel') {
          const exists = demoChannels.some((c) => c.name === citation.identifier);
          expect(exists).toBe(true);
        }
      }
    });

    it('5.4 Cross-organization AI Analyst queries must be blocked', () => {
      const sessionSpoofed: SessionContext = {
        userId: DEMO_USER_ID,
        userRole: 'owner',
        orgId: DEMO_ORG_ID,
        workspaceId: wsB.id,
      };

      expect(() => api.queryAIAnalyst(sessionSpoofed, 'What was our largest confidential order?')).toThrow();
    });
  });

  describe('6. Database and Data Integrity', () => {
    it('6.1 Workspace must have valid parent organization relationship', () => {
      const allWorkspaces = Array.from(db.getState().workspaces.values());
      for (const ws of allWorkspaces) {
        const org = db.getState().organizations.get(ws.organizationId);
        expect(org).toBeDefined();
      }
    });

    it('6.2 Financial calculations remain consistent after unit COGS update', () => {
      const wsId = DEMO_WORKSPACE_ID;
      const initialSummary = AnalyticsService.getFinancialSummary(wsId, 'owner');

      const orders = db.getState().orders.get(wsId) || [];
      expect(orders.length).toBeGreaterThan(0);

      const orderToUpdate = orders[0];
      const oldCogs = orderToUpdate.cogs;
      orderToUpdate.cogs = oldCogs + 10;
      orderToUpdate.profit = FinancialEngine.calculateContributionProfit({
        revenue: orderToUpdate.revenue,
        cogs: orderToUpdate.cogs,
        shipping: orderToUpdate.shipping,
        discount: orderToUpdate.discount,
      });
      orderToUpdate.margin = FinancialEngine.calculateMargin(orderToUpdate.profit, orderToUpdate.revenue);

      const updatedSummary = AnalyticsService.getFinancialSummary(wsId, 'owner');
      expect(Math.round(initialSummary.grossProfit - updatedSummary.grossProfit)).toBe(10);
    });
  });
});
