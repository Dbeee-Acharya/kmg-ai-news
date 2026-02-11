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
  try {
    const res = await TagsService.create(name);
    return c.json(res, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

tagsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const res = await TagsService.delete(id);
    if (!res) return c.json({ error: 'Tag not found' }, 404);
    return c.json({ message: 'Tag deleted', id: res.id });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

export { tagsRouter };
