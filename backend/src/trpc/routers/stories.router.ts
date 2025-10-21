/**
 * Stories tRPC Router
 *
 * Social feed CRUD operations (Facebook/Instagram style)
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { stories, users } from '../../db/schema/index';
import { eq, and, desc } from 'drizzle-orm';
import { cacheAside, invalidateRelatedCache, CacheKeys, CacheTTL } from '../../db/optimizations/caching-strategy';

const storySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().min(1).max(255),
  isPublished: z.boolean().default(false),
});

export const storiesRouter = router({
  /**
   * Get all published stories (feed)
   * NOTE: This router only returns personal stories (scope='personal')
   * For team stories, use the team.stories router
   */
  list: protectedProcedure
    .input(
      z
        .object({
          filter: z.enum(['all', 'own', 'published', 'drafts']).optional().default('all'),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filter = input?.filter || 'all';

      let whereConditions;
      if (filter === 'own') {
        whereConditions = and(eq(stories.authorId, ctx.user.userId), eq(stories.scope, 'personal'));
      } else if (filter === 'published') {
        whereConditions = and(eq(stories.isPublished, true), eq(stories.scope, 'personal'));
      } else if (filter === 'drafts') {
        whereConditions = and(
          eq(stories.authorId, ctx.user.userId),
          eq(stories.isPublished, false),
          eq(stories.scope, 'personal')
        );
      } else {
        // all - show published stories OR user's own stories (personal only)
        whereConditions = eq(stories.scope, 'personal');
      }

      const allStories = await ctx.db
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
        .orderBy(desc(stories.createdAt));

      // For 'all' filter, show published + user's own stories
      const filteredStories =
        filter === 'all'
          ? allStories.filter((item) => item.story.isPublished || item.story.authorId === ctx.user.userId)
          : allStories;

      return filteredStories.map(({ story, author }) => ({
        id: story.id,
        authorId: story.authorId,
        authorName: author?.name || null,
        authorEmail: author?.email || null,
        title: story.title,
        content: story.content,
        slug: story.slug,
        isPublished: story.isPublished,
        publishedAt: story.publishedAt,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      }));
    }),

  /**
   * Get single story by ID (with Redis caching)
   * NOTE: Only returns personal stories (scope='personal')
   */
  getById: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    return cacheAside(
      CacheKeys.story(input.id),
      async () => {
        const [story] = await ctx.db
          .select()
          .from(stories)
          .where(and(eq(stories.id, input.id), eq(stories.scope, 'personal')));

        if (!story) {
          throw new Error('Story not found');
        }

        // Check if user can view this story
        if (!story.isPublished && story.authorId !== ctx.user.userId) {
          throw new Error('You do not have permission to view this story');
        }

        return {
          id: story.id,
          authorId: story.authorId,
          title: story.title,
          content: story.content,
          slug: story.slug,
          isPublished: story.isPublished,
          publishedAt: story.publishedAt,
          createdAt: story.createdAt,
          updatedAt: story.updatedAt,
        };
      },
      CacheTTL.story
    );
  }),

  /**
   * Create a new story
   */
  create: protectedProcedure.input(storySchema).mutation(async ({ ctx, input }) => {
    const [newStory] = await ctx.db
      .insert(stories)
      .values({
        authorId: ctx.user.userId,
        title: input.title,
        content: input.content,
        slug: input.slug,
        isPublished: input.isPublished,
        publishedAt: input.isPublished ? new Date() : null,
        // Team integration fields - all personal stories
        scope: 'personal',
        visibility: input.isPublished ? 'public' : 'private',
        isPinned: false,
      })
      .returning();

    return {
      id: newStory.id,
      authorId: newStory.authorId,
      title: newStory.title,
      content: newStory.content,
      slug: newStory.slug,
      isPublished: newStory.isPublished,
      publishedAt: newStory.publishedAt,
      createdAt: newStory.createdAt,
      updatedAt: newStory.updatedAt,
    };
  }),

  /**
   * Update an existing story
   * NOTE: Only updates personal stories (scope='personal')
   * Scope and visibility are managed automatically
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: storySchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if story exists, belongs to user, and is personal
      const [existingStory] = await ctx.db
        .select()
        .from(stories)
        .where(
          and(eq(stories.id, input.id), eq(stories.authorId, ctx.user.userId), eq(stories.scope, 'personal'))
        );

      if (!existingStory) {
        throw new Error('Story not found or you do not have permission to edit it');
      }

      // Prepare update object
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (input.data.title !== undefined) updateData.title = input.data.title;
      if (input.data.content !== undefined) updateData.content = input.data.content;
      if (input.data.slug !== undefined) updateData.slug = input.data.slug;
      if (input.data.isPublished !== undefined) {
        updateData.isPublished = input.data.isPublished;
        // Update visibility based on publish state
        updateData.visibility = input.data.isPublished ? 'public' : 'private';
        // Set publishedAt when publishing for the first time
        if (input.data.isPublished && !existingStory.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }

      const [updatedStory] = await ctx.db
        .update(stories)
        .set(updateData)
        .where(
          and(eq(stories.id, input.id), eq(stories.authorId, ctx.user.userId), eq(stories.scope, 'personal'))
        )
        .returning();

      // Invalidate story cache after update
      await invalidateRelatedCache('story', input.id);

      return {
        id: updatedStory.id,
        authorId: updatedStory.authorId,
        title: updatedStory.title,
        content: updatedStory.content,
        slug: updatedStory.slug,
        isPublished: updatedStory.isPublished,
        publishedAt: updatedStory.publishedAt,
        createdAt: updatedStory.createdAt,
        updatedAt: updatedStory.updatedAt,
      };
    }),

  /**
   * Delete a story
   * NOTE: Only deletes personal stories (scope='personal')
   */
  delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    // Check if story exists, belongs to user, and is personal
    const [existingStory] = await ctx.db
      .select()
      .from(stories)
      .where(
        and(eq(stories.id, input.id), eq(stories.authorId, ctx.user.userId), eq(stories.scope, 'personal'))
      );

    if (!existingStory) {
      throw new Error('Story not found or you do not have permission to delete it');
    }

    await ctx.db
      .delete(stories)
      .where(and(eq(stories.id, input.id), eq(stories.authorId, ctx.user.userId), eq(stories.scope, 'personal')));

    // Invalidate story cache after deletion
    await invalidateRelatedCache('story', input.id);

    return { success: true, id: input.id };
  }),

  /**
   * Toggle publish status
   * NOTE: Only toggles personal stories (scope='personal')
   * Updates visibility automatically based on publish state
   */
  togglePublish: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    // Check if story exists, belongs to user, and is personal
    const [existingStory] = await ctx.db
      .select()
      .from(stories)
      .where(
        and(eq(stories.id, input.id), eq(stories.authorId, ctx.user.userId), eq(stories.scope, 'personal'))
      );

    if (!existingStory) {
      throw new Error('Story not found or you do not have permission to edit it');
    }

    const newPublishState = !existingStory.isPublished;

    const [updatedStory] = await ctx.db
      .update(stories)
      .set({
        isPublished: newPublishState,
        visibility: newPublishState ? 'public' : 'private',
        publishedAt: newPublishState && !existingStory.publishedAt ? new Date() : existingStory.publishedAt,
        updatedAt: new Date(),
      })
      .where(
        and(eq(stories.id, input.id), eq(stories.authorId, ctx.user.userId), eq(stories.scope, 'personal'))
      )
      .returning();

    return {
      id: updatedStory.id,
      isPublished: updatedStory.isPublished,
      publishedAt: updatedStory.publishedAt,
    };
  }),
});
