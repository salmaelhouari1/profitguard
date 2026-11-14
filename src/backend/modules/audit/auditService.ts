import { db } from '../../database/db';
import type { AuditLog } from '../../../types/security';

export class AuditService {
  public static log(
    workspaceId: string,
    action: string,
    resourceType: string,
    details: Record<string, unknown>,
    userId?: string,
    resourceId?: string,
    ipAddress: string = '127.0.0.1'
  ): AuditLog {
    const entry: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      workspaceId,
      userId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
      timestamp: new Date().toISOString(),
    };
    db.getState().auditLogs.push(entry);
    return entry;
  }

  public static getLogs(workspaceId: string): AuditLog[] {
    return db.getState().auditLogs.filter((log) => log.workspaceId === workspaceId);
  }
}
