import { Hono } from 'hono';
import { AdminAuthService } from '../services/admin-auth-service.js';
import { adminAuthMiddleware } from '../middleware/admin-auth-middleware.js';
import { superAdminAuthMiddleware } from '../middleware/super-admin-auth-middleware.js';
import type { Variables } from '../types/hono-types.js';

const authRouter = new Hono<{ Variables: Variables }>();

// Public login route
authRouter.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    const token = await AdminAuthService.login(email, password);
    return c.json({ token });
  } catch (error: any) {
    return c.json({ error: error.message || 'Login failed' }, 401);
  }
});

// Protected reporter creation (Superadmin only)
authRouter.post('/reporters', adminAuthMiddleware, superAdminAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const authUser = c.get('user');
    const ip = c.req.header('x-forwarded-for') || '';
    const userAgent = c.req.header('user-agent') || '';
    const user = await AdminAuthService.createReporter(body, authUser, ip, userAgent);
    return c.json({ message: 'Reporter created', user: { id: user.id, name: user.name, email: user.email } }, 201);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to create reporter' }, 400);
  }
});

authRouter.get('/reporters', adminAuthMiddleware, superAdminAuthMiddleware, async (c) => {
  try {
    const users = await AdminAuthService.getUsers();
    return c.json(users);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

authRouter.get('/reporters/:id', adminAuthMiddleware, superAdminAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  try {
    const user = await AdminAuthService.getUserById(id);
    if (!user) return c.json({ error: 'User not found' }, 404);
    return c.json(user);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

authRouter.put('/reporters/:id', adminAuthMiddleware, superAdminAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  try {
    const body = await c.req.json();
    const authUser = c.get('user');
    const ip = c.req.header('x-forwarded-for') || '';
    const userAgent = c.req.header('user-agent') || '';
    const user = await AdminAuthService.updateUser(id, body, authUser, ip, userAgent);
    return c.json({ message: 'User updated', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

authRouter.delete('/reporters/:id', adminAuthMiddleware, superAdminAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const authUser = c.get('user');
  const ip = c.req.header('x-forwarded-for') || '';
  const userAgent = c.req.header('user-agent') || '';
  try {
    await AdminAuthService.deleteUser(id, authUser, ip, userAgent);
    return c.json({ message: 'User deleted' });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

export { authRouter };
