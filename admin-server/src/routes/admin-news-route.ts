import { Hono } from 'hono';
import { AdminNewsService } from '../services/admin-news-service.js';
import { adminAuthMiddleware } from '../middleware/admin-auth-middleware.js';
import { storageService } from '../lib/LinodeService.js';

import type { Variables } from '../types/hono-types.js';

const newsRouter = new Hono<{ Variables: Variables }>();

// Apply auth middleware to all news routes
newsRouter.use('*', adminAuthMiddleware);

newsRouter.get('/', async (c) => {
  const user = c.get('user');
  const { page, limit, startDate, endDate, tags, sortOrder } = c.req.query();
  try {
    const filters = {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      tags: tags ? tags.split(',').filter(Boolean) : undefined,
      sortOrder: (sortOrder === 'asc' || sortOrder === 'desc') ? sortOrder as 'asc' | 'desc' : undefined,
    };
    const res = await AdminNewsService.getNews(user, filters);
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

// Author management
newsRouter.post('/:id/authors', async (c) => {
  const newsId = c.req.param('id');
  const { userId } = await c.req.json();
  try {
    await AdminNewsService.addAuthor(newsId, userId);
    return c.json({ message: 'Author added' });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

newsRouter.delete('/:id/authors/:userId', async (c) => {
  const newsId = c.req.param('id');
  const userId = c.req.param('userId');
  try {
    await AdminNewsService.removeAuthor(newsId, userId);
    return c.json({ message: 'Author removed' });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

// OG Image upload
newsRouter.post('/:id/og-image', async (c) => {
  const newsId = c.req.param('id');
  const user = c.get('user');

  try {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    // Validate file size (500KB = 500 * 1024 bytes)
    const MAX_SIZE = 500 * 1024;
    if (file.size > MAX_SIZE) {
      return c.json({ error: 'OG image must be under 500KB' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload with og-image- prefix
    const result = await storageService.uploadFile(
      buffer,
      `og-image-${file.name}`,
      file.type
    );

    // Persist OG image URL to the news record
    const ip = c.req.header('x-forwarded-for') || '';
    const userAgent = c.req.header('user-agent') || '';
    await AdminNewsService.updateNews(newsId, { ogImage: result.url }, user, ip, userAgent);

    return c.json({
      message: 'OG image uploaded successfully',
      url: result.url,
    });
  } catch (error: any) {
    console.error('OG image upload error:', error);
    return c.json({ error: 'OG image upload failed: ' + error.message }, 500);
  }
});

export { newsRouter };
