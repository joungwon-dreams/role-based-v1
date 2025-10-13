import { pgTable, uuid, varchar, text, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const logLevelEnum = pgEnum('log_level', [
  'debug',
  'info',
  'warning',
  'error',
  'critical',
]);

export const systemLogs = pgTable('system_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  level: logLevelEnum('level').notNull(),
  category: varchar('category', { length: 100 }).notNull(), // e.g., 'auth', 'api', 'database', 'security'
  message: text('message').notNull(),
  context: jsonb('context').$type<Record<string, any>>(), // Additional log context
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  userId: uuid('user_id'), // Optional, if log is related to a specific user
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
