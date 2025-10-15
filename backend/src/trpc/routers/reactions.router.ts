/**
 * Reactions tRPC Router
 *
 * Handles emoji reactions for stories
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { reactions, users } from '../../db/schema/index';
import { eq, and, desc } from 'drizzle-orm';

export const reactionsRouter = router({
  /**
   * Toggle a specific emoji reaction on a story
   */
  toggle: protectedProcedure
    .input(
      z.object({
        storyId: z.string().uuid(),
        emoji: z.string().min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already reacted with this emoji
      const [existingReaction] = await ctx.db
        .select()
        .from(reactions)
        .where(
          and(
            eq(reactions.storyId, input.storyId),
            eq(reactions.userId, ctx.user.userId),
            eq(reactions.emoji, input.emoji)
          )
        );

      if (existingReaction) {
        // Remove reaction
        await ctx.db
          .delete(reactions)
          .where(
            and(
              eq(reactions.storyId, input.storyId),
              eq(reactions.userId, ctx.user.userId),
              eq(reactions.emoji, input.emoji)
            )
          );

        return { reacted: false, emoji: input.emoji };
      } else {
        // Add reaction
        await ctx.db.insert(reactions).values({
          storyId: input.storyId,
          userId: ctx.user.userId,
          emoji: input.emoji,
        });

        return { reacted: true, emoji: input.emoji };
      }
    }),

  /**
   * Get all reactions for a story (grouped by emoji with user info)
   */
  list: protectedProcedure
    .input(
      z.object({
        storyId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get all reactions for this story with user info
      const allReactions = await ctx.db
        .select({
          reaction: reactions,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(reactions)
        .leftJoin(users, eq(reactions.userId, users.id))
        .where(eq(reactions.storyId, input.storyId))
        .orderBy(desc(reactions.createdAt));

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
   * Get current user's reactions for a story
   */
  getUserReactions: protectedProcedure
    .input(
      z.object({
        storyId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userReactions = await ctx.db
        .select()
        .from(reactions)
        .where(
          and(
            eq(reactions.storyId, input.storyId),
            eq(reactions.userId, ctx.user.userId)
          )
        );

      return userReactions.map((r) => r.emoji);
    }),
});
