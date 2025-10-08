import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const i18nTranslations = pgTable('i18n_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  namespace: varchar('namespace', { length: 50 }).notNull(),
  key: varchar('key', { length: 255 }).notNull(),
  translations: jsonb('translations').$type<Record<string, string>>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
