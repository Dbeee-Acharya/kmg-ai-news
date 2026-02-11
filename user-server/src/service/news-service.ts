import { db } from '../db/index.js';
import { 
  news, 
  users, 
  newsMedia, 
  newsLinks, 
  newsPlatforms,
  newsTags,
  tags 
} from '../db/schema.js';
import { eq, and, desc, asc, lte, gte, sql, inArray } from 'drizzle-orm';
import { cacheService } from './cache-service.js';

export class NewsService {
  /**
   * Get paginated news in blocks of 5 days
   * @param page Page number (0-indexed)
   * @param platform Optional platform filter
   */
  static async getPaginatedNews(page: number = 0, platform?: string) {
    const cacheKey = cacheService.generateKey('news_list', { page, platform: platform || 'all' });
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    // Calculate date range: page 0 = now to 5 days ago, page 1 = 5 to 10 days ago, etc.
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() - (page * 5));
    
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - ((page + 1) * 5));

    // Base filters
    const filters = [
      eq(news.isPublished, true),
      lte(news.publishedAt, endDate),
      gte(news.publishedAt, startDate)
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
      publishedAt: news.publishedAt,
      eventDateEn: news.eventDateEn,
      eventDateNp: news.eventDateNp,
      reporter: {
        name: users.name,
        portfolioLink: users.portfolioLink,
      }
    })
    .from(news)
    .leftJoin(users, eq(news.reporterId, users.id));

    // Conditionally join platforms if filtering by one
    if (platform) {
      (query as any).innerJoin(newsPlatforms, eq(news.id, newsPlatforms.newsId));
    }

    const newsItems = await (query as any)
      .where(and(...filters))
      .orderBy(desc(news.publishedAt));

    const results = await this.attachRelations(newsItems);

    await cacheService.set(cacheKey, results);
    return results;
  }

  /**
   * Search news by title, content, tags, or metadata using full-text search
   */
  static async searchNews(queryText: string) {
    const cacheKey = cacheService.generateKey('news_search', { q: queryText });
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    // Use full-text search on title, content, metadata + array containment for tags
    const searchTerms = queryText.trim().split(/\s+/).join(' & ');
    
    const newsItems = await db.select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      content: news.content,
      metadata: news.metadata,
      publishedAt: news.publishedAt,
      eventDateEn: news.eventDateEn,
      eventDateNp: news.eventDateNp,
      reporter: {
        name: users.name,
        portfolioLink: users.portfolioLink,
      }
    })
    .from(news)
    .leftJoin(users, eq(news.reporterId, users.id))
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
    .orderBy(desc(news.publishedAt))
    .limit(20);

    const results = await this.attachRelations(newsItems);

    await cacheService.set(cacheKey, results);
    return results;
  }

  /**
   * Helper to attach media and links to news items in bulk (tags are now on news record)
   */
  private static async attachRelations(newsItems: any[]) {
    if (newsItems.length === 0) return [];

    const newsIds = newsItems.map(item => item.id);

    // 1. Get all Media for these news items
    const allMedia = await db.select({
      newsId: newsMedia.newsId,
      type: newsMedia.type,
      url: newsMedia.url,
      sortOrder: newsMedia.sortOrder
    })
    .from(newsMedia)
    .where(inArray(newsMedia.newsId, newsIds))
    .orderBy(asc(newsMedia.sortOrder));

    // 2. Get all Links for these news items
    const allLinks = await db.select({
      newsId: newsLinks.newsId,
      label: newsLinks.label,
      url: newsLinks.url,
      sortOrder: newsLinks.sortOrder
    })
    .from(newsLinks)
    .where(inArray(newsLinks.newsId, newsIds))
    .orderBy(asc(newsLinks.sortOrder));

    // 3. Get all Tags for these news items
    const allNewsTags = await db.select({
      newsId: newsTags.newsId,
      name: tags.name,
    })
    .from(newsTags)
    .innerJoin(tags, eq(newsTags.tagId, tags.id))
    .where(inArray(newsTags.newsId, newsIds));

    // Map relations back to news items
    return newsItems.map(item => {
      const { id, ...rest } = item;
      return {
        ...rest,
        media: allMedia.filter(m => m.newsId === id).map(({ newsId, ...m }) => m),
        links: allLinks.filter(l => l.newsId === id).map(({ newsId, ...l }) => l),
        tags: allNewsTags.filter(t => t.newsId === id).map(t => t.name),
      };
    });
  }

  /**
   * Get news details by slug including media, links, and tags
   */
  static async getNewsBySlug(slug: string) {
    const cacheKey = cacheService.generateKey('news_detail', { slug });
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    // 1. Get main news record (tags are now directly on the news record)
    const [record] = await db.select({
      id: news.id, // We need ID to fetch relations but won't return it in final object
      title: news.title,
      content: news.content,
      slug: news.slug,
      keywords: news.keywords,
      metadata: news.metadata,
      publishedAt: news.publishedAt,
      eventDateEn: news.eventDateEn,
      eventDateNp: news.eventDateNp,
      reporter: {
        name: users.name,
        portfolioLink: users.portfolioLink,
      }
    })
    .from(news)
    .leftJoin(users, eq(news.reporterId, users.id))
    .where(and(eq(news.slug, slug), eq(news.isPublished, true)))
    .limit(1);

    if (!record) return null;

    const newsId = record.id;

    // 2. Get Media
    const media = await db.select({
      type: newsMedia.type,
      url: newsMedia.url,
      sortOrder: newsMedia.sortOrder
    })
    .from(newsMedia)
    .where(eq(newsMedia.newsId, newsId))
    .orderBy(asc(newsMedia.sortOrder));

    // 3. Get Links
    const links = await db.select({
      label: newsLinks.label,
      url: newsLinks.url,
      sortOrder: newsLinks.sortOrder
    })
    .from(newsLinks)
    .where(eq(newsLinks.newsId, newsId))
    .orderBy(asc(newsLinks.sortOrder));

    // 4. Get Tags
    const tagRows = await db.select({ name: tags.name })
      .from(newsTags)
      .innerJoin(tags, eq(newsTags.tagId, tags.id))
      .where(eq(newsTags.newsId, newsId));

    // Assemble final response (excluding internal ID)
    const finalResponse = {
      title: record.title,
      content: record.content,
      slug: record.slug,
      keywords: record.keywords,
      tags: tagRows.map(t => t.name),
      metadata: record.metadata || '',
      publishedAt: record.publishedAt,
      eventDateEn: record.eventDateEn,
      eventDateNp: record.eventDateNp,
      reporter: record.reporter,
      media,
      links,
    };

    await cacheService.set(cacheKey, finalResponse);
    return finalResponse;
  }
}
