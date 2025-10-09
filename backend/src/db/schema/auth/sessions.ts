import { pgTable, uuid, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';
import { users } from '../core/users';

/**
 * Sessions table for tracking active user sessions
 * - Stores refresh tokens for JWT authentication
 * - Tracks IP address and user agent for security
 * - Supports real-time login tracking with lastActivity
 * - Enables session invalidation and logout
 */
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: text('refresh_token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  lastActivity: timestamp('last_activity', { withTimezone: true }).notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
