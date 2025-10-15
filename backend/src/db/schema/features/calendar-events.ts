import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from '../core/users';

/**
 * Calendar Events Table
 *
 * Stores user calendar events with support for:
 * - Event categorization (label)
 * - Guest management
 * - All-day and timed events
 * - External URLs
 *
 * Based on Vuexy calendar design
 */
export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 255 }),
  // Event categorization: Business, Personal, Family, Holiday, ETC
  label: varchar('label', { length: 50 }).notNull().default('Business'),
  // Optional event URL
  url: varchar('url', { length: 500 }),
  // Array of guest names/emails stored as JSON
  guests: jsonb('guests').$type<string[]>().default([]),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  isAllDay: boolean('is_all_day').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
