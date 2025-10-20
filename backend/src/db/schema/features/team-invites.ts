import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { teams } from './teams';
import { teamInviteStatusEnum } from '../enums';

/**
 * Team Invites Table
 *
 * Stores team invitation records:
 * - Email-based invitations
 * - User-based invitations
 * - Invitation status tracking
 */
export const teamInvites = pgTable('team_invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => users.id),

  // Either userId (existing user) or email (invite by email)
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }),

  status: teamInviteStatusEnum('status').notNull().default('pending'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
