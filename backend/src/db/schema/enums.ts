import { pgEnum } from 'drizzle-orm/pg-core';

// Account type enum
export const accountTypeEnum = pgEnum('account_type', ['credentials', 'oauth']);

// Account provider enum
export const accountProviderEnum = pgEnum('account_provider', [
  'email',
  'google',
  'kakao',
  'naver',
]);

// Permission action enum
export const permissionActionEnum = pgEnum('permission_action', [
  'create',
  'read',
  'update',
  'delete',
  'list',
  'assign',
  'manage',
  'view',
  'edit',
  'send',
  'invite',
  'moderate',
  'upload',
  'publish',
  'export',
  'suspend',
  'monitor',
  'configure',
  'backup',
  'restore',
]);

// Permission scope enum
export const permissionScopeEnum = pgEnum('permission_scope', ['own', 'team', 'all']);

// Content scope enum (for personal vs team content)
export const contentScopeEnum = pgEnum('content_scope', ['personal', 'team']);

// Visibility enum (for content visibility control)
export const visibilityEnum = pgEnum('visibility', [
  'private',  // Only visible to the owner
  'friends',  // Visible to friends
  'team',     // Visible to team members
  'public',   // Visible to everyone
]);

// User activity type enum
export const userActivityTypeEnum = pgEnum('user_activity_type', [
  'signin',
  'signout',
  'signup',
  'password_reset',
  'profile_update',
  'create',
  'read',
  'update',
  'delete',
]);

// Audit action enum
export const auditActionEnum = pgEnum('audit_action', [
  'INSERT',
  'UPDATE',
  'DELETE',
  'SIGNIN_SUCCESS',
  'SIGNIN_FAILURE',
]);

// Security list type enum
export const securityListTypeEnum = pgEnum('security_list_type', ['ip', 'email']);

// Notification type enum
export const notificationTypeEnum = pgEnum('notification_type', [
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
  'team_post',           // New team post created
  'team_event',          // New team calendar event
  'team_announcement',   // Team announcement
  'team_member_join',    // New member joined team
  'admin_alert',
]);

// Project status enum
export const projectStatusEnum = pgEnum('project_status', [
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
]);

// Team member role enum
export const teamMemberRoleEnum = pgEnum('team_member_role', [
  'owner',
  'admin',
  'member',
  'viewer',
]);

// Translation status enum
export const translationStatusEnum = pgEnum('translation_status', [
  'draft',
  'pending',
  'approved',
  'published',
]);

// Team invite status enum
export const teamInviteStatusEnum = pgEnum('team_invite_status', [
  'pending',
  'accepted',
  'rejected',
  'expired',
]);
