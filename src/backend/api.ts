import { SeedService, DEMO_WORKSPACE_ID, DEMO_ORG_ID, DEMO_USER_ID } from './seed/seedService';
import { TenancyService } from './modules/tenancy/tenancyService';
import { AnalyticsService } from './modules/analytics/analyticsService';
import { AnalystService } from './modules/analyst/analystService';
import { FinancialEngine } from './modules/engine/financialEngine';
import { AuditService } from './modules/audit/auditService';
import { AuthGuard } from './modules/auth/authGuard';
import type { UserRole, Workspace, Store, AuditLog } from '../types/security';
import type { FinancialSummary, Order, Product, Expense, MarketingChannel, InventoryItem, Risk, Alert, TrendPoint } from '../types';

// Ensure the demo database partition is seeded on startup
SeedService.seedDemoWorkspace();

export interface SessionContext {
  userId: string;
  userRole: UserRole;
  orgId: string;
  workspaceId: string;
}

/**
 * ProfitGuard Client API Bridge
 * Connects UI views to the modular backend services with full multi-tenant security
 */
export const api = {
  // Session & Workspace Context
  getDefaultSession(): SessionContext {
    return {
      userId: DEMO_USER_ID,
      userRole: 'owner',
      orgId: DEMO_ORG_ID,
      workspaceId: DEMO_WORKSPACE_ID,
    };
  },

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

  // Financial & Analytics Endpoints (Scoped strictly to workspaceId)
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

  // Secure Grounded AI Analyst
  queryAIAnalyst(session: SessionContext, question: string) {
    AuthGuard.assertSession(session);
    return AnalystService.query({
      workspaceId: session.workspaceId,
      question,
      role: session.userRole,
      userId: session.userId,
    });
  },

  // Audit Logs
  getAuditLogs(session: SessionContext): AuditLog[] {
    AuthGuard.assertSession(session);
    AuthGuard.assertPermission(session.userRole, 'org:manage');
    return AuditService.getLogs(session.workspaceId);
  },
};
