import type { UserRole } from '../../../types/security';
import { db } from '../../database/db';

export type Permission =
  | 'org:manage'
  | 'team:manage'
  | 'stores:connect'
  | 'financials:edit'
  | 'reports:export'
  | 'analyst:query'
  | 'financials:view';

const rolePermissions: Record<UserRole, Permission[]> = {
  owner: [
    'org:manage',
    'team:manage',
    'stores:connect',
    'financials:edit',
    'reports:export',
    'analyst:query',
    'financials:view',
  ],
  admin: [
    'team:manage',
    'stores:connect',
    'financials:edit',
    'reports:export',
    'analyst:query',
    'financials:view',
  ],
  financial_analyst: [
    'financials:edit',
    'reports:export',
    'analyst:query',
    'financials:view',
  ],
  viewer: [
    'reports:export',
    'analyst:query',
    'financials:view',
  ],
};

export class AuthGuard {
  public static hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = rolePermissions[role];
    return permissions ? permissions.includes(permission) : false;
  }

  public static assertPermission(role: UserRole, permission: Permission): void {
    if (!this.hasPermission(role, permission)) {
      throw new Error(`Unauthorized: Role '${role}' lacks permission '${permission}'`);
    }
  }

  public static assertWorkspaceAccess(
    workspaceId: string,
    targetWorkspaceId: string
  ): void {
    if (workspaceId !== targetWorkspaceId) {
      throw new Error(`Access Denied: Tenant boundary mismatch (${workspaceId} != ${targetWorkspaceId})`);
    }
  }

  public static assertNotDemoWrite(isDemo: boolean, operation: string): void {
    if (isDemo) {
      throw new Error(`Forbidden: Write operations ('${operation}') are blocked on Demo workspaces`);
    }
  }

  public static assertSession(session: unknown): asserts session is {
    userId: string;
    userRole: UserRole;
    orgId: string;
    workspaceId: string;
  } {
    if (!session || typeof session !== 'object') {
      throw new Error('Unauthorized: Missing or invalid session context');
    }
    const s = session as Record<string, unknown>;
    if (!s.userId || !s.orgId || !s.workspaceId || !s.userRole) {
      throw new Error('Unauthorized: Session context missing required security parameters');
    }

    const state = db.getState();
    const user = state.users.get(String(s.userId));
    if (!user) {
      throw new Error(`Unauthorized: User '${s.userId}' not found in tenant directory`);
    }
    if (!user.isActive) {
      throw new Error(`Forbidden: User account '${s.userId}' is inactive or suspended`);
    }

    const ws = state.workspaces.get(String(s.workspaceId));
    if (!ws) {
      throw new Error(`Not Found: Workspace '${s.workspaceId}' does not exist`);
    }

    if (ws.organizationId !== s.orgId) {
      throw new Error(`Access Denied: Workspace '${s.workspaceId}' does not belong to organization '${s.orgId}'`);
    }
  }
}
