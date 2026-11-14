import { db } from './database/db';
import { SeedService } from './seed/seedService';
import { TenancyService } from './modules/tenancy/tenancyService';
import { AnalyticsService } from './modules/analytics/analyticsService';
import { AnalystService } from './modules/analyst/analystService';
import { FinancialEngine } from './modules/engine/financialEngine';
import { AuditService } from './modules/audit/auditService';
import { AuthGuard } from './modules/auth/authGuard';
import type { UserRole, Workspace, Store, AuditLog, User, Organization } from '../types/security';
import type { FinancialSummary, Order, Product, Expense, MarketingChannel, InventoryItem, Risk, Alert, TrendPoint } from '../types';

export interface SessionContext {
  userId: string;
  userRole: UserRole;
  orgId: string;
  workspaceId: string;
}

const STORAGE_KEY_AUTH = 'profitguard_auth_user';

export const api = {
  // ─── Legacy / Compatibility Helper ───────────────────────────────────────
  getDefaultSession(): SessionContext {
    const current = this.getCurrentUser();
    if (current) {
      return {
        userId: current.user.id,
        userRole: current.role,
        orgId: current.org.id,
        workspaceId: current.workspace.id,
      };
    }
    // Auto-create or return default initial user session if none exists
    const initial = this.signup({
      fullName: 'Store Owner',
      email: 'owner@profitguard.local',
      organizationName: 'My E-Commerce Brand',
      workspaceName: 'Primary Store',
    });
    return initial.session;
  },

  // ─── Real Authentication ──────────────────────────────────────────────────
  getCurrentUser(): { user: User; org: Organization; workspace: Workspace; role: UserRole } | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH);
      if (!stored) return null;
      const data = JSON.parse(stored);
      // Validate with in-memory state
      const state = db.getState();
      const user = state.users.get(data.userId);
      const org = state.organizations.get(data.orgId);
      const ws = state.workspaces.get(data.workspaceId);
      if (!user || !org || !ws) {
        // Re-hydrate state if page refreshed
        if (data.user) state.users.set(data.user.id, data.user);
        if (data.org) state.organizations.set(data.org.id, data.org);
        if (data.workspace) state.workspaces.set(data.workspace.id, data.workspace);
        if (data.membership) state.memberships.set(data.membership.id, data.membership);
        return {
          user: data.user,
          org: data.org,
          workspace: data.workspace,
          role: data.role,
        };
      }
      return { user, org, workspace: ws, role: data.role };
    } catch {
      return null;
    }
  },

  signup(params: { fullName: string; email: string; organizationName: string; workspaceName?: string }): {
    user: User;
    org: Organization;
    workspace: Workspace;
    session: SessionContext;
  } {
    const state = db.getState();
    const userId = crypto.randomUUID();
    const orgId = crypto.randomUUID();
    const workspaceId = crypto.randomUUID();
    const membershipId = crypto.randomUUID();

    const user: User = {
      id: userId,
      email: params.email.trim().toLowerCase(),
      fullName: params.fullName.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const org: Organization = {
      id: orgId,
      name: params.organizationName.trim(),
      slug: params.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      billingPlan: 'starter',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const workspace: Workspace = {
      id: workspaceId,
      organizationId: orgId,
      name: params.workspaceName?.trim() || `${params.organizationName.trim()} Primary`,
      isDemo: false, // Default is REAL, non-demo workspace!
      currency: 'USD',
      timezone: 'UTC',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const membership = {
      id: membershipId,
      organizationId: orgId,
      userId: user.id,
      role: 'owner' as UserRole,
      createdAt: new Date().toISOString(),
    };

    state.users.set(user.id, user);
    state.organizations.set(org.id, org);
    state.workspaces.set(workspace.id, workspace);
    state.memberships.set(membership.id, membership);

    // Initialize clean, empty operational tables for real workspace
    state.orders.set(workspace.id, []);
    state.products.set(workspace.id, []);
    state.expenses.set(workspace.id, []);
    state.marketingChannels.set(workspace.id, []);
    state.inventoryItems.set(workspace.id, []);
    state.risks.set(workspace.id, []);
    state.alerts.set(workspace.id, []);
    state.trendData.set(workspace.id, []);

    const session: SessionContext = {
      userId: user.id,
      userRole: 'owner',
      orgId: org.id,
      workspaceId: workspace.id,
    };

    localStorage.setItem(
      STORAGE_KEY_AUTH,
      JSON.stringify({
        userId: user.id,
        orgId: org.id,
        workspaceId: workspace.id,
        role: 'owner',
        user,
        org,
        workspace,
        membership,
      })
    );

    AuditService.log(
      workspace.id,
      'auth:signup',
      'organization',
      { orgName: org.name, userEmail: user.email },
      user.id
    );

    return { user, org, workspace, session };
  },

  login(email: string): { user: User; org: Organization; workspace: Workspace; session: SessionContext } {
    const state = db.getState();
    const cleanEmail = email.trim().toLowerCase();
    let foundUser: User | undefined;
    for (const u of state.users.values()) {
      if (u.email === cleanEmail) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw new Error('Invalid email or user not found');
    }

    // Find org & workspace
    let org: Organization | undefined;
    let ws: Workspace | undefined;
    for (const mem of state.memberships.values()) {
      if (mem.userId === foundUser.id) {
        org = state.organizations.get(mem.organizationId);
        break;
      }
    }

    if (!org) {
      throw new Error('User has no active organization membership');
    }

    for (const w of state.workspaces.values()) {
      if (w.organizationId === org.id) {
        ws = w;
        break;
      }
    }

    if (!ws) {
      throw new Error('Organization has no active workspace');
    }

    const session: SessionContext = {
      userId: foundUser.id,
      userRole: 'owner',
      orgId: org.id,
      workspaceId: ws.id,
    };

    localStorage.setItem(
      STORAGE_KEY_AUTH,
      JSON.stringify({
        userId: foundUser.id,
        orgId: org.id,
        workspaceId: ws.id,
        role: 'owner',
        user: foundUser,
        org,
        workspace: ws,
      })
    );

    return { user: foundUser, org, workspace: ws, session };
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_AUTH);
  },

  // ─── Opt-in Demo Workspace Provisioning ──────────────────────────────────
  loadSampleDataWorkspace(session: SessionContext): Workspace {
    AuthGuard.assertSession(session);
    // Explicit opt-in: Creates a clearly labelled sample workspace under this organization
    const sampleWs = SeedService.seedOptInSampleWorkspace(session.orgId, session.userId);
    return sampleWs;
  },

  // ─── Tenancy & Workspaces ─────────────────────────────────────────────────
  getWorkspaces(orgId: string): Workspace[] {
    return TenancyService.getWorkspaces(orgId);
  },

  getWorkspace(workspaceId: string): Workspace | undefined {
    return TenancyService.getWorkspaceById(workspaceId);
  },

  createLiveWorkspace(session: SessionContext, name: string): Workspace {
    AuthGuard.assertSession(session);
    return TenancyService.createLiveWorkspace({
      orgId: session.orgId,
      name,
      userRole: session.userRole,
      userId: session.userId,
    });
  },

  getStores(workspaceId: string): Store[] {
    return TenancyService.getStoresByWorkspace(workspaceId);
  },

  // ─── Financial & Operational Analytics ────────────────────────────────────
  getFinancialSummary(session: SessionContext): FinancialSummary {
    AuthGuard.assertSession(session);
    return AnalyticsService.getFinancialSummary(session.workspaceId, session.userRole);
  },

  getOrders(session: SessionContext): Order[] {
    AuthGuard.assertSession(session);
    return AnalyticsService.getOrders(session.workspaceId, session.userRole);
  },

  getProducts(session: SessionContext): Product[] {
    AuthGuard.assertSession(session);
    return AnalyticsService.getProducts(session.workspaceId, session.userRole);
  },

  getExpenses(session: SessionContext): Expense[] {
    AuthGuard.assertSession(session);
    return AnalyticsService.getExpenses(session.workspaceId, session.userRole);
  },

  getMarketingChannels(session: SessionContext): MarketingChannel[] {
    AuthGuard.assertSession(session);
    return AnalyticsService.getMarketingChannels(session.workspaceId, session.userRole);
  },

  getInventoryItems(session: SessionContext): InventoryItem[] {
    AuthGuard.assertSession(session);
    return AnalyticsService.getInventoryItems(session.workspaceId, session.userRole);
  },

  getRisks(session: SessionContext): Risk[] {
    AuthGuard.assertSession(session);
    return AnalyticsService.getRisks(session.workspaceId, session.userRole);
  },

  getAlerts(session: SessionContext): Alert[] {
    AuthGuard.assertSession(session);
    return AnalyticsService.getAlerts(session.workspaceId, session.userRole);
  },

  getTrendData(session: SessionContext): TrendPoint[] {
    AuthGuard.assertSession(session);
    return AnalyticsService.getTrendData(session.workspaceId, session.userRole);
  },

  // ─── Secure Grounded AI Analyst ──────────────────────────────────────────
  queryAIAnalyst(session: SessionContext, question: string) {
    AuthGuard.assertSession(session);
    return AnalystService.query({
      workspaceId: session.workspaceId,
      question,
      role: session.userRole,
      userId: session.userId,
    });
  },

  // ─── Audit Trail ─────────────────────────────────────────────────────────
  getAuditLogs(session: SessionContext): AuditLog[] {
    AuthGuard.assertSession(session);
    AuthGuard.assertPermission(session.userRole, 'org:manage');
    return AuditService.getLogs(session.workspaceId);
  },
};
