-- Test notifications for superadmin@willydreams.com
-- User ID: 94f10d5f-0356-4813-88ff-e7d1f7b1da2c

-- 1. Friend request notification (unread)
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  '94f10d5f-0356-4813-88ff-e7d1f7b1da2c',
  'friend_request',
  'New Friend Request',
  'user1@willydreams.com wants to be your friend',
  '/friends',
  false,
  NOW() - INTERVAL '5 minutes'
);

-- 2. Story like notification (unread)
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  '94f10d5f-0356-4813-88ff-e7d1f7b1da2c',
  'story_like',
  'Story Liked',
  'premium@willydreams.com liked your story "Weekend Plans"',
  '/stories',
  false,
  NOW() - INTERVAL '10 minutes'
);

-- 3. Comment notification (unread)
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  '94f10d5f-0356-4813-88ff-e7d1f7b1da2c',
  'story_comment',
  'New Comment',
  'admin@willydreams.com commented on your story',
  '/stories',
  false,
  NOW() - INTERVAL '20 minutes'
);

-- 4. Message notification (unread)
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  '94f10d5f-0356-4813-88ff-e7d1f7b1da2c',
  'message',
  'New Message',
  'You have a new message from user@willydreams.com',
  '/messages',
  false,
  NOW() - INTERVAL '1 hour'
);

-- 5. Calendar event notification (unread)
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  '94f10d5f-0356-4813-88ff-e7d1f7b1da2c',
  'calendar_event',
  'Upcoming Event',
  'Team Sync Meeting starts in 30 minutes',
  '/calendar',
  false,
  NOW() - INTERVAL '2 hours'
);

-- 6. Admin alert notification (unread)
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  '94f10d5f-0356-4813-88ff-e7d1f7b1da2c',
  'admin_alert',
  'Security Alert',
  'New login detected from unusual location',
  '/profile',
  false,
  NOW() - INTERVAL '30 minutes'
);
