import { pgTable, uuid, varchar, text, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from '../core/users';

export const systemSettings = pgTable('system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: jsonb('value').$type<Record<string, any>>().notNull(), // Store any JSON value
  category: varchar('category', { length: 100 }).notNull(), // e.g., 'general', 'email', 'security', 'features'
  description: text('description'),
  isPublic: boolean('is_public').notNull().default(false), // Whether setting can be read by non-admins
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
