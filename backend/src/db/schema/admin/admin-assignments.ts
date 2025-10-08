import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { roles } from '../core/roles';

export const adminAssignments = pgTable('admin_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  reason: text('reason'),
  assignedBy: uuid('assigned_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
