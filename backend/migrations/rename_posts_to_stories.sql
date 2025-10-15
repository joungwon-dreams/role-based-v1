-- Rename posts table to stories
-- Migration: rename_posts_to_stories
-- Date: 2025-10-15

-- Rename the table
ALTER TABLE IF EXISTS posts RENAME TO stories;

-- Rename the primary key constraint
ALTER INDEX IF EXISTS posts_pkey RENAME TO stories_pkey;

-- Rename the slug unique constraint
ALTER INDEX IF EXISTS posts_slug_key RENAME TO stories_slug_key;

-- Update any foreign key constraints that reference this table
-- (No other tables reference posts, so no additional updates needed)

-- Note: The schema file has already been updated from posts.ts to stories.ts
-- This migration only handles the database table rename
