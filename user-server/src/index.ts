import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { config } from './config/config.js'
import path from 'path'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'

import { newsRouter } from './routes/user-news-route.js'
import { NewsService } from './service/news-service.js'
import { cors } from 'hono/cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = new Hono()

const allowedOrigins = config.server.USER_FE_ORIGIN
  ? config.server.USER_FE_ORIGIN.split(",").map((origin) => origin.trim())
  : [];

// Helper to resolve HTML file paths for Dev vs Production
const getHtmlPath = (filename: string) => {
  // Check in dist first (Production) then fallback to root (Development)
  const distPath = path.resolve(__dirname, '../../user-fe/dist', filename);
  const rootPath = path.resolve(__dirname, '../../user-fe', filename);
  
  return distPath; 
};

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET"],
    allowHeaders: ["Content-Type"],
  })
);

app.get('/', async (c) => {
  try {
    const htmlPath = getHtmlPath('index.html')
    const html = await readFile(htmlPath, 'utf-8')
    return c.html(html)
  } catch (error) {
    return c.text('User Server API is running')
  }
})

// Dynamic OG tag injection for news detail pages using news.html template
app.get('/n/:slug', async (c) => {
  const slug = c.req.param('slug')
  
  try {
    const newsItem = await NewsService.getNewsBySlug(slug)
    
    // Use the dedicated news.html template
    const htmlPath = getHtmlPath('news.html')
    let html = await readFile(htmlPath, 'utf-8')
    
    if (newsItem) {
      const item = newsItem as any
      const title = item.title
      const description = item.title // Using title as description as requested
      const image = item.ogImage || (item.media?.[0]?.url) || ''
      
      html = html
        .replace(/__META_TITLE__/g, title)
        .replace(/__META_DESCRIPTION__/g, description)
        .replace(/__META_IMAGE__/g, image)
    } else {
      // Fallback if news not found in DB
      html = html
        .replace(/__META_TITLE__/g, 'News Not Found | Kantipur')
        .replace(/__META_DESCRIPTION__/g, 'The requested news could not be found.')
        .replace(/__META_IMAGE__/g, '')
    }
    
    return c.html(html)
  } catch (error) {
    console.error('OG Injection Error:', error)
    // Return original index.html if template injection fails
    try {
      const htmlPath = getHtmlPath('index.html')
      const html = await readFile(htmlPath, 'utf-8')
      return c.html(html)
    } catch (e) {
      return c.text('Internal Server Error', 500)
    }
  }
})

// Dynamic Sitemap generation
app.get('/sitemap.xml', async (c) => {
  try {
    const newsItems = await NewsService.getSitemapData();
    const baseUrl = config.server.USER_FE_ORIGIN?.split(',')[0]?.trim() || 'https://factcheck.ekantipur.com';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    for (const item of newsItems) {
      const lastMod = item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString();
      xml += `
  <url>
    <loc>${baseUrl}/n/${item.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    xml += '\n</urlset>';

    return c.text(xml, 200, {
      'Content-Type': 'application/xml',
    });
  } catch (error) {
    console.error('Sitemap Error:', error);
    return c.text('Error generating sitemap', 500);
  }
});

app.route('/api/news', newsRouter)

// Fallback for all other frontend routes (SPA support)
app.get('*', async (c) => {
  const pathName = c.req.path
  if (pathName.startsWith('/api') || pathName.includes('.')) {
    return 
  }
  
  try {
    const htmlPath = getHtmlPath('index.html')
    const html = await readFile(htmlPath, 'utf-8')
    return c.html(html)
  } catch (error) {
    return c.notFound()
  }
})

serve({
  fetch: app.fetch,
  port: config.server.PORT
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
