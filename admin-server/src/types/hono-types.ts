import type { AuthPayload } from '../services/admin-auth-service.js';

export type Variables = {
  user: AuthPayload;
};
