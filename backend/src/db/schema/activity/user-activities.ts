import { pgTable, uuid, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { userActivityTypeEnum } from '../enums';

export const userActivities = pgTable('user_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: userActivityTypeEnum('type').notNull(),
  description: text('description'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
