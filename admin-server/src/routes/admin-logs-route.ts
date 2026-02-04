import { Hono } from 'hono';
import { AdminLogsService } from '../services/admin-logs-service.js';
import { adminAuthMiddleware } from '../middleware/admin-auth-middleware.js';
import { superAdminAuthMiddleware } from '../middleware/super-admin-auth-middleware.js';

const logsRouter = new Hono();

// Only superadmin can view logs
logsRouter.get('/', adminAuthMiddleware, superAdminAuthMiddleware, async (c) => {
  try {
    const logs = await AdminLogsService.getLogs();
    return c.json(logs);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to fetch logs' }, 500);
  }
});

export { logsRouter };
