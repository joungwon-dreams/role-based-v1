-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
  'system',
  'friend_request',
  'friend_accept',
  'message',
  'story_like',
  'story_comment',
  'comment_reply',
  'calendar_event',
  'mention',
  'team_invite',
  'admin_alert'
);

-- Create notifications table for user notifications
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" notification_type NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "data" JSONB,
  "action_url" TEXT,
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_archived" BOOLEAN NOT NULL DEFAULT FALSE,
  "read_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_notifications_type" ON "notifications"("type");
CREATE INDEX IF NOT EXISTS "idx_notifications_is_read" ON "notifications"("is_read") WHERE "is_read" = FALSE;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS "idx_notifications_user_unread" ON "notifications"("user_id", "is_read", "created_at" DESC) WHERE "is_read" = FALSE;
CREATE INDEX IF NOT EXISTS "idx_notifications_user_type" ON "notifications"("user_id", "type", "created_at" DESC);

-- Add comments explaining the table
COMMENT ON TABLE "notifications" IS 'User notifications for various activities and events';
COMMENT ON COLUMN "notifications"."type" IS 'Type of notification (friend_request, message, story_like, etc.)';
COMMENT ON COLUMN "notifications"."data" IS 'Additional JSON data specific to the notification type';
COMMENT ON COLUMN "notifications"."action_url" IS 'URL to navigate to when clicking the notification';
COMMENT ON COLUMN "notifications"."is_read" IS 'Whether the user has read the notification';
COMMENT ON COLUMN "notifications"."is_archived" IS 'Whether the user has archived the notification';
