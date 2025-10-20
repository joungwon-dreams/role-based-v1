-- ============================================================================
-- DATABASE OPTIMIZATION: INDEXES
-- ============================================================================
--
-- This file contains index definitions for optimal query performance.
-- Indexes are designed based on common query patterns in the application.
--
-- Performance Impact:
-- - Improves SELECT query speed by 10-100x
-- - Slightly slows INSERT/UPDATE operations (acceptable trade-off)
-- - Reduces I/O operations significantly
--
-- ============================================================================

-- ============================================================================
-- CORE TABLES - Users, Roles, Permissions
-- ============================================================================

-- Users Table
-- Query patterns: Email lookups, name searches, created_at sorting
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- User Roles
-- Query patterns: Finding roles for a user, finding users with a role
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_composite ON user_roles(user_id, role_id);

-- Role Permissions
-- Query patterns: Finding permissions for a role
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_composite ON role_permissions(role_id, permission_id);

-- ============================================================================
-- AUTH TABLES - Sessions, Accounts
-- ============================================================================

-- Sessions
-- Query patterns: Session lookup by token, user lookup, expiration check
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);

-- Accounts
-- Query patterns: Provider account lookups
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, provider_account_id);

-- ============================================================================
-- FEATURE TABLES - Stories, Comments, Likes
-- ============================================================================

-- Stories Table
-- Query patterns:
-- - Team stories: WHERE teamId = ? AND scope = 'team' ORDER BY isPinned DESC, createdAt DESC
-- - User stories: WHERE authorId = ? ORDER BY createdAt DESC
-- - Published stories: WHERE isPublished = true AND visibility = 'public'
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_team_id ON stories(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stories_scope ON stories(scope);
CREATE INDEX IF NOT EXISTS idx_stories_visibility ON stories(visibility);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(is_published, published_at DESC) WHERE is_published = true;

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_stories_team_composite ON stories(team_id, scope, is_pinned, created_at DESC)
  WHERE team_id IS NOT NULL AND scope = 'team';
CREATE INDEX IF NOT EXISTS idx_stories_author_composite ON stories(author_id, scope, created_at DESC);

-- Comments Table
-- Query patterns:
-- - Fetching comments for a story: WHERE storyId = ? ORDER BY createdAt
-- - Hierarchical comments: WHERE parentId = ?
-- - User's comments: WHERE authorId = ?
CREATE INDEX IF NOT EXISTS idx_comments_story_id ON comments(story_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Composite index for story comments with hierarchy
CREATE INDEX IF NOT EXISTS idx_comments_story_hierarchy ON comments(story_id, parent_id, created_at DESC);

-- Likes Table
-- Query patterns:
-- - Story like count: WHERE storyId = ?
-- - User's liked stories: WHERE userId = ?
-- - Check if user liked story: WHERE userId = ? AND storyId = ?
CREATE INDEX IF NOT EXISTS idx_likes_story_id ON likes(story_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
-- Note: unique constraint already creates index on (user_id, story_id)

-- Reactions Table (for stories)
-- Similar pattern to likes
CREATE INDEX IF NOT EXISTS idx_reactions_story_id ON reactions(story_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);

-- Comment Reactions Table
-- Query patterns: Fetching reactions for comments
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON comment_reactions(user_id);

-- ============================================================================
-- CALENDAR EVENTS
-- ============================================================================

-- Calendar Events Table
-- Query patterns:
-- - User events: WHERE userId = ? AND startTime BETWEEN ? AND ?
-- - Team events: WHERE teamId = ? AND scope = 'team' AND startTime BETWEEN ? AND ?
-- - Unified calendar: Personal + team events
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_team_id ON calendar_events(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calendar_events_scope ON calendar_events(scope);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_end_time ON calendar_events(end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events(created_by) WHERE created_by IS NOT NULL;

-- Composite indexes for time-range queries
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_time ON calendar_events(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_team_time ON calendar_events(team_id, scope, start_time, end_time)
  WHERE team_id IS NOT NULL AND scope = 'team';

-- ============================================================================
-- TEAM TABLES - Teams, Members, Channels
-- ============================================================================

-- Team Members Table
-- Query patterns:
-- - Members of a team: WHERE teamId = ?
-- - User's teams: WHERE userId = ?
-- - Membership check: WHERE teamId = ? AND userId = ?
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_composite ON team_members(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_joined_at ON team_members(joined_at DESC);

-- Team Invites Table
-- Query patterns: Pending invites for a team or user
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_inviter_id ON team_invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON team_invites(email);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(token);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON team_invites(status);
CREATE INDEX IF NOT EXISTS idx_team_invites_expires_at ON team_invites(expires_at);

-- Teams Table
-- Query patterns: Owned teams, created_at sorting
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at DESC);

-- ============================================================================
-- ACTIVITY & AUDIT TABLES
-- ============================================================================

-- User Activities Table
-- Query patterns: Recent activities for a user
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_composite ON user_activities(user_id, created_at DESC);

-- Audit Logs Table
-- Query patterns: Logs by user, action type, timestamp
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_composite ON audit_logs(user_id, action, created_at DESC);

-- ============================================================================
-- SECURITY TABLES
-- ============================================================================

-- System Logs Table
-- Query patterns: Recent logs, level filtering
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_composite ON system_logs(level, created_at DESC);

-- Suspicious Logins Table
-- Query patterns: Recent suspicious logins
CREATE INDEX IF NOT EXISTS idx_suspicious_logins_user_id ON suspicious_logins(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_suspicious_logins_ip_address ON suspicious_logins(ip_address);
CREATE INDEX IF NOT EXISTS idx_suspicious_logins_created_at ON suspicious_logins(created_at DESC);

-- Security Whitelist/Blacklist
CREATE INDEX IF NOT EXISTS idx_security_whitelist_ip_address ON security_whitelist(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_blacklist_ip_address ON security_blacklist(ip_address);

-- ============================================================================
-- MESSAGING & NOTIFICATIONS
-- ============================================================================

-- Messages Table
-- Query patterns: Conversations between users, unread messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);

-- Notifications Table
-- Query patterns: User notifications, unread count
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_composite ON notifications(user_id, is_read, created_at DESC);

-- ============================================================================
-- CONNECTIONS (Friendships)
-- ============================================================================

-- Connections Table
-- Query patterns: User's connections, pending requests
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_friend_id ON connections(friend_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_composite ON connections(user_id, status);

-- ============================================================================
-- PERFORMANCE NOTES
-- ============================================================================
--
-- 1. Index Maintenance:
--    - Run VACUUM ANALYZE periodically to update statistics
--    - Monitor index usage with pg_stat_user_indexes
--    - Drop unused indexes to reduce INSERT/UPDATE overhead
--
-- 2. Query Optimization:
--    - Use EXPLAIN ANALYZE to verify index usage
--    - Avoid SELECT * - specify only needed columns
--    - Use LIMIT for pagination
--    - Consider materialized views for complex aggregations
--
-- 3. Monitoring:
--    - pg_stat_statements extension for slow query detection
--    - Track index hit ratio (should be >99%)
--    - Monitor table bloat and run VACUUM when needed
--
-- 4. Partitioning Candidates:
--    - audit_logs (by created_at - monthly partitions)
--    - system_logs (by created_at - weekly partitions)
--    - user_activities (by created_at - monthly partitions)
--
-- ============================================================================
