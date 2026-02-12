import { Hono } from "hono";
import { NewsService } from "../service/news-service.js";

const newsRouter = new Hono();

// Get paginated news in 5-day blocks
newsRouter.get("/", async (c) => {
  const page = parseInt(c.req.query("page") || "0");
  const platform = c.req.query("platform");

  try {
    const results = await NewsService.getPaginatedNews(page, platform);
    return c.json(results);
  } catch (error: any) {
    console.error("Failed to fetch paginated news:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// Search news
newsRouter.get("/search", async (c) => {
  const q = c.req.query("q");
  if (!q) {
    return c.json({ error: "Search query is required" }, 400);
  }

  try {
    const results = await NewsService.searchNews(q);
    return c.json(results);
  } catch (error: any) {
    console.error("Failed to search news:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// Get news details by slug
newsRouter.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  try {
    const newsItem = await NewsService.getNewsBySlug(slug);
    if (!newsItem) {
      return c.json({ error: "News not found" }, 404);
    }
    return c.json(newsItem);
  } catch (error: any) {
    console.error("Failed to fetch news by slug:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export { newsRouter };
