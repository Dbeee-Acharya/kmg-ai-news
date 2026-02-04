import type { Context, Next } from 'hono';
import type { AuthPayload } from '../services/admin-auth-service.js';

export const superAdminAuthMiddleware = async (c: Context, next: Next) => {
  const user = c.get('user') as AuthPayload;

  if (!user || !user.isSuperAdmin) {
    return c.json({ error: 'Forbidden: Superadmin access required' }, 403);
  }

  await next();
};
