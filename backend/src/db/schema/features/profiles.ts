import { pgTable, uuid, text, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../core/users';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  avatar: text('avatar'),
  phone: varchar('phone', { length: 20 }),
  location: varchar('location', { length: 100 }),
  website: varchar('website', { length: 255 }),
  socialLinks: jsonb('social_links').$type<Record<string, string>>(),
  preferences: jsonb('preferences').$type<Record<string, any>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
