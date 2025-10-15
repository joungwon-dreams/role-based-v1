import { pgTable, uuid, timestamp, varchar, unique } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { comments } from './comments';

export const commentReactions = pgTable(
  'comment_reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    commentId: uuid('comment_id')
      .notNull()
      .references(() => comments.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    emoji: varchar('emoji', { length: 10 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // One reaction per user per comment per emoji
    uniqueUserCommentEmoji: unique().on(table.userId, table.commentId, table.emoji),
  })
);
