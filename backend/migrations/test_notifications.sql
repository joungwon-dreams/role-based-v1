-- Test notifications for admin@example.com
-- User ID: 25b506e5-55e6-45d3-98f7-fb69c17de634

-- 1. Friend request notification (unread)
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  '25b506e5-55e6-45d3-98f7-fb69c17de634',
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
  '25b506e5-55e6-45d3-98f7-fb69c17de634',
  'story_like',
  'Story Liked',
  'user2@willydreams.com liked your story "My Weekend Adventure"',
  '/stories',
  false,
  NOW() - INTERVAL '10 minutes'
);

-- 3. Comment notification (unread)
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  '25b506e5-55e6-45d3-98f7-fb69c17de634',
  'story_comment',
  'New Comment',
  'user3@willydreams.com commented on your story',
  '/stories',
  false,
  NOW() - INTERVAL '20 minutes'
);

-- 4. Message notification (unread)
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  '25b506e5-55e6-45d3-98f7-fb69c17de634',
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
  '25b506e5-55e6-45d3-98f7-fb69c17de634',
  'calendar_event',
  'Upcoming Event',
  'Team Meeting starts in 30 minutes',
  '/calendar',
  false,
  NOW() - INTERVAL '2 hours'
);

-- 6. Friend accept notification (read)
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, read_at, created_at)
VALUES (
  '25b506e5-55e6-45d3-98f7-fb69c17de634',
  'friend_accept',
  'Friend Request Accepted',
  'user1@willydreams.com accepted your friend request',
  '/friends',
  true,
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '5 hours'
);

-- 7. System notification (read)
INSERT INTO notifications (user_id, type, title, message, is_read, read_at, created_at)
VALUES (
  '25b506e5-55e6-45d3-98f7-fb69c17de634',
  'system',
  'System Update',
  'System maintenance scheduled for tonight at 2 AM',
  true,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '2 days'
);

-- 8. Admin alert notification (unread)
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  '25b506e5-55e6-45d3-98f7-fb69c17de634',
  'admin_alert',
  'Security Alert',
  'Multiple failed login attempts detected on your account',
  '/profile',
  false,
  NOW() - INTERVAL '30 minutes'
);
