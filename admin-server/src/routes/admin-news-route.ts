import { Hono } from 'hono';
import { AdminNewsService } from '../services/admin-news-service.js';
import { adminAuthMiddleware } from '../middleware/admin-auth-middleware.js';

import type { Variables } from '../types/hono-types.js';

const newsRouter = new Hono<{ Variables: Variables }>();

// Apply auth middleware to all news routes
newsRouter.use('*', adminAuthMiddleware);

newsRouter.get('/', async (c) => {
  const user = c.get('user');
  try {
    const res = await AdminNewsService.getNews(user);
    return c.json(res);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

newsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  try {
    const res = await AdminNewsService.getNewsById(id, user);
    if (!res) return c.json({ error: 'News not found' }, 404);
    return c.json(res);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

newsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const user = c.get('user');
  const ip = c.req.header('x-forwarded-for') || '';
  const userAgent = c.req.header('user-agent') || '';
  
  try {
    const res = await AdminNewsService.createNews(body, user, ip, userAgent);
    return c.json(res, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

newsRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const user = c.get('user');
  const ip = c.req.header('x-forwarded-for') || '';
  const userAgent = c.req.header('user-agent') || '';

  try {
    const res = await AdminNewsService.updateNews(id, body, user, ip, userAgent);
    return c.json(res);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

newsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const ip = c.req.header('x-forwarded-for') || '';
  const userAgent = c.req.header('user-agent') || '';

  try {
    const res = await AdminNewsService.deleteNews(id, user, ip, userAgent);
    return c.json({ message: 'News deleted', id: res?.id });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

export { newsRouter };
