import type {
  Order,
  Product,
  Expense,
  MarketingChannel,
  InventoryItem,
  Risk,
  Alert,
  TrendPoint,
} from '../../../src/types/index.js';
import type { UserRole } from '../../../src/types/security.js';

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  billingPlan: string;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipRecord {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
  createdAt: string;
}

export interface WorkspaceRecord {
  id: string;
  organizationId: string;
  name: string;
  isDemo: boolean;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreRecord {
  id: string;
  workspaceId: string;
  platform: 'shopify' | 'woocommerce' | 'csv_import' | 'demo_simulation';
  storeName: string;
  storeDomain?: string;
  currency: string;
  status: 'active' | 'disconnected' | 'error' | 'pending';
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogRecord {
  id: string;
  workspaceId: string;
  action: string;
  entityType: string;
  details: Record<string, unknown>;
  userId: string;
  targetId?: string;
  timestamp: string;
}

/**
 * Server Database Layer (In-memory Store matching normalized data models)
 */
class ServerStore {
  public users = new Map<string, UserRecord>();
  public organizations = new Map<string, OrganizationRecord>();
  public memberships = new Map<string, MembershipRecord>();
  public workspaces = new Map<string, WorkspaceRecord>();
  public stores = new Map<string, StoreRecord>();

  public orders = new Map<string, Order[]>();
  public products = new Map<string, Product[]>();
  public expenses = new Map<string, Expense[]>();
  public marketing = new Map<string, MarketingChannel[]>();
  public inventory = new Map<string, InventoryItem[]>();
  public risks = new Map<string, Risk[]>();
  public alerts = new Map<string, Alert[]>();
  public trendData = new Map<string, TrendPoint[]>();
  public auditLogs = new Map<string, AuditLogRecord[]>();

  public clear() {
    this.users.clear();
    this.organizations.clear();
    this.memberships.clear();
    this.workspaces.clear();
    this.stores.clear();
    this.orders.clear();
    this.products.clear();
    this.expenses.clear();
    this.marketing.clear();
    this.inventory.clear();
    this.risks.clear();
    this.alerts.clear();
    this.trendData.clear();
    this.auditLogs.clear();
  }
}

export const serverDb = new ServerStore();
