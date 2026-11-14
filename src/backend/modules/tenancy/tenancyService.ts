import { db } from '../../database/db';
import { AuthGuard } from '../auth/authGuard';
import { AuditService } from '../audit/auditService';
import type { Workspace, Store, UserRole } from '../../../types/security';

export class TenancyService {
  public static getWorkspaces(orgId: string): Workspace[] {
    const list: Workspace[] = [];
    for (const ws of db.getState().workspaces.values()) {
      if (ws.organizationId === orgId) {
        list.push(ws);
      }
    }
    return list;
  }

  public static getWorkspaceById(workspaceId: string): Workspace | undefined {
    return db.getState().workspaces.get(workspaceId);
  }

  public static createLiveWorkspace(params: {
    orgId: string;
    name: string;
    currency?: string;
    timezone?: string;
    userRole: UserRole;
    userId: string;
  }): Workspace {
    AuthGuard.assertPermission(params.userRole, 'org:manage');

    const newWs: Workspace = {
      id: crypto.randomUUID(),
      organizationId: params.orgId,
      name: params.name,
      isDemo: false,
      currency: params.currency || 'USD',
      timezone: params.timezone || 'UTC',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const state = db.getState();
    state.workspaces.set(newWs.id, newWs);

    // Initialize empty collections for live workspace
    state.orders.set(newWs.id, []);
    state.products.set(newWs.id, []);
    state.expenses.set(newWs.id, []);
    state.marketingChannels.set(newWs.id, []);
    state.inventoryItems.set(newWs.id, []);
    state.risks.set(newWs.id, []);
    state.alerts.set(newWs.id, []);
    state.trendData.set(newWs.id, []);

    AuditService.log(
      newWs.id,
      'workspace:created',
      'workspace',
      { name: newWs.name, isDemo: false },
      params.userId,
      newWs.id
    );

    return newWs;
  }

  public static getStoresByWorkspace(workspaceId: string): Store[] {
    const stores: Store[] = [];
    for (const s of db.getState().stores.values()) {
      if (s.workspaceId === workspaceId) {
        stores.push(s);
      }
    }
    return stores;
  }
}
