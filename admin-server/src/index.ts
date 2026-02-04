import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono, type Context } from 'hono'
import { config } from './config/config.js'
import { cors } from 'hono/cors'
import type { Variables } from './types/hono-types.js'

import { authRouter } from './routes/admin-auth-route.js'
import { logsRouter } from './routes/admin-logs-route.js'
import { newsRouter } from './routes/admin-news-route.js'
import { uploadRouter } from './routes/admin-upload-route.js'

const app = new Hono<{ Variables: Variables }>()

const allowedOrigins = config.server.ADMIN_FE_ORIGIN
  ? config.server.ADMIN_FE_ORIGIN.split(",").map((origin) => origin.trim())
  : [];

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
  })
);

app.route('/auth', authRouter)
app.route('/logs', logsRouter)
app.route('/news', newsRouter)
app.route('/upload', uploadRouter)

app.get('/', (c: Context<{ Variables: Variables }>) => {
  return c.text('ONLINE')
})

serve({
  fetch: app.fetch,
  port: config.server.PORT
}, (info) => {
  console.log(`Server is running on PORT:${info.port}`)
})
