import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../core/users';
import { accountTypeEnum, accountProviderEnum } from '../enums';

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: accountTypeEnum('type').notNull(),
  provider: accountProviderEnum('provider').notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  password: text('password'), // For email/password auth
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: varchar('token_type', { length: 50 }),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
