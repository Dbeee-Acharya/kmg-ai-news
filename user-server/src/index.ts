import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { Context } from "hono";
import { config } from "./config/config.js";
import path from "path";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

import { newsRouter } from "./routes/user-news-route.js";
import { NewsService } from "./service/news-service.js";
import { cors } from "hono/cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();

const allowedOrigins = config.server.USER_FE_ORIGIN
  ? config.server.USER_FE_ORIGIN.split(",").map((origin) => origin.trim())
  : [];

// Helper to resolve HTML file paths for Production
const getHtmlPath = (filename: string) => {
  const distPath = path.resolve(__dirname, "../../user-fe/dist", filename);
  return distPath;
};

const normalizeOrigin = (origin: string) => {
  return origin.endsWith("/") ? origin.slice(0, -1) : origin;
};

const getConfiguredPrimaryOrigin = () => {
  const origin = config.server.USER_FE_ORIGIN?.split(",")[0]?.trim() || "";
  return origin ? normalizeOrigin(origin) : "";
};

const getRequestOrigin = (c: Context) => {
  const configured = getConfiguredPrimaryOrigin();
  if (configured) return configured;

  const forwardedProto = c.req
    .header("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const forwardedHost = c.req.header("x-forwarded-host")?.split(",")[0]?.trim();
  if (forwardedProto && forwardedHost) {
    return normalizeOrigin(`${forwardedProto}://${forwardedHost}`);
  }

  const host = c.req.header("host")?.trim();
  if (host) {
    const protocol = c.req.url.startsWith("https://") ? "https" : "http";
    return normalizeOrigin(`${protocol}://${host}`);
  }

  return normalizeOrigin(new URL(c.req.url).origin);
};

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

const toAbsoluteUrl = (url: string, origin: string) => {
  if (!url) return "";
  if (isAbsoluteUrl(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (!origin) return url;
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/", async (c) => {
  try {
    const htmlPath = getHtmlPath("index.html");
    const html = await readFile(htmlPath, "utf-8");
    c.header("Cache-Control", "no-store");
    return c.html(html);
  } catch (error) {
    return c.text("User Server API is running");
  }
});

// Dynamic OG tag injection for news detail pages using news.html template
app.get("/n/:slug", async (c) => {
  const slug = c.req.param("slug");
  const baseOrigin = getRequestOrigin(c);
  const pageUrl = baseOrigin ? `${baseOrigin}/n/${slug}` : "";
  const fallbackImage = `${baseOrigin}/og_image.png`;

  try {
    const newsItem = await NewsService.getNewsBySlug(slug);

    // Use the dedicated news.html template
    const htmlPath = getHtmlPath("news.html");
    let html = await readFile(htmlPath, "utf-8");

    if (newsItem) {
      const item = newsItem as any;
      const title = item.title || "Kantipur | Fact Checker";
      const description = item.title || "";
      const rawImage = item.ogImage || item.media?.[0]?.url || fallbackImage;
      const image = toAbsoluteUrl(rawImage, baseOrigin);

      html = html
        .replace(/__META_TITLE__/g, escapeHtml(title))
        .replace(/__META_DESCRIPTION__/g, escapeHtml(description))
        .replace(/__META_IMAGE__/g, escapeHtml(image))
        .replace(/__META_URL__/g, escapeHtml(pageUrl));
    } else {
      // Fallback if news not found in DB
      const title = "News Not Found | Kantipur";
      const description = "The requested news could not be found.";
      const image = toAbsoluteUrl(fallbackImage, baseOrigin);
      html = html
        .replace(/__META_TITLE__/g, escapeHtml(title))
        .replace(/__META_DESCRIPTION__/g, escapeHtml(description))
        .replace(/__META_IMAGE__/g, escapeHtml(image))
        .replace(/__META_URL__/g, escapeHtml(pageUrl));
    }

    c.header("Cache-Control", "no-store");
    return c.html(html);
  } catch (error) {
    console.error("OG Injection Error:", error);
    // Return original index.html if template injection fails
    try {
      const htmlPath = getHtmlPath("index.html");
      const html = await readFile(htmlPath, "utf-8");
      return c.html(html);
    } catch (e) {
      return c.text("Internal Server Error", 500);
    }
  }
});

// Dynamic Sitemap generation
app.get("/sitemap.xml", async (c) => {
  try {
    const newsItems = await NewsService.getSitemapData();
    const baseUrl = getRequestOrigin(c);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    for (const item of newsItems) {
      const lastMod = item.updatedAt
        ? new Date(item.updatedAt).toISOString()
        : new Date().toISOString();
      xml += `
  <url>
    <loc>${baseUrl}/n/${item.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    xml += "\n</urlset>";

    return c.text(xml, 200, {
      "Content-Type": "application/xml",
    });
  } catch (error) {
    console.error("Sitemap Error:", error);
    return c.text("Error generating sitemap", 500);
  }
});

app.route("/api/news", newsRouter);

// Fallback for all other frontend routes (SPA support)
app.get("*", async (c) => {
  const pathName = c.req.path;
  if (pathName.startsWith("/api") || pathName.includes(".")) {
    return;
  }

  try {
    const htmlPath = getHtmlPath("index.html");
    const html = await readFile(htmlPath, "utf-8");
    c.header("Cache-Control", "no-store");
    return c.html(html);
  } catch (error) {
    return c.notFound();
  }
});

serve(
  {
    fetch: app.fetch,
    port: config.server.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
