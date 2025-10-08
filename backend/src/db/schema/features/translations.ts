import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { translationStatusEnum } from '../enums';

export const translations = pgTable('translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 255 }).notNull(),
  locale: varchar('locale', { length: 10 }).notNull(),
  value: text('value').notNull(),
  status: translationStatusEnum('status').notNull().default('draft'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
