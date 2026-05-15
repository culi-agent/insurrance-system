import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export type AuditAction =
  | 'create' | 'update' | 'delete' | 'view'
  | 'login' | 'logout' | 'password_change'
  | 'approve' | 'reject' | 'assign'
  | 'payment' | 'refund' | 'settlement'
  | 'export' | 'import' | 'config_change';

export type ResourceType =
  | 'customer' | 'policy' | 'claim' | 'payment'
  | 'product' | 'insurer' | 'quotation' | 'order'
  | 'user' | 'role' | 'config' | 'report';

export class AuditLogService {
  /**
   * Log an audit event
   */
  static async log(params: {
    userId: string;
    userEmail: string;
    userRole: string;
    action: AuditAction;
    resourceType: ResourceType;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await AppDataSource.query(
        `INSERT INTO audit_log (id, user_id, user_email, user_role, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
        [
          uuidv4(),
          params.userId,
          params.userEmail,
          params.userRole,
          params.action,
          params.resourceType,
          params.resourceId || null,
          JSON.stringify(params.details || {}),
          params.ipAddress || null,
          params.userAgent || null,
        ]
      );
    } catch (error) {
      // Don't throw - audit logging should not break the main flow
      logger.error('[AuditLog] Failed to log event:', error);
    }
  }

  /**
   * Query audit logs with filters
   */
  static async query(filters: {
    user_id?: string;
    action?: string;
    resource_type?: string;
    resource_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: AuditLogEntry[]; total: number; page: number; per_page: number }> {
    const page = filters.page || 1;
    const perPage = filters.per_page || 20;
    const offset = (page - 1) * perPage;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.user_id) {
      whereClause += ` AND user_id = $${paramIndex++}`;
      params.push(filters.user_id);
    }
    if (filters.action) {
      whereClause += ` AND action = $${paramIndex++}`;
      params.push(filters.action);
    }
    if (filters.resource_type) {
      whereClause += ` AND resource_type = $${paramIndex++}`;
      params.push(filters.resource_type);
    }
    if (filters.resource_id) {
      whereClause += ` AND resource_id = $${paramIndex++}`;
      params.push(filters.resource_id);
    }
    if (filters.start_date) {
      whereClause += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      whereClause += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.end_date);
    }

    const countResult = await AppDataSource.query(
      `SELECT COUNT(*) as total FROM audit_log ${whereClause}`,
      params
    );

    const data = await AppDataSource.query(
      `SELECT * FROM audit_log ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, perPage, offset]
    );

    return {
      data: data.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        user_email: row.user_email,
        user_role: row.user_role,
        action: row.action,
        resource_type: row.resource_type,
        resource_id: row.resource_id,
        details: row.details,
        ip_address: row.ip_address,
        user_agent: row.user_agent,
        created_at: row.created_at,
      })),
      total: parseInt(countResult[0].total),
      page,
      per_page: perPage,
    };
  }

  /**
   * Get activity summary for a user
   */
  static async getUserActivity(userId: string, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const activity = await AppDataSource.query(
      `SELECT action, resource_type, COUNT(*) as count
       FROM audit_log
       WHERE user_id = $1 AND created_at >= $2
       GROUP BY action, resource_type
       ORDER BY count DESC`,
      [userId, startDate]
    );

    const recentActions = await AppDataSource.query(
      `SELECT * FROM audit_log
       WHERE user_id = $1 AND created_at >= $2
       ORDER BY created_at DESC LIMIT 20`,
      [userId, startDate]
    );

    return {
      summary: activity.map((a: any) => ({
        action: a.action,
        resource_type: a.resource_type,
        count: parseInt(a.count),
      })),
      recent_actions: recentActions,
    };
  }
}
