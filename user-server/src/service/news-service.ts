import { db } from '../db/index.js';
import { 
  news, 
  users, 
  newsMedia, 
  newsLinks, 
  newsPlatforms,
  newsTags,
  newsAuthors,
  tags 
} from '../db/schema.js';
import { eq, and, desc, asc, lte, gte, sql, inArray } from 'drizzle-orm';
import { cacheService } from './cache-service.js';

const CACHE_TTL = 120; // 2 minutes

export class NewsService {
  /**
   * Get paginated news in blocks of 5 days
   */
  static async getPaginatedNews(page: number = 0, platform?: string) {
    const cacheKey = cacheService.generateKey('news_list', { page, platform: platform || 'all' });
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() - (page * 5));
    
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - ((page + 1) * 5));

    const filters = [
      eq(news.isPublished, true),
      lte(news.createdAt, endDate),
      gte(news.createdAt, startDate)
    ];

    if (platform) {
      filters.push(eq(newsPlatforms.platform, platform as any));
    }

    const query = db.select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      content: news.content,
      metadata: news.metadata,
      publishedAt: news.createdAt,
      eventDateEn: news.eventDateEn,
      eventDateNp: news.eventDateNp,
    })
    .from(news);

    if (platform) {
      (query as any).innerJoin(newsPlatforms, eq(news.id, newsPlatforms.newsId));
    }

    const newsItems = await (query as any)
      .where(and(...filters))
      .orderBy(desc(news.createdAt));

    const results = await this.attachRelations(newsItems);

    await cacheService.set(cacheKey, results, CACHE_TTL);
    return results;
  }

  /**
   * Search news by title, content, tags, or metadata using full-text search
   */
  static async searchNews(queryText: string) {
    const cacheKey = cacheService.generateKey('news_search', { q: queryText });
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const searchTerms = queryText.trim().split(/\s+/).join(' & ');
    
    const newsItems = await db.select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      content: news.content,
      metadata: news.metadata,
      publishedAt: news.createdAt,
      eventDateEn: news.eventDateEn,
      eventDateNp: news.eventDateNp,
    })
    .from(news)
    .where(
      and(
        eq(news.isPublished, true),
        sql`(
          to_tsvector('simple', coalesce(${news.title}, '') || ' ' || coalesce(${news.content}, '') || ' ' || coalesce(${news.metadata}, ''))
          @@ to_tsquery('simple', ${searchTerms})
          OR EXISTS (
            SELECT 1 FROM ${newsTags}
            INNER JOIN ${tags} ON ${newsTags.tagId} = ${tags.id}
            WHERE ${newsTags.newsId} = ${news.id}
            AND ${tags.name} ILIKE ${'%' + queryText.toLowerCase().trim() + '%'}
          )
        )`
      )
    )
    .orderBy(desc(news.createdAt))
    .limit(20);

    const results = await this.attachRelations(newsItems);

    await cacheService.set(cacheKey, results, CACHE_TTL);
    return results;
  }

  /**
   * Attach media, links, tags, and authors to news items in bulk
   */
  private static async attachRelations(newsItems: any[]) {
    if (newsItems.length === 0) return [];

    const newsIds = newsItems.map(item => item.id);

    // Media
    const allMedia = await db.select({
      newsId: newsMedia.newsId,
      type: newsMedia.type,
      url: newsMedia.url,
      sortOrder: newsMedia.sortOrder
    })
    .from(newsMedia)
    .where(inArray(newsMedia.newsId, newsIds))
    .orderBy(asc(newsMedia.sortOrder));

    // Links
    const allLinks = await db.select({
      newsId: newsLinks.newsId,
      label: newsLinks.label,
      url: newsLinks.url,
      sortOrder: newsLinks.sortOrder
    })
    .from(newsLinks)
    .where(inArray(newsLinks.newsId, newsIds))
    .orderBy(asc(newsLinks.sortOrder));

    // Tags
    const allNewsTags = await db.select({
      newsId: newsTags.newsId,
      name: tags.name,
    })
    .from(newsTags)
    .innerJoin(tags, eq(newsTags.tagId, tags.id))
    .where(inArray(newsTags.newsId, newsIds));

    // Authors
    const allAuthors = await db.select({
      newsId: newsAuthors.newsId,
      name: users.name,
      portfolioLink: users.portfolioLink,
    })
    .from(newsAuthors)
    .innerJoin(users, eq(newsAuthors.userId, users.id))
    .where(inArray(newsAuthors.newsId, newsIds));

    return newsItems.map(item => {
      const { id, ...rest } = item;
      return {
        ...rest,
        media: allMedia.filter(m => m.newsId === id).map(({ newsId, ...m }) => m),
        links: allLinks.filter(l => l.newsId === id).map(({ newsId, ...l }) => l),
        tags: allNewsTags.filter(t => t.newsId === id).map(t => t.name),
        authors: allAuthors.filter(a => a.newsId === id).map(({ newsId, ...a }) => a),
      };
    });
  }

  /**
   * Get news details by slug
   */
  static async getNewsBySlug(slug: string) {
    const cacheKey = cacheService.generateKey('news_detail', { slug });
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const [record] = await db.select({
      id: news.id,
      title: news.title,
      content: news.content,
      slug: news.slug,
      keywords: news.keywords,
      metadata: news.metadata,
      publishedAt: news.createdAt,
      eventDateEn: news.eventDateEn,
      eventDateNp: news.eventDateNp,
      ogImage: news.ogImage,
    })
    .from(news)
    .where(and(eq(news.slug, slug), eq(news.isPublished, true)))
    .limit(1);

    if (!record) return null;

    const newsId = record.id;

    // Media
    const media = await db.select({
      type: newsMedia.type,
      url: newsMedia.url,
      sortOrder: newsMedia.sortOrder
    })
    .from(newsMedia)
    .where(eq(newsMedia.newsId, newsId))
    .orderBy(asc(newsMedia.sortOrder));

    // Links
    const links = await db.select({
      label: newsLinks.label,
      url: newsLinks.url,
      sortOrder: newsLinks.sortOrder
    })
    .from(newsLinks)
    .where(eq(newsLinks.newsId, newsId))
    .orderBy(asc(newsLinks.sortOrder));

    // Tags
    const tagRows = await db.select({ name: tags.name })
      .from(newsTags)
      .innerJoin(tags, eq(newsTags.tagId, tags.id))
      .where(eq(newsTags.newsId, newsId));

    // Authors
    const authorRows = await db.select({
      name: users.name,
      portfolioLink: users.portfolioLink,
    })
    .from(newsAuthors)
    .innerJoin(users, eq(newsAuthors.userId, users.id))
    .where(eq(newsAuthors.newsId, newsId));

    const finalResponse = {
      title: record.title,
      content: record.content,
      slug: record.slug,
      keywords: record.keywords,
      tags: tagRows.map(t => t.name),
      authors: authorRows,
      metadata: record.metadata || '',
      publishedAt: record.publishedAt,
      eventDateEn: record.eventDateEn,
      eventDateNp: record.eventDateNp,
      media,
      links,
      ogImage: record.ogImage,
    };

    await cacheService.set(cacheKey, finalResponse, CACHE_TTL);
    return finalResponse;
  }

  /**
   * Get all published news slugs and update times for sitemap
   */
  static async getSitemapData() {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    return await db.select({
      slug: news.slug,
      updatedAt: news.updatedAt,
    })
    .from(news)
    .where(
      and(
        eq(news.isPublished, true),
        gte(news.createdAt, lastWeek)
      )
    )
    .orderBy(desc(news.createdAt));
  }
}
