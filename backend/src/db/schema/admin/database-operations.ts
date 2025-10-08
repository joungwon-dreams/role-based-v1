import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from '../core/users';

export const databaseOperations = pgTable('database_operations', {
  id: uuid('id').primaryKey().defaultRandom(),
  operationType: varchar('operation_type', { length: 50 }).notNull(),
  description: text('description').notNull(),
  query: text('query'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  executedBy: uuid('executed_by')
    .notNull()
    .references(() => users.id),
  isSuccessful: boolean('is_successful').notNull(),
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
