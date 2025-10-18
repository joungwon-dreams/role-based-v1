-- Add performance indexes to stories table
-- These indexes improve query performance for common access patterns

-- Index on author_id for filtering stories by author
CREATE INDEX IF NOT EXISTS "idx_stories_author_id" ON "stories"("author_id");

-- Index on is_published for filtering published/draft stories
CREATE INDEX IF NOT EXISTS "idx_stories_is_published" ON "stories"("is_published");

-- Compound index on is_published and created_at for efficient filtering and sorting
-- This is particularly useful for queries like "get all published stories ordered by date"
CREATE INDEX IF NOT EXISTS "idx_stories_published_created" ON "stories"("is_published", "created_at" DESC);

-- Index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS "idx_stories_created_at" ON "stories"("created_at" DESC);

-- Add comment explaining the indexes
COMMENT ON INDEX "idx_stories_author_id" IS 'Improves performance when filtering stories by author';
COMMENT ON INDEX "idx_stories_is_published" IS 'Improves performance when filtering by publication status';
COMMENT ON INDEX "idx_stories_published_created" IS 'Optimizes queries that filter by publication status and sort by date';
COMMENT ON INDEX "idx_stories_created_at" IS 'Improves performance when sorting stories by creation date';
