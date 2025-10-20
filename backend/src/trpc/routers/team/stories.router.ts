/**
 * Team Stories tRPC Router
 *
 * Team story/announcement management
 * Only handles team stories (scope='team')
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../../trpc';
import { stories, teamMembers, users } from '../../../db/schema/index';
import { eq, and, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

const teamStorySchema = z.object({
  teamId: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().min(1).max(255),
  isPublished: z.boolean().default(false),
  visibility: z.enum(['team', 'public']).default('team'),
  isPinned: z.boolean().default(false), // Pin important announcements
});

/**
 * Helper function to check if user is team member
 */
async function checkTeamMembership(
  db: any,
  teamId: string,
  userId: string
): Promise<{ isMember: boolean; role?: string }> {
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

  return {
    isMember: !!membership,
    role: membership?.role,
  };
}

export const teamStoriesRouter = router({
  /**
   * Get all stories for a specific team
   */
  list: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        filter: z.enum(['all', 'published', 'drafts', 'pinned']).optional().default('all'),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is team member
      const { isMember } = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this team',
        });
      }

      let whereConditions;
      const baseCondition = and(eq(stories.teamId, input.teamId), eq(stories.scope, 'team'));

      if (input.filter === 'published') {
        whereConditions = and(baseCondition, eq(stories.isPublished, true));
      } else if (input.filter === 'drafts') {
        whereConditions = and(baseCondition, eq(stories.isPublished, false));
      } else if (input.filter === 'pinned') {
        whereConditions = and(baseCondition, eq(stories.isPinned, true));
      } else {
        whereConditions = baseCondition;
      }

      const teamStories = await ctx.db
        .select({
          story: stories,
          author: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(stories)
        .leftJoin(users, eq(stories.authorId, users.id))
        .where(whereConditions)
        .orderBy(desc(stories.isPinned), desc(stories.createdAt)); // Pinned first, then by date

      return teamStories.map(({ story, author }) => ({
        id: story.id,
        authorId: story.authorId,
        authorName: author?.name || null,
        authorEmail: author?.email || null,
        title: story.title,
        content: story.content,
        slug: story.slug,
        isPublished: story.isPublished,
        isPinned: story.isPinned,
        visibility: story.visibility,
        publishedAt: story.publishedAt,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      }));
    }),

  /**
   * Get single team story by ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        teamId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is team member
      const { isMember } = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this team',
        });
      }

      const [story] = await ctx.db
        .select({
          story: stories,
          author: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(stories)
        .leftJoin(users, eq(stories.authorId, users.id))
        .where(
          and(eq(stories.id, input.id), eq(stories.teamId, input.teamId), eq(stories.scope, 'team'))
        );

      if (!story) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Story not found',
        });
      }

      return {
        id: story.story.id,
        authorId: story.story.authorId,
        authorName: story.author?.name || null,
        authorEmail: story.author?.email || null,
        title: story.story.title,
        content: story.story.content,
        slug: story.story.slug,
        isPublished: story.story.isPublished,
        isPinned: story.story.isPinned,
        visibility: story.story.visibility,
        publishedAt: story.story.publishedAt,
        createdAt: story.story.createdAt,
        updatedAt: story.story.updatedAt,
      };
    }),

  /**
   * Create a new team story
   */
  create: protectedProcedure.input(teamStorySchema).mutation(async ({ ctx, input }) => {
    // Check if user is team member
    const { isMember } = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
    if (!isMember) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      });
    }

    const [newStory] = await ctx.db
      .insert(stories)
      .values({
        authorId: ctx.user.userId,
        teamId: input.teamId,
        scope: 'team',
        visibility: input.visibility,
        isPinned: input.isPinned,
        title: input.title,
        content: input.content,
        slug: input.slug,
        isPublished: input.isPublished,
        publishedAt: input.isPublished ? new Date() : null,
      })
      .returning();

    return {
      id: newStory.id,
      authorId: newStory.authorId,
      title: newStory.title,
      content: newStory.content,
      slug: newStory.slug,
      isPublished: newStory.isPublished,
      isPinned: newStory.isPinned,
      visibility: newStory.visibility,
      publishedAt: newStory.publishedAt,
      createdAt: newStory.createdAt,
      updatedAt: newStory.updatedAt,
    };
  }),

  /**
   * Update a team story
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        teamId: z.string().uuid(),
        data: teamStorySchema.omit({ teamId: true }).partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is team member
      const { isMember } = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this team',
        });
      }

      // Check if story exists and is a team story
      const [existingStory] = await ctx.db
        .select()
        .from(stories)
        .where(
          and(eq(stories.id, input.id), eq(stories.teamId, input.teamId), eq(stories.scope, 'team'))
        );

      if (!existingStory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Story not found or not a team story',
        });
      }

      // Only author or team owner/admin can update
      const { role } = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
      if (existingStory.authorId !== ctx.user.userId && role !== 'owner' && role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the author or team admins can edit this story',
        });
      }

      // Prepare update object
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (input.data.title !== undefined) updateData.title = input.data.title;
      if (input.data.content !== undefined) updateData.content = input.data.content;
      if (input.data.slug !== undefined) updateData.slug = input.data.slug;
      if (input.data.visibility !== undefined) updateData.visibility = input.data.visibility;
      if (input.data.isPinned !== undefined) {
        // Only owner/admin can pin/unpin
        if (role === 'owner' || role === 'admin') {
          updateData.isPinned = input.data.isPinned;
        }
      }
      if (input.data.isPublished !== undefined) {
        updateData.isPublished = input.data.isPublished;
        // Set publishedAt when publishing for the first time
        if (input.data.isPublished && !existingStory.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }

      const [updatedStory] = await ctx.db
        .update(stories)
        .set(updateData)
        .where(
          and(eq(stories.id, input.id), eq(stories.teamId, input.teamId), eq(stories.scope, 'team'))
        )
        .returning();

      return {
        id: updatedStory.id,
        authorId: updatedStory.authorId,
        title: updatedStory.title,
        content: updatedStory.content,
        slug: updatedStory.slug,
        isPublished: updatedStory.isPublished,
        isPinned: updatedStory.isPinned,
        visibility: updatedStory.visibility,
        publishedAt: updatedStory.publishedAt,
        createdAt: updatedStory.createdAt,
        updatedAt: updatedStory.updatedAt,
      };
    }),

  /**
   * Delete a team story
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        teamId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is team member
      const { isMember, role } = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this team',
        });
      }

      // Check if story exists and is a team story
      const [existingStory] = await ctx.db
        .select()
        .from(stories)
        .where(
          and(eq(stories.id, input.id), eq(stories.teamId, input.teamId), eq(stories.scope, 'team'))
        );

      if (!existingStory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Story not found or not a team story',
        });
      }

      // Only author or team owner/admin can delete
      if (existingStory.authorId !== ctx.user.userId && role !== 'owner' && role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the author or team admins can delete this story',
        });
      }

      await ctx.db
        .delete(stories)
        .where(
          and(eq(stories.id, input.id), eq(stories.teamId, input.teamId), eq(stories.scope, 'team'))
        );

      return { success: true, id: input.id };
    }),

  /**
   * Toggle publish status (author only)
   */
  togglePublish: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        teamId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is team member
      const { isMember } = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this team',
        });
      }

      // Check if story exists and is a team story
      const [existingStory] = await ctx.db
        .select()
        .from(stories)
        .where(
          and(eq(stories.id, input.id), eq(stories.teamId, input.teamId), eq(stories.scope, 'team'))
        );

      if (!existingStory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Story not found or not a team story',
        });
      }

      // Only author can toggle publish
      if (existingStory.authorId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the author can publish/unpublish this story',
        });
      }

      const newPublishState = !existingStory.isPublished;

      const [updatedStory] = await ctx.db
        .update(stories)
        .set({
          isPublished: newPublishState,
          publishedAt: newPublishState && !existingStory.publishedAt ? new Date() : existingStory.publishedAt,
          updatedAt: new Date(),
        })
        .where(
          and(eq(stories.id, input.id), eq(stories.teamId, input.teamId), eq(stories.scope, 'team'))
        )
        .returning();

      return {
        id: updatedStory.id,
        isPublished: updatedStory.isPublished,
        publishedAt: updatedStory.publishedAt,
      };
    }),

  /**
   * Toggle pin status (owner/admin only)
   */
  togglePin: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        teamId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner/admin
      const { isMember, role } = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this team',
        });
      }

      if (role !== 'owner' && role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only team owners and admins can pin/unpin stories',
        });
      }

      // Check if story exists and is a team story
      const [existingStory] = await ctx.db
        .select()
        .from(stories)
        .where(
          and(eq(stories.id, input.id), eq(stories.teamId, input.teamId), eq(stories.scope, 'team'))
        );

      if (!existingStory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Story not found or not a team story',
        });
      }

      const [updatedStory] = await ctx.db
        .update(stories)
        .set({
          isPinned: !existingStory.isPinned,
          updatedAt: new Date(),
        })
        .where(
          and(eq(stories.id, input.id), eq(stories.teamId, input.teamId), eq(stories.scope, 'team'))
        )
        .returning();

      return {
        id: updatedStory.id,
        isPinned: updatedStory.isPinned,
      };
    }),
});
