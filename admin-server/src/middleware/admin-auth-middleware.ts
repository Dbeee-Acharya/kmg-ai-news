import type { Context, Next } from 'hono';
import { AdminAuthService, type AuthPayload } from '../services/admin-auth-service.js';

export const adminAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = AdminAuthService.verifyToken(token);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
};
