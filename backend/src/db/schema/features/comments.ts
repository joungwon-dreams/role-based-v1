import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { stories } from './stories';

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  storyId: uuid('story_id')
    .notNull()
    .references(() => stories.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  // Attachments: [{ type: 'image' | 'file', url: string, name: string, size: number }]
  attachments: jsonb('attachments').$type<Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
    size: number;
  }>>(),
  parentId: uuid('parent_id').references(() => comments.id, { onDelete: 'cascade' }), // For nested comments
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
