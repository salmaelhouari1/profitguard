// ─── Multi-Tenant & Security Models ──────────────────────────────────────────

export type UserRole = 'owner' | 'admin' | 'financial_analyst' | 'viewer';

export interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  billingPlan: 'starter' | 'growth' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
  createdAt: string;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  isDemo: boolean;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export type StorePlatform = 'shopify' | 'woocommerce' | 'csv_import' | 'demo_simulation';
export type StoreStatus = 'active' | 'disconnected' | 'error' | 'pending';

export interface Store {
  id: string;
  workspaceId: string;
  platform: StorePlatform;
  storeName: string;
  storeDomain?: string;
  currency: string;
  status: StoreStatus;
  hasCredentials: boolean; // Never expose raw encrypted keys to UI
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}
