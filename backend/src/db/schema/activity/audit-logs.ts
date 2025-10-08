import { pgTable, uuid, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { auditActionEnum } from '../enums';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: auditActionEnum('action').notNull(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId: uuid('record_id'),
  oldValues: jsonb('old_values').$type<Record<string, any>>(),
  newValues: jsonb('new_values').$type<Record<string, any>>(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
