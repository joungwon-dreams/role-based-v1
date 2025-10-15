-- Add reactions table for emoji reactions on stories
CREATE TABLE IF NOT EXISTS "reactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "story_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "emoji" varchar(10) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign keys
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_story_id_fkey"
  FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE;

ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Add unique constraint (one reaction per user per story per emoji)
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_story_emoji_unique"
  UNIQUE ("user_id", "story_id", "emoji");

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS "reactions_story_id_idx" ON "reactions"("story_id");
CREATE INDEX IF NOT EXISTS "reactions_user_id_idx" ON "reactions"("user_id");
