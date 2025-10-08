import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { permissionActionEnum, permissionScopeEnum } from '../enums';

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  resource: varchar('resource', { length: 50 }).notNull(),
  action: permissionActionEnum('action').notNull(),
  scope: permissionScopeEnum('scope').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
