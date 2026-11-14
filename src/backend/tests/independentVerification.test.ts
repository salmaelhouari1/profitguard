import { db } from '../database/db';
import { FinancialEngine } from '../modules/engine/financialEngine';
import { AuthGuard } from '../modules/auth/authGuard';
import { TenancyService } from '../modules/tenancy/tenancyService';
import { AnalyticsService } from '../modules/analytics/analyticsService';
import { AnalystService } from '../modules/analyst/analystService';
import { AuditService } from '../modules/audit/auditService';
import { SeedService, DEMO_WORKSPACE_ID, DEMO_ORG_ID, DEMO_USER_ID } from '../seed/seedService';
import { api, type SessionContext } from '../api';
import type { Order } from '../../types';

export interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  error?: string;
}

export function runIndependentVerification(): TestResult[] {
  const results: TestResult[] = [];

  function record(category: string, name: string, fn: () => void) {
    try {
      fn();
      results.push({ category, name, passed: true });
    } catch (err: unknown) {
      results.push({
        category,
        name,
        passed: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Ensure fresh seed
  db.reset();
  SeedService.seedDemoWorkspace();

  // Setup secondary tenant (Org B) for cross-tenant testing
  const orgB = {
    id: 'org_comp_bravo',
    name: 'Bravo Corporation',
    slug: 'bravo-corp',
    billingPlan: 'enterprise' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.getState().organizations.set(orgB.id, orgB);

  const userB = {
    id: 'usr_bravo_admin',
    email: 'admin@bravocorp.com',
    fullName: 'Bravo Administrator',
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  db.getState().users.set(userB.id, userB);

  const wsB = {
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

  // Seed Bravo with proprietary confidential orders
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. MULTI-TENANT SECURITY
  // ═══════════════════════════════════════════════════════════════════════════

  record('1. Multi-tenant security', '1.1 Cross-organization data access must be blocked', () => {
    // User in Demo Org tries to access Bravo's workspace
    const sessionSpoofed: SessionContext = {
      userId: DEMO_USER_ID,
      userRole: 'owner',
      orgId: DEMO_ORG_ID,
      workspaceId: wsB.id, // Trying to access Bravo's workspace
    };

    let denied = false;
    try {
      const orders = api.getOrders(sessionSpoofed);
      // If it returned Bravo's confidential orders, it's a massive breach!
      if (orders.some((o) => o.orderNumber === '#BV-9901')) {
        throw new Error('VULNERABILITY: Demo user successfully read confidential orders from Bravo Org!');
      }
    } catch {
      denied = true;
    }

    if (!denied) {
      throw new Error('FAILED: Cross-organization data access was NOT blocked by API');
    }
  });

  record('1. Multi-tenant security', '1.2 Workspace ownership verification', () => {
    const sessionNonExistentWs: SessionContext = {
      userId: DEMO_USER_ID,
      userRole: 'owner',
      orgId: DEMO_ORG_ID,
      workspaceId: 'ws_fake_does_not_exist',
    };

    let caught = false;
    try {
      api.getFinancialSummary(sessionNonExistentWs);
    } catch {
      caught = true;
    }

    if (!caught) {
      throw new Error('FAILED: Request with non-existent workspace ID was not rejected');
    }
  });

  record('1. Multi-tenant security', '1.3 Unauthorized write attempt (viewer role)', () => {
    const sessionViewer: SessionContext = {
      userId: DEMO_USER_ID,
      userRole: 'viewer',
      orgId: DEMO_ORG_ID,
      workspaceId: DEMO_WORKSPACE_ID,
    };

    let writeBlocked = false;
    try {
      api.createLiveWorkspace(sessionViewer, 'Unauthorized Workspace');
    } catch {
      writeBlocked = true;
    }

    if (!writeBlocked) {
      throw new Error('FAILED: Viewer role was able to invoke createLiveWorkspace');
    }
  });

  record('1. Multi-tenant security', '1.4 Workspace ID tampering in API request must be rejected', () => {
    const sessionTampered: SessionContext = {
      userId: userB.id,
      userRole: 'owner',
      orgId: orgB.id,
      workspaceId: DEMO_WORKSPACE_ID, // Bravo user tries to query Demo Kitchen Co directly
    };

    let caught = false;
    try {
      api.getFinancialSummary(sessionTampered);
    } catch {
      caught = true;
    }

    if (!caught) {
      throw new Error('FAILED: User was able to query another org workspace by altering workspaceId');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. DEMO / LIVE ISOLATION
  // ═══════════════════════════════════════════════════════════════════════════

  record('2. Demo/Live isolation', '2.1 Direct backend writes to demo workspaces must be blocked', () => {
    // Assert write guard on demo workspace
    let writeBlocked = false;
    try {
      AuthGuard.assertNotDemoWrite(true, 'store:connect');
    } catch {
      writeBlocked = true;
    }

    if (!writeBlocked) {
      throw new Error('FAILED: Write operation was permitted on demo workspace');
    }
  });

  record('2. Demo/Live isolation', '2.2 Demo records must never enter live financial calculations', () => {
    // Create an empty live workspace
    const sessionLive: SessionContext = {
      userId: DEMO_USER_ID,
      userRole: 'owner',
      orgId: DEMO_ORG_ID,
      workspaceId: 'ws_test_clean_live',
    };

    const cleanLiveWs = TenancyService.createLiveWorkspace({
      orgId: DEMO_ORG_ID,
      name: 'Clean Live Test',
      userRole: 'owner',
      userId: DEMO_USER_ID,
    });
    sessionLive.workspaceId = cleanLiveWs.id;

    // Add a single live order
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
    // Demo revenue is 84,750. Clean live revenue must be strictly 200
    if (summary.revenue !== 200) {
      throw new Error(`FAILED: Live calculation contaminated with demo records! Expected 200, got ${summary.revenue}`);
    }
    if (summary.orders !== 1) {
      throw new Error(`FAILED: Live order count contaminated! Expected 1, got ${summary.orders}`);
    }
  });

  record('2. Demo/Live isolation', '2.3 Live workspace data must not appear in demo queries', () => {
    const demoSummary = AnalyticsService.getFinancialSummary(DEMO_WORKSPACE_ID, 'owner');
    const demoOrders = AnalyticsService.getOrders(DEMO_WORKSPACE_ID, 'owner');

    if (demoOrders.some((o) => o.id === 'ord_live_only' || o.orderNumber === '#LIVE-100')) {
      throw new Error('FAILED: Live order leaked into demo orders collection!');
    }
    if (demoSummary.revenue === 200) {
      throw new Error('FAILED: Demo summary overwritten by live data!');
    }
  });

  record('2. Demo/Live isolation', '2.4 Switching between workspaces maintains strict partition boundaries', () => {
    const demoWs = TenancyService.getWorkspaceById(DEMO_WORKSPACE_ID);
    const liveWs = TenancyService.getWorkspaceById(wsB.id);

    if (!demoWs?.isDemo) throw new Error('Demo workspace isDemo flag is invalid');
    if (liveWs?.isDemo) throw new Error('Live workspace isDemo flag is invalid');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. AUTHENTICATION AND PERMISSIONS
  // ═══════════════════════════════════════════════════════════════════════════

  record('3. Authentication and permissions', '3.1 Missing session must throw unauthorized error', () => {
    let caught = false;
    try {
      // @ts-expect-error Testing invalid runtime invocation
      api.getFinancialSummary(undefined);
    } catch {
      caught = true;
    }
    if (!caught) throw new Error('FAILED: API accepted undefined session');
  });

  record('3. Authentication and permissions', '3.2 Invalid or deactivated user session must be rejected', () => {
    const sessionDeactivated: SessionContext = {
      userId: 'usr_deactivated',
      userRole: 'owner',
      orgId: DEMO_ORG_ID,
      workspaceId: DEMO_WORKSPACE_ID,
    };

    // Register deactivated user
    db.getState().users.set('usr_deactivated', {
      id: 'usr_deactivated',
      email: 'fired@profitguard.ai',
      fullName: 'Former Employee',
      isActive: false,
      createdAt: new Date().toISOString(),
    });

    let caught = false;
    try {
      api.getFinancialSummary(sessionDeactivated);
    } catch {
      caught = true;
    }

    if (!caught) throw new Error('FAILED: Deactivated user was able to execute financial queries');
  });

  record('3. Authentication and permissions', '3.3 Role permission enforcement on audit logs', () => {
    const sessionAnalyst: SessionContext = {
      userId: DEMO_USER_ID,
      userRole: 'financial_analyst',
      orgId: DEMO_ORG_ID,
      workspaceId: DEMO_WORKSPACE_ID,
    };

    let caught = false;
    try {
      api.getAuditLogs(sessionAnalyst);
    } catch {
      caught = true;
    }

    if (!caught) throw new Error('FAILED: Financial analyst role was able to access org-level audit logs');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. FINANCIAL ENGINE EDGE CASES
  // ═══════════════════════════════════════════════════════════════════════════

  record('4. Financial Engine edge cases', '4.1 Zero revenue with positive COGS must not yield NaN or Infinity', () => {
    const margin = FinancialEngine.calculateMargin(-50, 0);
    if (isNaN(margin) || !isFinite(margin)) {
      throw new Error(`FAILED: Margin is NaN or Infinite: ${margin}`);
    }
    if (margin !== 0) {
      throw new Error(`Expected margin 0 for zero revenue, got ${margin}`);
    }
  });

  record('4. Financial Engine edge cases', '4.2 Negative revenue (full refund) calculation', () => {
    const profit = FinancialEngine.calculateContributionProfit({
      revenue: -120,
      cogs: 0,
      shipping: 15,
      discount: 0,
    });
    // -120 - 15 = -135
    if (profit !== -135) {
      throw new Error(`Expected profit -135 on full refund with return shipping, got ${profit}`);
    }
  });

  record('4. Financial Engine edge cases', '4.3 Partial refunds & discount interaction', () => {
    // Original $150 order, $40 partial refund, $20 coupon discount, $30 COGS, $10 shipping
    const profit = FinancialEngine.calculateContributionProfit({
      revenue: 110, // 150 - 40 refund
      cogs: 30,
      shipping: 10,
      discount: 20,
    });
    // 110 - (30 + 10 + 20) = 50
    if (profit !== 50) {
      throw new Error(`Expected contribution profit 50, got ${profit}`);
    }
    const margin = FinancialEngine.calculateMargin(profit, 110);
    // 50 / 110 = 45.45% -> 45.5%
    if (margin !== 45.5) {
      throw new Error(`Expected margin 45.5%, got ${margin}%`);
    }
  });

  record('4. Financial Engine edge cases', '4.4 Missing COGS is classified as missing and not false-healthy', () => {
    const status = FinancialEngine.determineMarginStatus({
      cogs: 0,
      margin: 95.0, // Looks high only because COGS is missing!
    });
    if (status !== 'missing') {
      throw new Error(`Expected status 'missing' when COGS is 0, got '${status}'`);
    }
  });

  record('4. Financial Engine edge cases', '4.5 Decimal rounding precision (no 0.0000000000000002 floats)', () => {
    const profit = FinancialEngine.calculateContributionProfit({
      revenue: 19.99,
      cogs: 5.33,
      shipping: 4.99,
      discount: 2.11,
      paymentFees: 0.88,
    });
    // 19.99 - (5.33 + 4.99 + 2.11 + 0.88) = 19.99 - 13.31 = 6.68
    if (profit !== 6.68) {
      throw new Error(`Expected exact decimal 6.68, got ${profit}`);
    }
  });

  record('4. Financial Engine edge cases', '4.6 Break-even ROAS with zero or negative margin', () => {
    const roasZero = FinancialEngine.calculateBreakEvenRoas(0);
    if (roasZero !== 0) throw new Error(`Expected 0 for 0% margin, got ${roasZero}`);

    const roasNegative = FinancialEngine.calculateBreakEvenRoas(-15);
    if (roasNegative !== 0) throw new Error(`Expected 0 for negative margin, got ${roasNegative}`);

    const roas100 = FinancialEngine.calculateBreakEvenRoas(100);
    if (roas100 !== 1.0) throw new Error(`Expected 1.0 for 100% margin, got ${roas100}`);
  });

  record('4. Financial Engine edge cases', '4.7 Duplicate order records must not double-count revenue', () => {
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
        orderNumber: '#DUP-01', // Exact same orderNumber ingested twice
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

    // If duplicate orders are passed, computeSummary currently sums totalRevenue = 200 without deduplication!
    if (summary.revenue !== 100) {
      throw new Error(`FAILED: Duplicate order was counted twice! Expected revenue 100, got ${summary.revenue}`);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. AI ANALYST VERIFICATION
  // ═══════════════════════════════════════════════════════════════════════════

  record('5. AI Analyst verification', '5.1 Incomplete/Empty data must not hallucinate orders or metrics', () => {
    // Create an empty workspace
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

    // Check if the AI hallucinated order #10490 or false percentages when 0 orders exist
    if (response.answer.includes('#10490')) {
      throw new Error('VULNERABILITY: AI Analyst hallucinated demo order #10490 in an empty workspace!');
    }
    if (response.groundedMetrics.ordersCount !== 0) {
      throw new Error(`Expected 0 orders count in groundedMetrics, got ${response.groundedMetrics.ordersCount}`);
    }
  });

  record('5. AI Analyst verification', '5.2 Unavailable metrics must be acknowledged as unavailable', () => {
    const response = AnalystService.query({
      workspaceId: DEMO_WORKSPACE_ID,
      question: 'What is our TikTok customer retention rate and organic churn rate?',
      role: 'owner',
      userId: DEMO_USER_ID,
    });

    // The AI should not make up fake retention numbers
    if (response.answer.includes('retention rate is') || response.answer.includes('churn rate is')) {
      throw new Error('VULNERABILITY: AI fabricated unavailable metrics (retention/churn)!');
    }
  });

  record('5. AI Analyst verification', '5.3 Citations must reference actual records existing in the workspace', () => {
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
        if (!exists) throw new Error(`Citation referenced non-existent order: ${citation.identifier}`);
      } else if (citation.entityType === 'product') {
        const exists = demoProducts.some((p) => p.sku === citation.identifier);
        if (!exists) throw new Error(`Citation referenced non-existent SKU: ${citation.identifier}`);
      } else if (citation.entityType === 'channel') {
        const exists = demoChannels.some((c) => c.name === citation.identifier);
        if (!exists) throw new Error(`Citation referenced non-existent channel: ${citation.identifier}`);
      }
    }
  });

  record('5. AI Analyst verification', '5.4 Cross-organization AI Analyst queries must be blocked', () => {
    // Demo user tries to query Bravo's confidential workspace through Analyst
    let caught = false;
    try {
      const sessionSpoofed: SessionContext = {
        userId: DEMO_USER_ID,
        userRole: 'owner',
        orgId: DEMO_ORG_ID,
        workspaceId: wsB.id,
      };
      api.queryAIAnalyst(sessionSpoofed, 'What was our largest confidential order?');
    } catch {
      caught = true;
    }

    if (!caught) {
      throw new Error('VULNERABILITY: AI Analyst answered query using another organization workspace!');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. DATABASE AND DATA INTEGRITY
  // ═══════════════════════════════════════════════════════════════════════════

  record('6. Database and data integrity', '6.1 Workspace must have valid parent organization relationship', () => {
    const allWorkspaces = Array.from(db.getState().workspaces.values());
    for (const ws of allWorkspaces) {
      const org = db.getState().organizations.get(ws.organizationId);
      if (!org) {
        throw new Error(`Orphaned workspace found without valid organization: ${ws.id}`);
      }
    }
  });

  record('6. Database and data integrity', '6.2 Financial calculations remain consistent after unit COGS update', () => {
    const wsId = DEMO_WORKSPACE_ID;
    const initialSummary = AnalyticsService.getFinancialSummary(wsId, 'owner');

    // Simulate updating COGS on one order
    const orders = db.getState().orders.get(wsId) || [];
    if (orders.length > 0) {
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
      // Gross profit should drop by exactly 10
      if (Math.round(initialSummary.grossProfit - updatedSummary.grossProfit) !== 10) {
        throw new Error('FAILED: Summary gross profit did not reflect order COGS update consistently');
      }
    }
  });

  return results;
}
