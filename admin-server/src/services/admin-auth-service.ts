import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users, type NewUser } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { config } from '../config/config.js';
import { ActivityLogService } from './activity-log-service.js';

export interface AuthPayload {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
}

export class AdminAuthService {
  static async login(email: string, password: string) {
    // 1. Check if it's superadmin
    if (
      email === config.credentials.superAdminEmail &&
      password === config.credentials.superAdminPassword
    ) {
      const payload: AuthPayload = {
        userId: 'super-admin-uuid', // Placeholder or use a specific fixed UUID if preferred
        email: email,
        isSuperAdmin: true,
      };
      return this.generateToken(payload);
    }

    // 2. Check in database
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      isSuperAdmin: false,
    };

    return this.generateToken(payload);
  }

  static generateToken(payload: AuthPayload) {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: '7d' });
  }

  static verifyToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as AuthPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async createReporter(data: { name: string; email: string; password: string; portfolioLink?: string }, authUser?: any, ip?: string, userAgent?: string) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    const newUser: NewUser = {
      name: data.name,
      email: data.email,
      passwordHash,
      portfolioLink: data.portfolioLink,
    };

    const [inserted] = await db.insert(users).values(newUser).returning();

    if (authUser) {
      await ActivityLogService.log({
        userId: authUser.userId,
        action: 'user.create',
        entityType: 'users',
        entityId: inserted.id,
        metadata: { name: inserted.name, email: inserted.email },
        ip,
        userAgent,
      });
    }

    return inserted;
  }

  static async getUsers() {
    return await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      portfolioLink: users.portfolioLink,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));
  }

  static async getUserById(id: string) {
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      portfolioLink: users.portfolioLink,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  }

  static async updateUser(id: string, data: { name?: string; email?: string; password?: string; portfolioLink?: string }, authUser?: any, ip?: string, userAgent?: string) {
    const updateData: any = {
      name: data.name,
      email: data.email,
      portfolioLink: data.portfolioLink,
      updatedAt: new Date(),
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const [updated] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    if (updated && authUser) {
      await ActivityLogService.log({
        userId: authUser.userId,
        action: 'user.update',
        entityType: 'users',
        entityId: updated.id,
        metadata: { name: updated.name, email: updated.email },
        ip,
        userAgent,
      });
    }
    
    return updated;
  }

  static async deleteUser(id: string, authUser?: any, ip?: string, userAgent?: string) {
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();

    if (deleted && authUser) {
      await ActivityLogService.log({
        userId: authUser.userId,
        action: 'user.delete',
        entityType: 'users',
        entityId: deleted.id,
        metadata: { name: deleted.name, email: deleted.email },
        ip,
        userAgent,
      });
    }

    return deleted;
  }
}
