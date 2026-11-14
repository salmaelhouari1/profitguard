import { db } from '../../database/db';
import { FinancialEngine } from '../engine/financialEngine';
import { AuthGuard } from '../auth/authGuard';
import type { FinancialSummary, Order, Product, Expense, MarketingChannel, InventoryItem, Risk, Alert, TrendPoint } from '../../../types';
import type { UserRole } from '../../../types/security';

export class AnalyticsService {
  public static getFinancialSummary(workspaceId: string, role: UserRole): FinancialSummary {
    AuthGuard.assertPermission(role, 'financials:view');
    const orders = this.getOrders(workspaceId, role);
    const marketing = this.getMarketingChannels(workspaceId, role);
    const totalAdSpend = marketing.reduce((sum, ch) => sum + ch.spend, 0);

    return FinancialEngine.computeSummary({
      orders,
      advertisingSpend: totalAdSpend,
      dateRange: 'Oct 1 – Oct 31, 2026',
    });
  }

  public static getOrders(workspaceId: string, role: UserRole): Order[] {
    AuthGuard.assertPermission(role, 'financials:view');
    return db.getState().orders.get(workspaceId) || [];
  }

  public static getProducts(workspaceId: string, role: UserRole): Product[] {
    AuthGuard.assertPermission(role, 'financials:view');
    return db.getState().products.get(workspaceId) || [];
  }

  public static getExpenses(workspaceId: string, role: UserRole): Expense[] {
    AuthGuard.assertPermission(role, 'financials:view');
    return db.getState().expenses.get(workspaceId) || [];
  }

  public static getMarketingChannels(workspaceId: string, role: UserRole): MarketingChannel[] {
    AuthGuard.assertPermission(role, 'financials:view');
    return db.getState().marketingChannels.get(workspaceId) || [];
  }

  public static getInventoryItems(workspaceId: string, role: UserRole): InventoryItem[] {
    AuthGuard.assertPermission(role, 'financials:view');
    return db.getState().inventoryItems.get(workspaceId) || [];
  }

  public static getRisks(workspaceId: string, role: UserRole): Risk[] {
    AuthGuard.assertPermission(role, 'financials:view');
    return db.getState().risks.get(workspaceId) || [];
  }

  public static getAlerts(workspaceId: string, role: UserRole): Alert[] {
    AuthGuard.assertPermission(role, 'financials:view');
    return db.getState().alerts.get(workspaceId) || [];
  }

  public static getTrendData(workspaceId: string, role: UserRole): TrendPoint[] {
    AuthGuard.assertPermission(role, 'financials:view');
    return db.getState().trendData.get(workspaceId) || [];
  }
}
