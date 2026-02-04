import { db } from '../db/index.js';
import { activityLogs, type NewActivityLog } from '../db/schema.js';

export class ActivityLogService {
  static async log(data: {
    userId?: string | null;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: any;
    ip?: string;
    userAgent?: string;
  }) {
    try {
      const newLog: NewActivityLog = {
        userId: data.userId === 'super-admin-uuid' ? null : data.userId, // Map superadmin placeholder to null in DB
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata,
        ip: data.ip,
        userAgent: data.userAgent,
      };

      await db.insert(activityLogs).values(newLog);
    } catch (error) {
      console.error('Failed to save activity log:', error);
      // We don't throw here to avoid failing the main operation if logging fails
    }
  }
}
