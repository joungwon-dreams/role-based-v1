-- Add attachments column to comments table for images and files
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "attachments" jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN "comments"."attachments" IS 'JSON array of attachments: [{ type: "image" | "file", url: string, name: string, size: number }]';
