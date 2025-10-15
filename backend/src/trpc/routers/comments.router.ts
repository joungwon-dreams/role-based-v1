/**
 * Comments tRPC Router
 *
 * Handles comment operations for stories
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { comments, users } from '../../db/schema/index';
import { eq, and, desc, count } from 'drizzle-orm';

export const commentsRouter = router({
  /**
   * Get comments for a story
   */
  list: protectedProcedure
    .input(
      z.object({
        storyId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const allComments = await ctx.db
        .select({
          comment: comments,
          author: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(comments)
        .leftJoin(users, eq(comments.authorId, users.id))
        .where(eq(comments.storyId, input.storyId))
        .orderBy(desc(comments.createdAt));

      return allComments.map(({ comment, author }) => ({
        id: comment.id,
        storyId: comment.storyId,
        authorId: comment.authorId,
        authorName: author?.name || null,
        authorEmail: author?.email || null,
        content: comment.content,
        attachments: comment.attachments as Array<{
          type: 'image' | 'file';
          url: string;
          name: string;
          size: number;
        }> | null,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      }));
    }),

  /**
   * Get comment count for a story
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
        .from(comments)
        .where(eq(comments.storyId, input.storyId));

      return result?.count || 0;
    }),

  /**
   * Create a comment
   */
  create: protectedProcedure
    .input(
      z.object({
        storyId: z.string().uuid(),
        content: z.string().min(1, 'Comment cannot be empty'),
        parentId: z.string().uuid().optional(),
        attachments: z
          .array(
            z.object({
              type: z.enum(['image', 'file']),
              url: z.string(),
              name: z.string(),
              size: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newComment] = await ctx.db
        .insert(comments)
        .values({
          storyId: input.storyId,
          authorId: ctx.user.userId,
          content: input.content,
          parentId: input.parentId || null,
          attachments: input.attachments || null,
        })
        .returning();

      return {
        id: newComment.id,
        storyId: newComment.storyId,
        authorId: newComment.authorId,
        content: newComment.content,
        attachments: newComment.attachments,
        parentId: newComment.parentId,
        createdAt: newComment.createdAt,
        updatedAt: newComment.updatedAt,
      };
    }),

  /**
   * Delete a comment
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if comment exists and belongs to user
      const [existingComment] = await ctx.db
        .select()
        .from(comments)
        .where(and(eq(comments.id, input.id), eq(comments.authorId, ctx.user.userId)));

      if (!existingComment) {
        throw new Error('Comment not found or you do not have permission to delete it');
      }

      await ctx.db.delete(comments).where(and(eq(comments.id, input.id), eq(comments.authorId, ctx.user.userId)));

      return { success: true, id: input.id };
    }),
});
