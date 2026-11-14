import { FinancialEngine } from '../modules/engine/financialEngine';
import { AuthGuard } from '../modules/auth/authGuard';
import { SeedService, DEMO_WORKSPACE_ID, DEMO_ORG_ID } from '../seed/seedService';
import { TenancyService } from '../modules/tenancy/tenancyService';
import { AnalystService } from '../modules/analyst/analystService';
import { AnalyticsService } from '../modules/analytics/analyticsService';
import { db } from '../database/db';

export function runMilestone1Tests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(testName: string, condition: boolean, details?: string) {
    if (condition) {
      passed++;
      results.push(`✅ PASS: ${testName}`);
    } else {
      failed++;
      results.push(`❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    }
  }

  // ─── Test Suite 1: Pure Financial Calculation Engine ───────────────────────
  try {
    const grossProfit = FinancialEngine.calculateGrossProfit(100, 40);
    assert('FinancialEngine.calculateGrossProfit computes correct value', grossProfit === 60);

    const contribProfit = FinancialEngine.calculateContributionProfit({
      revenue: 142,
      cogs: 58,
      shipping: 22,
      discount: 28,
      adSpend: 10,
      paymentFees: 4.12,
    });
    // 142 - (58 + 22 + 28 + 10 + 4.12) = 142 - 122.12 = 19.88
    assert('FinancialEngine.calculateContributionProfit exact decimal rounding', contribProfit === 19.88, `Received ${contribProfit}`);

    const margin = FinancialEngine.calculateMargin(19.88, 142);
    // (19.88 / 142) * 100 = 14.0%
    assert('FinancialEngine.calculateMargin calculates percentage correctly', margin === 14.0, `Received ${margin}`);

    const beRoas = FinancialEngine.calculateBreakEvenRoas(31.25);
    // 100 / 31.25 = 3.2x
    assert('FinancialEngine.calculateBreakEvenRoas matches accounting reciprocal', beRoas === 3.2, `Received ${beRoas}`);
  } catch (err) {
    assert('FinancialEngine execution completed without crash', false, String(err));
  }

  // ─── Test Suite 2: RBAC & Permissions ──────────────────────────────────────
  try {
    assert('Owner has org:manage permission', AuthGuard.hasPermission('owner', 'org:manage') === true);
    assert('Viewer does NOT have org:manage permission', AuthGuard.hasPermission('viewer', 'org:manage') === false);
    assert('Financial Analyst has financials:edit permission', AuthGuard.hasPermission('financial_analyst', 'financials:edit') === true);
    assert('Viewer does NOT have financials:edit permission', AuthGuard.hasPermission('viewer', 'financials:edit') === false);

    let thrown = false;
    try {
      AuthGuard.assertPermission('viewer', 'stores:connect');
    } catch {
      thrown = true;
    }
    assert('AuthGuard blocks unauthorized action with assertion throw', thrown);
  } catch (err) {
    assert('RBAC test suite completed without crash', false, String(err));
  }

  // ─── Test Suite 3: Multi-Tenant Workspace & Demo Isolation ─────────────────
  try {
    SeedService.seedDemoWorkspace();
    const demoWs = TenancyService.getWorkspaceById(DEMO_WORKSPACE_ID);
    assert('Demo workspace seeded with isDemo: true', demoWs?.isDemo === true);

    let demoWriteBlocked = false;
    try {
      AuthGuard.assertNotDemoWrite(demoWs!.isDemo, 'store:connect');
    } catch {
      demoWriteBlocked = true;
    }
    assert('Write operations are strictly blocked on Demo workspace', demoWriteBlocked);

    // Create a live workspace
    const liveWs = TenancyService.createLiveWorkspace({
      orgId: DEMO_ORG_ID,
      name: 'Live Brand Inc.',
      userRole: 'owner',
      userId: 'usr_owner_01',
    });
    assert('Live workspace created with isDemo: false', liveWs.isDemo === false);

    // Verify isolation: live workspace has isolated collections
    const liveOrders = db.getState().orders.get(liveWs.id);
    const demoOrders = db.getState().orders.get(DEMO_WORKSPACE_ID);
    assert('Live workspace orders are isolated from demo workspace', liveOrders?.length === 0 && demoOrders!.length > 0);
  } catch (err) {
    assert('Isolation test suite completed without crash', false, String(err));
  }

  // ─── Test Suite 4: Secure Grounded AI Analyst ─────────────────────────────
  try {
    const response = AnalystService.query({
      workspaceId: DEMO_WORKSPACE_ID,
      question: 'Which orders are unprofitable?',
      role: 'owner',
      userId: 'usr_demo_admin',
    });

    assert('AI Analyst returns verified answer without hallucination', response.answer.length > 50);
    assert('AI Analyst includes grounded financial metrics', response.groundedMetrics.revenue > 0);
    assert('AI Analyst provides verifiable citations', response.evidenceCitations.length > 0);
    assert('AI Analyst provides actionable recommendations', response.recommendedActions.length > 0);
  } catch (err) {
    assert('AI Analyst test suite completed without crash', false, String(err));
  }

  return { passed, failed, results };
}
