import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { teams } from './teams';
import { notificationTypeEnum } from '../enums';

/**
 * Notifications Table
 *
 * Stores user notifications with support for:
 * - Personal notifications (friend requests, messages, etc.)
 * - Team notifications (team invites, posts, events, etc.)
 * - Related user and team context
 */
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),

  // Context references
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  relatedUserId: uuid('related_user_id').references(() => users.id), // e.g., who sent friend request

  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  data: jsonb('data'),
  actionUrl: text('action_url'),
  isRead: boolean('is_read').notNull().default(false),
  isArchived: boolean('is_archived').notNull().default(false),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
