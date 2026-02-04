import { db } from '../db/index.js';
import { 
  news, 
  users, 
  newsMedia, 
  newsLinks, 
  newsTags, 
  tags, 
  newsPlatforms 
} from '../db/schema.js';
import { eq, and, desc, asc, lte, gte, ilike, or, sql } from 'drizzle-orm';
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
      title: news.title,
      slug: news.slug,
      content: news.content,
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

    const results = await (query as any)
      .where(and(...filters))
      .orderBy(desc(news.publishedAt));

    await cacheService.set(cacheKey, results);
    return results;
  }

  /**
   * Search news by title or content
   */
  static async searchNews(queryText: string) {
    const cacheKey = cacheService.generateKey('news_search', { q: queryText });
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const results = await db.select({
      title: news.title,
      slug: news.slug,
      publishedAt: news.publishedAt,
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
        or(
          ilike(news.title, `%${queryText}%`),
          ilike(news.content, `%${queryText}%`)
        )
      )
    )
    .orderBy(desc(news.publishedAt))
    .limit(20);

    await cacheService.set(cacheKey, results);
    return results;
  }

  /**
   * Get news details by slug including media, links, and tags
   */
  static async getNewsBySlug(slug: string) {
    const cacheKey = cacheService.generateKey('news_detail', { slug });
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    // 1. Get main news record
    const [record] = await db.select({
      id: news.id, // We need ID to fetch relations but won't return it in final object
      title: news.title,
      content: news.content,
      slug: news.slug,
      keywords: news.keywords,
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
    const newsTagsList = await db.select({
      name: tags.name,
    })
    .from(newsTags)
    .innerJoin(tags, eq(newsTags.tagId, tags.id))
    .where(eq(newsTags.newsId, newsId));

    // Assemble final response (excluding internal ID)
    const finalResponse = {
      title: record.title,
      content: record.content,
      slug: record.slug,
      keywords: record.keywords,
      publishedAt: record.publishedAt,
      eventDateEn: record.eventDateEn,
      eventDateNp: record.eventDateNp,
      reporter: record.reporter,
      media,
      links,
      tags: newsTagsList.map(t => t.name),
    };

    await cacheService.set(cacheKey, finalResponse);
    return finalResponse;
  }
}
