import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { teams } from './teams';
import { contentScopeEnum, visibilityEnum } from '../enums';

/**
 * Calendar Events Table
 *
 * Stores calendar events with support for both personal and team events:
 * - Event categorization (label)
 * - Guest management
 * - All-day and timed events
 * - External URLs
 * - Personal vs Team scope
 * - Visibility control
 *
 * Based on Vuexy calendar design with Teams integration
 */
export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Team integration fields
  scope: contentScopeEnum('scope').notNull().default('personal'),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  visibility: visibilityEnum('visibility').notNull().default('private'),
  createdBy: uuid('created_by').references(() => users.id), // For team events

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
