-- Update notification_type enum to match new values
-- First, alter the notifications table column to use text temporarily
ALTER TABLE notifications ALTER COLUMN type TYPE TEXT;

-- Drop the old enum
DROP TYPE IF EXISTS notification_type;

-- Create the new enum with updated values
CREATE TYPE notification_type AS ENUM (
  'system',
  'friend_request',
  'friend_accept',
  'message',
  'story_like',
  'story_comment',
  'comment_reply',
  'calendar_event',
  'mention',
  'team_invite',
  'admin_alert'
);

-- Update the notifications table column to use the new enum
ALTER TABLE notifications ALTER COLUMN type TYPE notification_type USING type::notification_type;
