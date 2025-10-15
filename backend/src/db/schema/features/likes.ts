import { pgTable, uuid, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { stories } from './stories';

export const likes = pgTable(
  'likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    storyId: uuid('story_id')
      .notNull()
      .references(() => stories.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // One like per user per story
    uniqueUserStory: unique().on(table.userId, table.storyId),
  })
);
