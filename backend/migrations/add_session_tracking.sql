-- Add session tracking columns to sessions table
-- Migration: add_session_tracking

-- Drop access_token column (no longer needed)
ALTER TABLE sessions DROP COLUMN IF EXISTS access_token;

-- Add last_activity column for real-time tracking
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

-- Add is_active column for session invalidation
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Add index for faster queries on active sessions
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON sessions(user_id, is_active) WHERE is_active = true;
