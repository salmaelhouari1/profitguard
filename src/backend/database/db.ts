import type { User, Organization, Membership, Workspace, Store, AuditLog } from '../../types/security';
import type { Order, Product, Expense, MarketingChannel, InventoryItem, Risk, Alert, TrendPoint } from '../../types';

export interface DatabaseState {
  users: Map<string, User>;
  organizations: Map<string, Organization>;
  memberships: Map<string, Membership>;
  workspaces: Map<string, Workspace>;
  stores: Map<string, Store>;
  auditLogs: AuditLog[];
  
  // Normalized tenant-scoped business entities keyed by workspaceId
  orders: Map<string, Order[]>;
  products: Map<string, Product[]>;
  expenses: Map<string, Expense[]>;
  marketingChannels: Map<string, MarketingChannel[]>;
  inventoryItems: Map<string, InventoryItem[]>;
  risks: Map<string, Risk[]>;
  alerts: Map<string, Alert[]>;
  trendData: Map<string, TrendPoint[]>;
}

// In-Memory Multi-Tenant Store with isolated partitioning
class DatabaseStore {
  private state: DatabaseState = {
    users: new Map(),
    organizations: new Map(),
    memberships: new Map(),
    workspaces: new Map(),
    stores: new Map(),
    auditLogs: [],
    orders: new Map(),
    products: new Map(),
    expenses: new Map(),
    marketingChannels: new Map(),
    inventoryItems: new Map(),
    risks: new Map(),
    alerts: new Map(),
    trendData: new Map(),
  };

  public getState(): DatabaseState {
    return this.state;
  }

  public reset(): void {
    this.state = {
      users: new Map(),
      organizations: new Map(),
      memberships: new Map(),
      workspaces: new Map(),
      stores: new Map(),
      auditLogs: [],
      orders: new Map(),
      products: new Map(),
      expenses: new Map(),
      marketingChannels: new Map(),
      inventoryItems: new Map(),
      risks: new Map(),
      alerts: new Map(),
      trendData: new Map(),
    };
  }
}

export const db = new DatabaseStore();
