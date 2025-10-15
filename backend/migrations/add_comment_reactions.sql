-- Create comment_reactions table for emoji reactions on comments
CREATE TABLE IF NOT EXISTS "comment_reactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "comment_id" UUID NOT NULL REFERENCES "comments"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "emoji" VARCHAR(10) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE("user_id", "comment_id", "emoji")
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_comment_reactions_comment_id" ON "comment_reactions"("comment_id");
CREATE INDEX IF NOT EXISTS "idx_comment_reactions_user_id" ON "comment_reactions"("user_id");

-- Add comment explaining the table
COMMENT ON TABLE "comment_reactions" IS 'Emoji reactions on comments with unique constraint per user per comment per emoji';
