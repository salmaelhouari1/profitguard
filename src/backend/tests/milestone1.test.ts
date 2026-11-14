import { describe, it, expect, beforeEach } from 'vitest';
import { FinancialEngine } from '../modules/engine/financialEngine';
import { AuthGuard } from '../modules/auth/authGuard';
import { SeedService, DEMO_WORKSPACE_ID, DEMO_ORG_ID } from '../seed/seedService';
import { TenancyService } from '../modules/tenancy/tenancyService';
import { AnalystService } from '../modules/analyst/analystService';
import { db } from '../database/db';

describe('Milestone 1: Base Financial Engine & Auth Suites', () => {
  beforeEach(() => {
    db.reset();
    SeedService.seedDemoWorkspace();
  });

  describe('Pure Financial Calculation Engine', () => {
    it('computes gross profit correctly', () => {
      const grossProfit = FinancialEngine.calculateGrossProfit(100, 40);
      expect(grossProfit).toBe(60);
    });

    it('calculates contribution profit with exact decimal rounding', () => {
      const contribProfit = FinancialEngine.calculateContributionProfit({
        revenue: 142,
        cogs: 58,
        shipping: 22,
        discount: 28,
        adSpend: 10,
        paymentFees: 4.12,
      });
      // 142 - (58 + 22 + 28 + 10 + 4.12) = 142 - 122.12 = 19.88
      expect(contribProfit).toBe(19.88);
    });

    it('calculates margin percentage correctly', () => {
      const margin = FinancialEngine.calculateMargin(19.88, 142);
      expect(margin).toBe(14.0);
    });

    it('calculates break-even ROAS as reciprocal of gross margin', () => {
      const beRoas = FinancialEngine.calculateBreakEvenRoas(31.25);
      expect(beRoas).toBe(3.2);
    });
  });

  describe('RBAC & Permissions', () => {
    it('confirms owner permissions', () => {
      expect(AuthGuard.hasPermission('owner', 'org:manage')).toBe(true);
      expect(AuthGuard.hasPermission('viewer', 'org:manage')).toBe(false);
    });

    it('confirms financial analyst permissions', () => {
      expect(AuthGuard.hasPermission('financial_analyst', 'financials:edit')).toBe(true);
      expect(AuthGuard.hasPermission('viewer', 'financials:edit')).toBe(false);
    });

    it('throws when unauthorized action attempted', () => {
      expect(() => AuthGuard.assertPermission('viewer', 'stores:connect')).toThrow();
    });
  });

  describe('Multi-Tenant Workspace & Demo Isolation', () => {
    it('seeds demo workspace with isDemo: true', () => {
      const demoWs = TenancyService.getWorkspaceById(DEMO_WORKSPACE_ID);
      expect(demoWs?.isDemo).toBe(true);
    });

    it('blocks write operations on Demo workspace', () => {
      const demoWs = TenancyService.getWorkspaceById(DEMO_WORKSPACE_ID);
      expect(() => AuthGuard.assertNotDemoWrite(demoWs!.isDemo, 'store:connect')).toThrow();
    });

    it('creates live workspace with isDemo: false and clean isolated collections', () => {
      const liveWs = TenancyService.createLiveWorkspace({
        orgId: DEMO_ORG_ID,
        name: 'Live Brand Inc.',
        userRole: 'owner',
        userId: 'usr_owner_01',
      });
      expect(liveWs.isDemo).toBe(false);

      const liveOrders = db.getState().orders.get(liveWs.id);
      const demoOrders = db.getState().orders.get(DEMO_WORKSPACE_ID);
      expect(liveOrders?.length).toBe(0);
      expect(demoOrders?.length).toBeGreaterThan(0);
    });
  });

  describe('Secure Grounded AI Analyst', () => {
    it('returns verified answer with grounded metrics and citations', () => {
      const response = AnalystService.query({
        workspaceId: DEMO_WORKSPACE_ID,
        question: 'Which orders are unprofitable?',
        role: 'owner',
        userId: 'usr_demo_admin',
      });

      expect(response.answer.length).toBeGreaterThan(50);
      expect(response.groundedMetrics.revenue).toBeGreaterThan(0);
      expect(response.evidenceCitations.length).toBeGreaterThan(0);
      expect(response.recommendedActions.length).toBeGreaterThan(0);
    });
  });
});
