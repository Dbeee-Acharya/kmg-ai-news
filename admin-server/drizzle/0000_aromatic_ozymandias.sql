CREATE TYPE "public"."media_type" AS ENUM('image', 'video_url', 'image_url');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('x', 'instagram', 'facebook', 'tiktok', 'youtube', 'web', 'reddit', 'whatsapp', 'viber', 'telegram', 'email', 'tv', 'radio', 'print', 'others');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"metadata" jsonb,
	"ip" "inet",
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"slug" text NOT NULL,
	"keywords" text[],
	"metadata" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"event_date_en" date,
	"event_date_np" text,
	"reporter_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_authors" (
	"news_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"news_id" uuid NOT NULL,
	"label" text,
	"url" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"news_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_platforms" (
	"news_id" uuid NOT NULL,
	"platform" "platform" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_tags" (
	"news_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"portfolio_link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_authors" ADD CONSTRAINT "news_authors_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_authors" ADD CONSTRAINT "news_authors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_links" ADD CONSTRAINT "news_links_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_media" ADD CONSTRAINT "news_media_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_platforms" ADD CONSTRAINT "news_platforms_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_tags" ADD CONSTRAINT "news_tags_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_tags" ADD CONSTRAINT "news_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_logs_user_created_idx" ON "activity_logs" USING btree ("user_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX "activity_logs_entity_idx" ON "activity_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "news_slug_idx" ON "news" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "news_published_idx" ON "news" USING btree ("is_published","published_at" DESC);--> statement-breakpoint
CREATE INDEX "news_event_date_idx" ON "news" USING btree ("event_date_en");--> statement-breakpoint
CREATE INDEX "news_reporter_idx" ON "news" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "news_fts_idx" ON "news" USING gin (to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("content", '') || ' ' || coalesce("metadata", '')));--> statement-breakpoint
CREATE UNIQUE INDEX "news_authors_pk" ON "news_authors" USING btree ("news_id","user_id");--> statement-breakpoint
CREATE INDEX "news_authors_user_idx" ON "news_authors" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "news_links_order_unique" ON "news_links" USING btree ("news_id","sort_order");--> statement-breakpoint
CREATE INDEX "news_links_order_idx" ON "news_links" USING btree ("news_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "news_media_order_unique" ON "news_media" USING btree ("news_id","sort_order");--> statement-breakpoint
CREATE INDEX "news_media_order_idx" ON "news_media" USING btree ("news_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "news_platforms_pk" ON "news_platforms" USING btree ("news_id","platform");--> statement-breakpoint
CREATE INDEX "news_platforms_platform_idx" ON "news_platforms" USING btree ("platform");--> statement-breakpoint
CREATE UNIQUE INDEX "news_tags_pk" ON "news_tags" USING btree ("news_id","tag_id");--> statement-breakpoint
CREATE INDEX "news_tags_tag_idx" ON "news_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_idx" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");