import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  image: text('image'),

  // Profile fields
  bio: text('bio'),
  phone: varchar('phone', { length: 50 }),
  country: varchar('country', { length: 100 }),
  language: varchar('language', { length: 50 }),
  jobTitle: varchar('job_title', { length: 100 }),
  company: varchar('company', { length: 100 }),
  location: varchar('location', { length: 255 }),
  website: text('website'),
  skype: varchar('skype', { length: 100 }),

  // Banner/Cover image
  bannerImage: text('banner_image'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
