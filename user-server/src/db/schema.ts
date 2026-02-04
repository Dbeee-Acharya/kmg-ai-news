import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  date,
  integer,
  jsonb,
  inet,
  pgEnum,
  uniqueIndex,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const platformEnum = pgEnum("platform", [
  "x",
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
  "web",
  "reddit",
  "whatsapp",
  "viber",
  "telegram",
  "email",
  "tv",
  "radio",
  "print",
  "others",
]);

export const mediaTypeEnum = pgEnum("media_type", [
  "image",
  "video_url",
  "image_url",
]);

// ============================================================================
// USERS
// ============================================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    portfolioLink: text("portfolio_link"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

// ============================================================================
// TAGS
// ============================================================================

export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(), // stored normalized/lowercased
  },
  (table) => [uniqueIndex("tags_name_idx").on(table.name)],
);

// ============================================================================
// NEWS
// ============================================================================

export const news = pgTable(
  "news",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    slug: text("slug").notNull(),
    keywords: text("keywords").array(), // optional; tags are still normalized
    isPublished: boolean("is_published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    eventDateEn: date("event_date_en"), // English date
    eventDateNp: text("event_date_np"), // Nepali date string for display only
    reporterId: uuid("reporter_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("news_slug_idx").on(table.slug),
    index("news_published_idx").on(
      table.isPublished,
      sql`${table.publishedAt} DESC`,
    ),
    index("news_event_date_idx").on(table.eventDateEn),
    index("news_reporter_idx").on(table.reporterId),
    // Full-text search GIN index on title + content
    index("news_fts_idx").using(
      "gin",
      sql`to_tsvector('simple', coalesce(${table.title}, '') || ' ' || coalesce(${table.content}, ''))`,
    ),
  ],
);

// ============================================================================
// NEWS PLATFORMS (M:N Join Table)
// ============================================================================

export const newsPlatforms = pgTable(
  "news_platforms",
  {
    newsId: uuid("news_id")
      .notNull()
      .references(() => news.id, { onDelete: "cascade" }),
    platform: platformEnum("platform").notNull(),
  },
  (table) => [
    // Composite primary key
    uniqueIndex("news_platforms_pk").on(table.newsId, table.platform),
    // Index for fast platform filtering
    index("news_platforms_platform_idx").on(table.platform),
  ],
);

// ============================================================================
// NEWS TAGS (M:N Join Table)
// ============================================================================

export const newsTags = pgTable(
  "news_tags",
  {
    newsId: uuid("news_id")
      .notNull()
      .references(() => news.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    // Composite primary key
    uniqueIndex("news_tags_pk").on(table.newsId, table.tagId),
    // Index for tag-based search
    index("news_tags_tag_idx").on(table.tagId),
  ],
);

// ============================================================================
// NEWS MEDIA (Ordered)
// ============================================================================

export const newsMedia = pgTable(
  "news_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsId: uuid("news_id")
      .notNull()
      .references(() => news.id, { onDelete: "cascade" }),
    type: mediaTypeEnum("type").notNull(),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull(), // 1..n
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Enforce ordering uniqueness per news item
    uniqueIndex("news_media_order_unique").on(table.newsId, table.sortOrder),
    // Index for efficient ordered retrieval
    index("news_media_order_idx").on(table.newsId, table.sortOrder),
  ],
);

// ============================================================================
// NEWS LINKS (Ordered Reference Links)
// ============================================================================

export const newsLinks = pgTable(
  "news_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsId: uuid("news_id")
      .notNull()
      .references(() => news.id, { onDelete: "cascade" }),
    label: text("label"), // nullable
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => [
    // Enforce ordering uniqueness per news item
    uniqueIndex("news_links_order_unique").on(table.newsId, table.sortOrder),
    // Index for efficient ordered retrieval
    index("news_links_order_idx").on(table.newsId, table.sortOrder),
  ],
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;

export type NewsPlatform = typeof newsPlatforms.$inferSelect;
export type NewNewsPlatform = typeof newsPlatforms.$inferInsert;

export type NewsTag = typeof newsTags.$inferSelect;
export type NewNewsTag = typeof newsTags.$inferInsert;

export type NewsMedia = typeof newsMedia.$inferSelect;
export type NewNewsMedia = typeof newsMedia.$inferInsert;

export type NewsLink = typeof newsLinks.$inferSelect;
export type NewNewsLink = typeof newsLinks.$inferInsert;
