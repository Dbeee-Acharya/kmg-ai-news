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
    const htmlPath = path.resolve(__dirname, '../../user-fe/index.html')
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
    const htmlPath = path.resolve(__dirname, '../../user-fe/news.html')
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
      const htmlPath = path.resolve(__dirname, '../../user-fe/index.html')
      const html = await readFile(htmlPath, 'utf-8')
      return c.html(html)
    } catch (e) {
      return c.text('Internal Server Error', 500)
    }
  }
})

app.route('/api/news', newsRouter)

// Fallback for all other frontend routes (SPA support)
app.get('*', async (c) => {
  const pathName = c.req.path
  if (pathName.startsWith('/api') || pathName.includes('.')) {
    return 
  }
  
  try {
    const htmlPath = path.resolve(__dirname, '../../user-fe/index.html')
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
