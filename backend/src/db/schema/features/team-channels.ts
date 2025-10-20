import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { teams } from './teams';

/**
 * Team Channels Table
 *
 * Stores team communication channels:
 * - Public channels (all team members)
 * - Private channels (invited members only)
 */
export const teamChannels = pgTable('team_channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isPrivate: boolean('is_private').notNull().default(false),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Team Channel Messages Table
 *
 * Stores messages sent in team channels
 */
export const teamChannelMessages = pgTable('team_channel_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  channelId: uuid('channel_id')
    .notNull()
    .references(() => teamChannels.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Team Channel Members Table
 *
 * Stores members for private channels
 * Public channels don't need this - all team members have access
 */
export const teamChannelMembers = pgTable('team_channel_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  channelId: uuid('channel_id')
    .notNull()
    .references(() => teamChannels.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
});
