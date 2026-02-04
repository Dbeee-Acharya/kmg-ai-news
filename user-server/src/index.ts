import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { config } from './config/config.js'

import { newsRouter } from './routes/user-news-route.js'
import { cors } from 'hono/cors'

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

app.get('/', (c) => {
  return c.text('User Server API is running')
})

app.route('/api/news', newsRouter)

serve({
  fetch: app.fetch,
  port: config.server.PORT
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
