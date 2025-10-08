import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { securityListTypeEnum } from '../enums';

export const securityBlacklist = pgTable('security_blacklist', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: securityListTypeEnum('type').notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  reason: text('reason'),
  isActive: boolean('is_active').notNull().default(true),
  addedBy: uuid('added_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
});
