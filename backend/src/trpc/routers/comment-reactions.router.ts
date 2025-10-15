/**
 * Comment Reactions tRPC Router
 *
 * Handles emoji reactions for comments
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { commentReactions, users } from '../../db/schema/index';
import { eq, and, desc } from 'drizzle-orm';

export const commentReactionsRouter = router({
  /**
   * Toggle a specific emoji reaction on a comment
   */
  toggle: protectedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        emoji: z.string().min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already reacted with this emoji
      const [existingReaction] = await ctx.db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.commentId, input.commentId),
            eq(commentReactions.userId, ctx.user.userId),
            eq(commentReactions.emoji, input.emoji)
          )
        );

      if (existingReaction) {
        // Remove reaction
        await ctx.db
          .delete(commentReactions)
          .where(
            and(
              eq(commentReactions.commentId, input.commentId),
              eq(commentReactions.userId, ctx.user.userId),
              eq(commentReactions.emoji, input.emoji)
            )
          );

        return { reacted: false, emoji: input.emoji };
      } else {
        // Add reaction
        await ctx.db.insert(commentReactions).values({
          commentId: input.commentId,
          userId: ctx.user.userId,
          emoji: input.emoji,
        });

        return { reacted: true, emoji: input.emoji };
      }
    }),

  /**
   * Get all reactions for a comment (grouped by emoji with user info)
   */
  list: protectedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get all reactions for this comment with user info
      const allReactions = await ctx.db
        .select({
          reaction: commentReactions,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(commentReactions)
        .leftJoin(users, eq(commentReactions.userId, users.id))
        .where(eq(commentReactions.commentId, input.commentId))
        .orderBy(desc(commentReactions.createdAt));

      // Group by emoji
      const groupedReactions = allReactions.reduce((acc, { reaction, user }) => {
        const emoji = reaction.emoji;
        if (!acc[emoji]) {
          acc[emoji] = [];
        }
        acc[emoji].push({
          userId: reaction.userId,
          name: user?.name || 'Unknown',
          email: user?.email || '',
        });
        return acc;
      }, {} as Record<string, Array<{ userId: string; name: string; email: string }>>);

      // Convert to array format
      return Object.entries(groupedReactions).map(([emoji, users]) => ({
        emoji,
        users,
      }));
    }),

  /**
   * Get current user's reactions for a comment
   */
  getUserReactions: protectedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userReactions = await ctx.db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.commentId, input.commentId),
            eq(commentReactions.userId, ctx.user.userId)
          )
        );

      return userReactions.map((r) => r.emoji);
    }),
});
