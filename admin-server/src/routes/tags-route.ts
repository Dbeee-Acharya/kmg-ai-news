import { Hono } from 'hono';
import { TagsService } from '../services/tags-service.js';
import { adminAuthMiddleware } from '../middleware/admin-auth-middleware.js';
import type { Variables } from '../types/hono-types.js';

const tagsRouter = new Hono<{ Variables: Variables }>();

tagsRouter.use('*', adminAuthMiddleware);

tagsRouter.get('/', async (c) => {
  try {
    const res = await TagsService.getAll();
    return c.json(res);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

tagsRouter.post('/', async (c) => {
  const { name } = await c.req.json();
  const user = c.get('user');
  const ip = c.req.header('x-forwarded-for') || '';
  const userAgent = c.req.header('user-agent') || '';
  try {
    const res = await TagsService.create(name, user, ip, userAgent);
    return c.json(res, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

tagsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const ip = c.req.header('x-forwarded-for') || '';
  const userAgent = c.req.header('user-agent') || '';
  try {
    const res = await TagsService.delete(id, user, ip, userAgent);
    if (!res) return c.json({ error: 'Tag not found' }, 404);
    return c.json({ message: 'Tag deleted', id: res.id });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

export { tagsRouter };
