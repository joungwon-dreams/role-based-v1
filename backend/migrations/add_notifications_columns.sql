-- Add missing columns to notifications table
ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "data" JSONB,
  ADD COLUMN IF NOT EXISTS "action_url" TEXT,
  ADD COLUMN IF NOT EXISTS "is_archived" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

-- Add comments for new columns
COMMENT ON COLUMN "notifications"."data" IS 'Additional JSON data specific to the notification type';
COMMENT ON COLUMN "notifications"."action_url" IS 'URL to navigate to when clicking the notification';
COMMENT ON COLUMN "notifications"."is_archived" IS 'Whether the user has archived the notification';
