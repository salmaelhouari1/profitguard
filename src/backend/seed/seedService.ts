import { db } from '../database/db';
import { FinancialEngine } from '../modules/engine/financialEngine';
import { AuditService } from '../modules/audit/auditService';
import {
  orders as demoOrders,
  products as demoProducts,
  expenses as demoExpenses,
  marketingChannels as demoMarketing,
  inventoryItems as demoInventory,
  risks as demoRisks,
  alerts as demoAlerts,
  trendData as demoTrends,
} from '../../data/demo';
import type { User, Organization, Membership, Workspace, Store } from '../../types/security';

export const DEMO_ORG_ID = 'org_demo_default';
export const DEMO_WORKSPACE_ID = 'ws_demo_kitchen_co';
export const DEMO_USER_ID = 'usr_demo_admin';

export class SeedService {
  public static seedDemoWorkspace(): {
    organization: Organization;
    workspace: Workspace;
    user: User;
    membership: Membership;
    store: Store;
  } {
    const state = db.getState();

    // 1. Organization
    const organization: Organization = {
      id: DEMO_ORG_ID,
      name: 'Demo Retail Enterprise',
      slug: 'demo-retail',
      billingPlan: 'growth',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.organizations.set(organization.id, organization);

    // 2. Demo User
    const user: User = {
      id: DEMO_USER_ID,
      email: 'demo@profitguard.ai',
      fullName: 'Demo Store Director',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    state.users.set(user.id, user);

    // 3. Membership (Owner)
    const membership: Membership = {
      id: 'mem_demo_01',
      organizationId: organization.id,
      userId: user.id,
      role: 'owner',
      createdAt: new Date().toISOString(),
    };
    state.memberships.set(membership.id, membership);

    // 4. Isolated Demo Workspace (isDemo: true)
    const workspace: Workspace = {
      id: DEMO_WORKSPACE_ID,
      organizationId: organization.id,
      name: 'Demo Kitchen Co.',
      isDemo: true,
      currency: 'USD',
      timezone: 'America/New_York',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.workspaces.set(workspace.id, workspace);

    // 5. Simulated Store (No live credentials)
    const store: Store = {
      id: 'store_demo_shopify',
      workspaceId: workspace.id,
      platform: 'demo_simulation',
      storeName: 'Demo Kitchen Co.',
      storeDomain: 'demo-kitchen-co.myshopify.com',
      currency: 'USD',
      status: 'active',
      hasCredentials: false,
      lastSyncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.stores.set(store.id, store);

    // 6. Partition business entities under this workspaceId
    // Recalculate margins and profit via the FinancialEngine to ensure 100% calculation integrity
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

    state.orders.set(workspace.id, normalizedOrders);
    state.products.set(workspace.id, demoProducts);
    state.expenses.set(workspace.id, demoExpenses);
    state.marketingChannels.set(workspace.id, demoMarketing);
    state.inventoryItems.set(workspace.id, demoInventory);
    state.risks.set(workspace.id, demoRisks);
    state.alerts.set(workspace.id, demoAlerts);
    state.trendData.set(workspace.id, demoTrends);

    AuditService.log(
      workspace.id,
      'workspace:seeded',
      'workspace',
      { workspaceName: workspace.name, isDemo: true, ordersCount: normalizedOrders.length },
      user.id,
      workspace.id
    );

    return { organization, workspace, user, membership, store };
  }
}
