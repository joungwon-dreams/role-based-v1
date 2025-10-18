/**
 * Messages tRPC Router
 *
 * Direct messaging between users (Similar to Facebook Messenger/Instagram DM)
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { messages, users } from '../../db/schema/index';
import { eq, or, and, desc, sql, inArray } from 'drizzle-orm';

const messageSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID'),
  subject: z.string().max(255).optional(),
  content: z.string().min(1, 'Content is required'),
});

export const messagesRouter = router({
  /**
   * Get all conversations for current user
   * Returns list of unique users with latest message
   */
  list: protectedProcedure
    .input(
      z
        .object({
          filter: z.enum(['all', 'unread', 'sent']).optional().default('all'),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filter = input?.filter || 'all';
      const userId = ctx.user.userId;

      // Get all messages where user is sender or recipient
      let whereConditions;
      if (filter === 'unread') {
        whereConditions = and(
          eq(messages.recipientId, userId),
          eq(messages.isRead, false)
        );
      } else if (filter === 'sent') {
        whereConditions = eq(messages.senderId, userId);
      } else {
        // all - show all messages
        whereConditions = or(
          eq(messages.senderId, userId),
          eq(messages.recipientId, userId)
        );
      }

      const allMessages = await ctx.db
        .select()
        .from(messages)
        .where(whereConditions)
        .orderBy(desc(messages.createdAt));

      // Get unique user IDs
      const userIds = new Set<string>();
      allMessages.forEach(msg => {
        userIds.add(msg.senderId);
        userIds.add(msg.recipientId);
      });

      // Fetch all users in one query
      const usersData = userIds.size > 0
        ? await ctx.db
            .select()
            .from(users)
            .where(inArray(users.id, [...userIds]))
        : [];

      // Create a map for quick user lookup
      const usersMap = new Map(usersData.map(u => [u.id, u]));

      return allMessages.map((message) => {
        const sender = usersMap.get(message.senderId);
        const recipient = usersMap.get(message.recipientId);

        return {
          id: message.id,
          senderId: message.senderId,
          senderName: sender?.name || null,
          senderEmail: sender?.email || null,
          recipientId: message.recipientId,
          recipientName: recipient?.name || null,
          recipientEmail: recipient?.email || null,
          subject: message.subject,
          content: message.content,
          isRead: message.isRead,
          readAt: message.readAt,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        };
      });
    }),

  /**
   * Get conversation with specific user
   */
  getConversation: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.user.userId;
      const otherUserId = input.userId;

      const conversation = await ctx.db
        .select({
          message: messages,
          sender: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(
          or(
            and(
              eq(messages.senderId, currentUserId),
              eq(messages.recipientId, otherUserId)
            ),
            and(
              eq(messages.senderId, otherUserId),
              eq(messages.recipientId, currentUserId)
            )
          )
        )
        .orderBy(desc(messages.createdAt));

      return conversation.map(({ message, sender }) => ({
        id: message.id,
        senderId: message.senderId,
        senderName: sender?.name || null,
        senderEmail: sender?.email || null,
        recipientId: message.recipientId,
        subject: message.subject,
        content: message.content,
        isRead: message.isRead,
        readAt: message.readAt,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      }));
    }),

  /**
   * Get single message by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [message] = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.id, input.id));

      if (!message) {
        throw new Error('Message not found');
      }

      // Check if user can view this message
      if (
        message.senderId !== ctx.user.userId &&
        message.recipientId !== ctx.user.userId
      ) {
        throw new Error('You do not have permission to view this message');
      }

      // Fetch sender and recipient info
      const [sender, recipient] = await Promise.all([
        ctx.db.select().from(users).where(eq(users.id, message.senderId)).then(r => r[0]),
        ctx.db.select().from(users).where(eq(users.id, message.recipientId)).then(r => r[0]),
      ]);

      return {
        id: message.id,
        senderId: message.senderId,
        senderName: sender?.name || null,
        senderEmail: sender?.email || null,
        recipientId: message.recipientId,
        recipientName: recipient?.name || null,
        recipientEmail: recipient?.email || null,
        subject: message.subject,
        content: message.content,
        isRead: message.isRead,
        readAt: message.readAt,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      };
    }),

  /**
   * Create new message
   */
  create: protectedProcedure
    .input(messageSchema)
    .mutation(async ({ ctx, input }) => {
      const [newMessage] = await ctx.db
        .insert(messages)
        .values({
          senderId: ctx.user.userId,
          recipientId: input.recipientId,
          subject: input.subject,
          content: input.content,
          isRead: false,
        })
        .returning();

      return {
        id: newMessage.id,
        senderId: newMessage.senderId,
        recipientId: newMessage.recipientId,
        subject: newMessage.subject,
        content: newMessage.content,
        isRead: newMessage.isRead,
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt,
      };
    }),

  /**
   * Mark message as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [message] = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.id, input.id));

      if (!message) {
        throw new Error('Message not found');
      }

      // Only recipient can mark as read
      if (message.recipientId !== ctx.user.userId) {
        throw new Error('You do not have permission to mark this message as read');
      }

      const [updatedMessage] = await ctx.db
        .update(messages)
        .set({
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(messages.id, input.id))
        .returning();

      return {
        id: updatedMessage.id,
        isRead: updatedMessage.isRead,
        readAt: updatedMessage.readAt,
      };
    }),

  /**
   * Delete message
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [message] = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.id, input.id));

      if (!message) {
        throw new Error('Message not found');
      }

      // Only sender can delete
      if (message.senderId !== ctx.user.userId) {
        throw new Error('You do not have permission to delete this message');
      }

      await ctx.db.delete(messages).where(eq(messages.id, input.id));

      return { success: true };
    }),

  /**
   * Get unread count
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.recipientId, ctx.user.userId),
          eq(messages.isRead, false)
        )
      );

    return { count: Number(result[0]?.count || 0) };
  }),
});
