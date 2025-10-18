-- Create comments table for storing story comments with hierarchical structure
CREATE TABLE IF NOT EXISTS "comments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "story_id" UUID NOT NULL REFERENCES "stories"("id") ON DELETE CASCADE,
  "author_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "attachments" JSONB,
  "parent_id" UUID REFERENCES "comments"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_comments_story_id" ON "comments"("story_id");
CREATE INDEX IF NOT EXISTS "idx_comments_author_id" ON "comments"("author_id");
CREATE INDEX IF NOT EXISTS "idx_comments_parent_id" ON "comments"("parent_id");

-- Add comment explaining the table
COMMENT ON TABLE "comments" IS 'Hierarchical comments on stories with support for nested replies and attachments';
COMMENT ON COLUMN "comments"."attachments" IS 'JSON array of attachments: [{ type: "image" | "file", url: string, name: string, size: number }]';
