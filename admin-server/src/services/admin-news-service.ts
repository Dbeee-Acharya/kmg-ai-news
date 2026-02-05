import { db } from '../db/index.js';
import { news, newsPlatforms, newsMedia, newsLinks, type NewNews } from '../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { ActivityLogService } from './activity-log-service.js';

export class AdminNewsService {
  static async getNews(authUser: any) {
    const filters = [];
    if (!authUser.isSuperAdmin) {
      filters.push(eq(news.reporterId, authUser.userId));
    }
    
    return await db.select()
      .from(news)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(news.createdAt));
  }

  static async getNewsById(id: string, authUser: any) {
    const filters = [eq(news.id, id)];
    if (!authUser.isSuperAdmin) {
      filters.push(eq(news.reporterId, authUser.userId));
    }

    const [record] = await db.select()
      .from(news)
      .where(and(...filters))
      .limit(1);
    if (!record) return null;

    const platforms = await db.select().from(newsPlatforms).where(eq(newsPlatforms.newsId, id));
    const media = await db.select().from(newsMedia).where(eq(newsMedia.newsId, id)).orderBy(newsMedia.sortOrder);
    const links = await db.select().from(newsLinks).where(eq(newsLinks.newsId, id)).orderBy(newsLinks.sortOrder);

    return {
      ...record,
      platforms: platforms.map(p => p.platform),
      media,
      links,
      tags: record.tags || [],
      metadata: record.metadata || '',
    };
  }

  static async createNews(data: any, authUser: any, ip?: string, userAgent?: string) {
    // Normalize tags to lowercase trimmed strings
    const normalizedTags = data.tags && Array.isArray(data.tags)
      ? data.tags.map((t: string) => t.toLowerCase().trim()).filter(Boolean)
      : null;

    const result = await db.transaction(async (tx) => {
      // 1. Insert news with tags and metadata directly
      const [inserted] = await tx.insert(news).values({
        title: data.title,
        content: data.content,
        slug: data.slug,
        keywords: data.keywords,
        tags: normalizedTags,
        metadata: data.metadata || null,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? new Date() : null,
        eventDateEn: data.eventDateEn ? new Date(data.eventDateEn).toISOString().split('T')[0] : null,
        eventDateNp: data.eventDateNp,
        reporterId: authUser.userId === 'super-admin-uuid' ? null : authUser.userId,
      }).returning();

      const newsId = inserted.id;

      // 2. Handle Platforms
      if (data.platforms && Array.isArray(data.platforms)) {
        const platformsData = data.platforms.map((p: any) => ({
          newsId,
          platform: p,
        }));
        if (platformsData.length > 0) {
          await tx.insert(newsPlatforms).values(platformsData);
        }
      }

      // Tags and metadata are now stored directly on the news record (handled above)

      // 4. Handle Media
      if (data.media && Array.isArray(data.media)) {
        const mediaData = data.media.map((m: any, index: number) => ({
          newsId,
          type: m.type,
          url: m.url,
          sortOrder: m.sortOrder || (index + 1),
        }));
        if (mediaData.length > 0) {
          await tx.insert(newsMedia).values(mediaData);
        }
      }

      // 5. Handle Links
      if (data.links && Array.isArray(data.links)) {
        const linksData = data.links.map((l: any, index: number) => ({
          newsId,
          label: l.label,
          url: l.url,
          sortOrder: l.sortOrder || (index + 1),
        }));
        if (linksData.length > 0) {
          await tx.insert(newsLinks).values(linksData);
        }
      }

      // Log activity
      await ActivityLogService.log({
        userId: authUser.userId,
        action: 'news.create',
        entityType: 'news',
        entityId: newsId,
        metadata: { title: inserted.title },
        ip,
        userAgent,
      });

      return inserted;
    });

    return result;
  }

  static async updateNews(id: string, data: any, authUser: any, ip?: string, userAgent?: string) {
    const updated = await db.transaction(async (tx) => {
      // 1. Update news main record (with ownership check if not super admin)
      const updateFilter = [eq(news.id, id)];
      if (!authUser.isSuperAdmin) {
        updateFilter.push(eq(news.reporterId, authUser.userId));
      }

      // Normalize tags to lowercase trimmed strings
      const normalizedTags = data.tags && Array.isArray(data.tags)
        ? data.tags.map((t: string) => t.toLowerCase().trim()).filter(Boolean)
        : undefined;

      const [record] = await tx.update(news)
        .set({
          title: data.title,
          content: data.content,
          slug: data.slug,
          keywords: data.keywords,
          tags: normalizedTags,
          metadata: data.metadata,
          isPublished: data.isPublished,
          publishedAt: data.isPublished ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : null,
          eventDateEn: data.eventDateEn ? new Date(data.eventDateEn).toISOString().split('T')[0] : null,
          eventDateNp: data.eventDateNp,
          updatedAt: new Date(),
        })
        .where(and(...updateFilter))
        .returning();

      if (!record) throw new Error('News not found');

      // 2. Update Platforms
      if (data.platforms && Array.isArray(data.platforms)) {
        await tx.delete(newsPlatforms).where(eq(newsPlatforms.newsId, id));
        const platformsData = data.platforms.map((p: any) => ({
          newsId: id,
          platform: p,
        }));
        if (platformsData.length > 0) {
          await tx.insert(newsPlatforms).values(platformsData);
        }
      }

      // Tags and metadata are now stored directly on the news record (handled above)

      // 4. Update Media
      if (data.media && Array.isArray(data.media)) {
        await tx.delete(newsMedia).where(eq(newsMedia.newsId, id));
        const mediaData = data.media.map((m: any, index: number) => ({
          newsId: id,
          type: m.type,
          url: m.url,
          sortOrder: m.sortOrder || (index + 1),
        }));
        if (mediaData.length > 0) {
          await tx.insert(newsMedia).values(mediaData);
        }
      }

      // 5. Update Links
      if (data.links && Array.isArray(data.links)) {
        await tx.delete(newsLinks).where(eq(newsLinks.newsId, id));
        const linksData = data.links.map((l: any, index: number) => ({
          newsId: id,
          label: l.label,
          url: l.url,
          sortOrder: l.sortOrder || (index + 1),
        }));
        if (linksData.length > 0) {
          await tx.insert(newsLinks).values(linksData);
        }
      }

      // Log activity
      await ActivityLogService.log({
        userId: authUser.userId,
        action: 'news.update',
        entityType: 'news',
        entityId: id,
        metadata: { title: record.title },
        ip,
        userAgent,
      });

      return record;
    });

    return updated;
  }

  static async deleteNews(id: string, authUser: any, ip?: string, userAgent?: string) {
    const deleteFilter = [eq(news.id, id)];
    if (!authUser.isSuperAdmin) {
      deleteFilter.push(eq(news.reporterId, authUser.userId));
    }

    const [deleted] = await db.delete(news)
      .where(and(...deleteFilter))
      .returning();

    if (deleted) {
      await ActivityLogService.log({
        userId: authUser.userId,
        action: 'news.delete',
        entityType: 'news',
        entityId: deleted.id,
        metadata: { title: deleted.title },
        ip,
        userAgent,
      });
    }

    return deleted;
  }
}
