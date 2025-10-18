-- Create messages table for direct messaging between users (Facebook Messenger/Instagram DM style)
CREATE TABLE IF NOT EXISTS "messages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sender_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "recipient_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "subject" TEXT,
  "content" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "read_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_messages_sender_id" ON "messages"("sender_id");
CREATE INDEX IF NOT EXISTS "idx_messages_recipient_id" ON "messages"("recipient_id");
CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "messages"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_messages_is_read" ON "messages"("is_read") WHERE "is_read" = FALSE;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS "idx_messages_recipient_unread" ON "messages"("recipient_id", "is_read") WHERE "is_read" = FALSE;

-- Add comment explaining the table
COMMENT ON TABLE "messages" IS 'Direct messages between users (similar to Facebook Messenger/Instagram DM)';
COMMENT ON COLUMN "messages"."subject" IS 'Optional message subject line';
COMMENT ON COLUMN "messages"."is_read" IS 'Whether the recipient has read the message';
COMMENT ON COLUMN "messages"."read_at" IS 'Timestamp when the message was marked as read';
