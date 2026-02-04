import { Hono } from 'hono';
import { adminAuthMiddleware } from '../middleware/admin-auth-middleware.js';
import { storageService } from '../lib/LinodeService.js';
import type { Variables } from '../types/hono-types.js';

const uploadRouter = new Hono<{ Variables: Variables }>();

// Apply auth middleware to all upload routes
uploadRouter.use('*', adminAuthMiddleware);

uploadRouter.post('/', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    // Validate file size (3MB = 3 * 1024 * 1024 bytes)
    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return c.json({ error: 'File size exceeds 3MB limit' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' }, 400);
    }

    // Convert File to Buffer for LinodeService
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Linode
    const result = await storageService.uploadFile(
      buffer,
      file.name,
      file.type
    );

    return c.json({
      message: 'File uploaded successfully',
      url: result.url,
      key: result.key,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed: ' + error.message }, 500);
  }
});

export { uploadRouter };
