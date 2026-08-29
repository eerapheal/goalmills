/**
 * GoalMills Admin — Production Audit Logging Engine
 * Records security-sensitive operations (role escalations, deletions, publications, payroll modifications)
 * without logging confidential secrets or credentials.
 */

export interface AuditLogEntry {
  actorId?: string;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'SUCCESS' | 'FAILURE' | 'DENIED';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export function logAdminAction(entry: AuditLogEntry): void {
  const timestamp = entry.timestamp || new Date().toISOString();
  
  // Strip sensitive keys from metadata if present
  const sanitizedMeta: Record<string, any> = {};
  if (entry.metadata) {
    for (const [k, v] of Object.entries(entry.metadata)) {
      const lower = k.toLowerCase();
      if (
        lower.includes('password') ||
        lower.includes('secret') ||
        lower.includes('token') ||
        lower.includes('key')
      ) {
        sanitizedMeta[k] = '[REDACTED]';
      } else {
        sanitizedMeta[k] = v;
      }
    }
  }

  const logPayload = {
    type: 'ADMIN_AUDIT_LOG',
    timestamp,
    actorId: entry.actorId || 'system',
    actorEmail: entry.actorEmail || 'anonymous',
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId || null,
    status: entry.status,
    ipAddress: entry.ipAddress || null,
    metadata: sanitizedMeta,
  };

  console.log(JSON.stringify(logPayload));
}

export default logAdminAction;
