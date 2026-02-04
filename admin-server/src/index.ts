import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { config } from './config/config.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('ONLINE')
})

serve({
  fetch: app.fetch,
  port: config.server.PORT
}, (info) => {
  console.log(`Server is running on PORT:${info.port}`)
})
