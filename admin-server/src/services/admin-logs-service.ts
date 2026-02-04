import { db } from '../db/index.js';
import { activityLogs, users } from '../db/schema.js';
import { desc, eq } from 'drizzle-orm';

export class AdminLogsService {
  static async getLogs() {
    return await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        entityType: activityLogs.entityType,
        entityId: activityLogs.entityId,
        metadata: activityLogs.metadata,
        ip: activityLogs.ip,
        userAgent: activityLogs.userAgent,
        createdAt: activityLogs.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .orderBy(desc(activityLogs.createdAt))
      .limit(100);
  }
}
