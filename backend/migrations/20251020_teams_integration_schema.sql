-- Teams Integration Migration
-- Created: 2025-10-20 12:08:30
-- Description: Add team support to calendar_events, stories, and notifications
--              Create team_channels and team_invites tables

-- =====================================================
-- Step 1: Create new enums
-- =====================================================

-- Content scope enum (personal vs team)
CREATE TYPE content_scope AS ENUM ('personal', 'team');

-- Visibility enum (content visibility control)
CREATE TYPE visibility AS ENUM (
  'private',  -- Only visible to the owner
  'friends',  -- Visible to friends
  'team',     -- Visible to team members
  'public'    -- Visible to everyone
);

-- Team invite status enum
CREATE TYPE team_invite_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'expired'
);

-- =====================================================
-- Step 2: Add values to existing notification_type enum
-- =====================================================

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'team_post';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'team_event';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'team_announcement';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'team_member_join';

-- =====================================================
-- Step 3: Modify calendar_events table
-- =====================================================

ALTER TABLE calendar_events
  ADD COLUMN scope content_scope NOT NULL DEFAULT 'personal',
  ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  ADD COLUMN visibility visibility NOT NULL DEFAULT 'private',
  ADD COLUMN created_by UUID REFERENCES users(id);

-- Create index for team calendar queries
CREATE INDEX idx_calendar_events_team_id ON calendar_events(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX idx_calendar_events_scope ON calendar_events(scope);

-- =====================================================
-- Step 4: Modify stories table
-- =====================================================

ALTER TABLE stories
  ADD COLUMN scope content_scope NOT NULL DEFAULT 'personal',
  ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  ADD COLUMN visibility visibility NOT NULL DEFAULT 'private',
  ADD COLUMN is_pinned BOOLEAN NOT NULL DEFAULT false;

-- Create indexes for team stories queries
CREATE INDEX idx_stories_team_id ON stories(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX idx_stories_scope ON stories(scope);
CREATE INDEX idx_stories_pinned ON stories(is_pinned) WHERE is_pinned = true;

-- =====================================================
-- Step 5: Modify notifications table
-- =====================================================

ALTER TABLE notifications
  ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  ADD COLUMN related_user_id UUID REFERENCES users(id);

-- Create indexes for team notifications
CREATE INDEX idx_notifications_team_id ON notifications(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX idx_notifications_related_user ON notifications(related_user_id) WHERE related_user_id IS NOT NULL;

-- =====================================================
-- Step 6: Create team_channels table
-- =====================================================

CREATE TABLE team_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_team_channels_team_id ON team_channels(team_id);
CREATE INDEX idx_team_channels_created_by ON team_channels(created_by);

-- =====================================================
-- Step 7: Create team_channel_messages table
-- =====================================================

CREATE TABLE team_channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES team_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_team_channel_messages_channel_id ON team_channel_messages(channel_id);
CREATE INDEX idx_team_channel_messages_sender_id ON team_channel_messages(sender_id);
CREATE INDEX idx_team_channel_messages_created_at ON team_channel_messages(created_at DESC);

-- =====================================================
-- Step 8: Create team_channel_members table
-- =====================================================

CREATE TABLE team_channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES team_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Indexes
CREATE INDEX idx_team_channel_members_channel_id ON team_channel_members(channel_id);
CREATE INDEX idx_team_channel_members_user_id ON team_channel_members(user_id);

-- =====================================================
-- Step 9: Create team_invites table
-- =====================================================

CREATE TABLE team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES users(id),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  status team_invite_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_user_or_email CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX idx_team_invites_user_id ON team_invites(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_team_invites_email ON team_invites(email) WHERE email IS NOT NULL;
CREATE INDEX idx_team_invites_status ON team_invites(status);

-- =====================================================
-- Step 10: Update existing data
-- =====================================================

-- All existing calendar events are personal with private visibility
UPDATE calendar_events
SET
  scope = 'personal',
  visibility = 'private'
WHERE scope IS NULL OR visibility IS NULL;

-- All existing stories are personal
-- Set visibility to 'public' if published, 'private' if not
UPDATE stories
SET
  scope = 'personal',
  visibility = CASE
    WHEN is_published = true THEN 'public'::visibility
    ELSE 'private'::visibility
  END
WHERE scope IS NULL OR visibility IS NULL;

-- =====================================================
-- Comments
-- =====================================================

-- This migration adds team support to the existing schema:
-- 1. calendar_events: Can now be personal or team events with visibility control
-- 2. stories: Can now be personal or team posts with visibility control
-- 3. notifications: Can now reference teams and related users
-- 4. team_channels: New table for team communication channels
-- 5. team_invites: New table for team invitation management
--
-- All existing data is preserved as 'personal' scope with appropriate visibility
