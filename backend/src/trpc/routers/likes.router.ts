/**
 * Likes tRPC Router
 *
 * Handles like/unlike operations for stories
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { likes } from '../../db/schema/index';
import { eq, and, count } from 'drizzle-orm';

export const likesRouter = router({
  /**
   * Toggle like on a story
   */
  toggle: protectedProcedure
    .input(
      z.object({
        storyId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already liked this story
      const [existingLike] = await ctx.db
        .select()
        .from(likes)
        .where(and(eq(likes.storyId, input.storyId), eq(likes.userId, ctx.user.userId)));

      if (existingLike) {
        // Unlike
        await ctx.db
          .delete(likes)
          .where(and(eq(likes.storyId, input.storyId), eq(likes.userId, ctx.user.userId)));

        return { liked: false };
      } else {
        // Like
        await ctx.db.insert(likes).values({
          storyId: input.storyId,
          userId: ctx.user.userId,
        });

        return { liked: true };
      }
    }),

  /**
   * Get like count for a story
   */
  getCount: protectedProcedure
    .input(
      z.object({
        storyId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .select({ count: count() })
        .from(likes)
        .where(eq(likes.storyId, input.storyId));

      return result?.count || 0;
    }),

  /**
   * Check if current user liked a story
   */
  isLiked: protectedProcedure
    .input(
      z.object({
        storyId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [existingLike] = await ctx.db
        .select()
        .from(likes)
        .where(and(eq(likes.storyId, input.storyId), eq(likes.userId, ctx.user.userId)));

      return !!existingLike;
    }),
});
