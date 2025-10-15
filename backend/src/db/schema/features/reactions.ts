import { pgTable, uuid, timestamp, varchar, unique } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { stories } from './stories';

export const reactions = pgTable(
  'reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    storyId: uuid('story_id')
      .notNull()
      .references(() => stories.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    emoji: varchar('emoji', { length: 10 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // One reaction per user per story per emoji
    uniqueUserStoryEmoji: unique().on(table.userId, table.storyId, table.emoji),
  })
);
