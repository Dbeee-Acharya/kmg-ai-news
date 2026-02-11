import { db } from '../db/index.js';
import { tags } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { ActivityLogService } from './activity-log-service.js';

export class TagsService {
  static async getAll() {
    return await db.select().from(tags).orderBy(asc(tags.name));
  }

  static async create(name: string, authUser?: any, ip?: string, userAgent?: string) {
    const normalized = name.toLowerCase().trim();
    if (!normalized) throw new Error('Tag name is required');

    // Return existing tag if duplicate
    const [existing] = await db.select().from(tags).where(eq(tags.name, normalized)).limit(1);
    if (existing) return existing;

    const [inserted] = await db.insert(tags).values({ name: normalized }).returning();

    if (authUser) {
      await ActivityLogService.log({
        userId: authUser.userId,
        action: 'tags.create',
        entityType: 'tags',
        entityId: inserted.id,
        metadata: { name: inserted.name },
        ip,
        userAgent,
      });
    }

    return inserted;
  }

  static async delete(id: string, authUser?: any, ip?: string, userAgent?: string) {
    const [deleted] = await db.delete(tags).where(eq(tags.id, id)).returning();
    
    if (deleted && authUser) {
      await ActivityLogService.log({
        userId: authUser.userId,
        action: 'tags.delete',
        entityType: 'tags',
        entityId: deleted.id,
        metadata: { name: deleted.name },
        ip,
        userAgent,
      });
    }

    return deleted;
  }

  /** Upsert multiple tags by name, returns tag IDs */
  static async upsertMany(names: string[]): Promise<string[]> {
    const normalized = names.map(n => n.toLowerCase().trim()).filter(Boolean);
    if (normalized.length === 0) return [];

    const ids: string[] = [];
    for (const name of normalized) {
      const tag = await this.create(name);
      ids.push(tag.id);
    }
    return ids;
  }
}
