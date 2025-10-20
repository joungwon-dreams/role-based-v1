import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { teams } from './teams';
import { contentScopeEnum, visibilityEnum } from '../enums';

/**
 * Stories Table
 *
 * Stores stories/posts with support for both personal and team content:
 * - Personal stories (blog posts, updates)
 * - Team stories (team announcements, discussions)
 * - Visibility control
 * - Pin feature for important team posts
 */
export const stories = pgTable('stories', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Team integration fields
  scope: contentScopeEnum('scope').notNull().default('personal'),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  visibility: visibilityEnum('visibility').notNull().default('private'),
  isPinned: boolean('is_pinned').notNull().default(false), // For team announcements

  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  isPublished: boolean('is_published').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
