-- Create connections table for friend management (Facebook-style)
-- Supports friend requests, acceptance, rejection, and blocking

-- Create connection status enum
DO $$ BEGIN
  CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'blocked', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create connections table
CREATE TABLE IF NOT EXISTS "connections" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "requester_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "addressee_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" connection_status NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_connections_requester_id" ON "connections"("requester_id");
CREATE INDEX IF NOT EXISTS "idx_connections_addressee_id" ON "connections"("addressee_id");
CREATE INDEX IF NOT EXISTS "idx_connections_status" ON "connections"("status");

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS "idx_connections_requester_status" ON "connections"("requester_id", "status");
CREATE INDEX IF NOT EXISTS "idx_connections_addressee_status" ON "connections"("addressee_id", "status");

-- Prevent duplicate connections between same users
CREATE UNIQUE INDEX IF NOT EXISTS "idx_connections_unique_pair"
  ON "connections"(LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));

-- Add comments explaining the table
COMMENT ON TABLE "connections" IS 'Friend connections between users (Facebook-style friend requests)';
COMMENT ON COLUMN "connections"."requester_id" IS 'User who sent the friend request';
COMMENT ON COLUMN "connections"."addressee_id" IS 'User who received the friend request';
COMMENT ON COLUMN "connections"."status" IS 'Connection status: pending (waiting), accepted (friends), blocked, rejected';
