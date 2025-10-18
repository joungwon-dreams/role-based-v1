/**
 * Notifications tRPC Router
 *
 * User notifications for various activities and events
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { notifications } from '../../db/schema/index';
import { eq, and, desc, or, count } from 'drizzle-orm';

const notificationTypeValues = [
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
  'admin_alert',
] as const;

const createNotificationSchema = z.object({
  type: z.enum(notificationTypeValues),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  data: z.record(z.any()).optional(),
  actionUrl: z.string().optional(),
});

export const notificationsRouter = router({
  /**
   * Get all notifications for current user
   */
  list: protectedProcedure
    .input(
      z
        .object({
          filter: z.enum(['all', 'unread', 'read', 'archived']).optional().default('all'),
          type: z.enum(notificationTypeValues).optional(),
          limit: z.number().min(1).max(100).optional().default(50),
          offset: z.number().min(0).optional().default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { filter = 'all', type, limit = 50, offset = 0 } = input || {};
      const userId = ctx.user.userId;

      // Build where conditions
      const conditions = [eq(notifications.userId, userId)];

      if (filter === 'unread') {
        conditions.push(eq(notifications.isRead, false));
        conditions.push(eq(notifications.isArchived, false));
      } else if (filter === 'read') {
        conditions.push(eq(notifications.isRead, true));
        conditions.push(eq(notifications.isArchived, false));
      } else if (filter === 'archived') {
        conditions.push(eq(notifications.isArchived, true));
      } else if (filter === 'all') {
        conditions.push(eq(notifications.isArchived, false));
      }

      if (type) {
        conditions.push(eq(notifications.type, type));
      }

      const whereConditions = and(...conditions);

      const notificationsList = await ctx.db
        .select()
        .from(notifications)
        .where(whereConditions)
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);

      return notificationsList;
    }),

  /**
   * Get unread notifications count
   */
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.userId;

    const result = await ctx.db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          eq(notifications.isArchived, false)
        )
      );

    return result[0]?.count || 0;
  }),

  /**
   * Get notification by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.userId;

      const notification = await ctx.db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.userId, userId)
          )
        )
        .limit(1);

      if (notification.length === 0) {
        throw new Error('Notification not found');
      }

      return notification[0];
    }),

  /**
   * Create a new notification (admin/system use)
   */
  create: protectedProcedure
    .input(
      createNotificationSchema.extend({
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newNotification = await ctx.db
        .insert(notifications)
        .values({
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          data: input.data || null,
          actionUrl: input.actionUrl || null,
        })
        .returning();

      return newNotification[0];
    }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;

      const updated = await ctx.db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.userId, userId)
          )
        )
        .returning();

      if (updated.length === 0) {
        throw new Error('Notification not found');
      }

      return updated[0];
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.userId;

    await ctx.db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    return { success: true };
  }),

  /**
   * Archive notification
   */
  archive: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;

      const updated = await ctx.db
        .update(notifications)
        .set({
          isArchived: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.userId, userId)
          )
        )
        .returning();

      if (updated.length === 0) {
        throw new Error('Notification not found');
      }

      return updated[0];
    }),

  /**
   * Delete notification
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;

      const deleted = await ctx.db
        .delete(notifications)
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.userId, userId)
          )
        )
        .returning();

      if (deleted.length === 0) {
        throw new Error('Notification not found');
      }

      return { success: true, id: input.id };
    }),

  /**
   * Delete all read notifications
   */
  deleteAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.userId;

    await ctx.db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, true)
        )
      );

    return { success: true };
  }),
});
