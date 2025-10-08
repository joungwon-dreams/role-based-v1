import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { securityListTypeEnum } from '../enums';

export const securityWhitelist = pgTable('security_whitelist', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: securityListTypeEnum('type').notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  addedBy: uuid('added_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
