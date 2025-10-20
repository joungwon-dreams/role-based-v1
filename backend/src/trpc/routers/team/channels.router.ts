/**
 * Team Channels tRPC Router
 *
 * Team communication channels (like Slack/Discord)
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../../trpc';
import {
  teamChannels,
  teamChannelMessages,
  teamChannelMembers,
  teamMembers,
  users,
} from '../../../db/schema/index';
import { eq, and, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

const channelSchema = z.object({
  teamId: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

const messageSchema = z.object({
  channelId: z.string().uuid(),
  content: z.string().min(1, 'Message cannot be empty'),
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

/**
 * Helper function to check if user is channel member
 */
async function checkChannelMembership(db: any, channelId: string, userId: string): Promise<boolean> {
  const [membership] = await db
    .select()
    .from(teamChannelMembers)
    .where(and(eq(teamChannelMembers.channelId, channelId), eq(teamChannelMembers.userId, userId)));

  return !!membership;
}

export const teamChannelsRouter = router({
  /**
   * List all channels for a team
   */
  list: protectedProcedure.input(z.object({ teamId: z.string().uuid() })).query(async ({ ctx, input }) => {
    // Check if user is team member
    const { isMember } = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
    if (!isMember) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      });
    }

    const channels = await ctx.db
      .select({
        channel: teamChannels,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(teamChannels)
      .leftJoin(users, eq(teamChannels.createdBy, users.id))
      .where(eq(teamChannels.teamId, input.teamId))
      .orderBy(teamChannels.createdAt);

    // For each channel, check if it's private and if user has access
    const accessibleChannels = await Promise.all(
      channels.map(async ({ channel, creator }) => {
        if (channel.isPrivate) {
          const hasAccess = await checkChannelMembership(ctx.db, channel.id, ctx.user.userId);
          if (!hasAccess) return null;
        }

        return {
          id: channel.id,
          teamId: channel.teamId,
          name: channel.name,
          description: channel.description,
          isPrivate: channel.isPrivate,
          createdBy: creator?.name || null,
          createdByEmail: creator?.email || null,
          createdAt: channel.createdAt,
          updatedAt: channel.updatedAt,
        };
      })
    );

    return accessibleChannels.filter((channel) => channel !== null);
  }),

  /**
   * Create a new channel (owner/admin only)
   */
  create: protectedProcedure.input(channelSchema).mutation(async ({ ctx, input }) => {
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
        message: 'Only team owners and admins can create channels',
      });
    }

    const [newChannel] = await ctx.db
      .insert(teamChannels)
      .values({
        teamId: input.teamId,
        name: input.name,
        description: input.description,
        isPrivate: input.isPrivate,
        createdBy: ctx.user.userId,
      })
      .returning();

    // If private channel, add creator as member
    if (input.isPrivate) {
      await ctx.db.insert(teamChannelMembers).values({
        channelId: newChannel.id,
        userId: ctx.user.userId,
      });
    }

    return {
      id: newChannel.id,
      teamId: newChannel.teamId,
      name: newChannel.name,
      description: newChannel.description,
      isPrivate: newChannel.isPrivate,
      createdAt: newChannel.createdAt,
      updatedAt: newChannel.updatedAt,
    };
  }),

  /**
   * Update channel (owner/admin only)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        teamId: z.string().uuid(),
        data: channelSchema.omit({ teamId: true }).partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner/admin
      const { isMember, role } = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
      if (!isMember || (role !== 'owner' && role !== 'admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only team owners and admins can update channels',
        });
      }

      const [updatedChannel] = await ctx.db
        .update(teamChannels)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(and(eq(teamChannels.id, input.id), eq(teamChannels.teamId, input.teamId)))
        .returning();

      return {
        id: updatedChannel.id,
        name: updatedChannel.name,
        description: updatedChannel.description,
        isPrivate: updatedChannel.isPrivate,
        updatedAt: updatedChannel.updatedAt,
      };
    }),

  /**
   * Delete channel (owner/admin only)
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        teamId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner/admin
      const { isMember, role } = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
      if (!isMember || (role !== 'owner' && role !== 'admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only team owners and admins can delete channels',
        });
      }

      await ctx.db
        .delete(teamChannels)
        .where(and(eq(teamChannels.id, input.id), eq(teamChannels.teamId, input.teamId)));

      return { success: true, id: input.id };
    }),

  /**
   * Get messages for a channel
   */
  getMessages: protectedProcedure
    .input(
      z.object({
        channelId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get channel to check team membership
      const [channel] = await ctx.db.select().from(teamChannels).where(eq(teamChannels.id, input.channelId));

      if (!channel) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Channel not found',
        });
      }

      // Check team membership
      const { isMember } = await checkTeamMembership(ctx.db, channel.teamId, ctx.user.userId);
      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this team',
        });
      }

      // Check channel access (for private channels)
      if (channel.isPrivate) {
        const hasAccess = await checkChannelMembership(ctx.db, input.channelId, ctx.user.userId);
        if (!hasAccess) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this private channel',
          });
        }
      }

      const messages = await ctx.db
        .select({
          message: teamChannelMessages,
          sender: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(teamChannelMessages)
        .leftJoin(users, eq(teamChannelMessages.senderId, users.id))
        .where(eq(teamChannelMessages.channelId, input.channelId))
        .orderBy(desc(teamChannelMessages.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return messages.map(({ message, sender }) => ({
        id: message.id,
        channelId: message.channelId,
        senderId: message.senderId,
        senderName: sender?.name || null,
        senderEmail: sender?.email || null,
        content: message.content,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      }));
    }),

  /**
   * Send a message to a channel
   */
  sendMessage: protectedProcedure.input(messageSchema).mutation(async ({ ctx, input }) => {
    // Get channel to check team membership
    const [channel] = await ctx.db.select().from(teamChannels).where(eq(teamChannels.id, input.channelId));

    if (!channel) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Channel not found',
      });
    }

    // Check team membership
    const { isMember } = await checkTeamMembership(ctx.db, channel.teamId, ctx.user.userId);
    if (!isMember) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      });
    }

    // Check channel access (for private channels)
    if (channel.isPrivate) {
      const hasAccess = await checkChannelMembership(ctx.db, input.channelId, ctx.user.userId);
      if (!hasAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this private channel',
        });
      }
    }

    const [newMessage] = await ctx.db
      .insert(teamChannelMessages)
      .values({
        channelId: input.channelId,
        senderId: ctx.user.userId,
        content: input.content,
      })
      .returning();

    return {
      id: newMessage.id,
      channelId: newMessage.channelId,
      senderId: newMessage.senderId,
      content: newMessage.content,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
    };
  }),

  /**
   * Add member to private channel (owner/admin only)
   */
  addMember: protectedProcedure
    .input(
      z.object({
        channelId: z.string().uuid(),
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get channel
      const [channel] = await ctx.db.select().from(teamChannels).where(eq(teamChannels.id, input.channelId));

      if (!channel) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Channel not found',
        });
      }

      if (!channel.isPrivate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only private channels require explicit membership',
        });
      }

      // Check if current user is owner/admin
      const { isMember, role } = await checkTeamMembership(ctx.db, channel.teamId, ctx.user.userId);
      if (!isMember || (role !== 'owner' && role !== 'admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only team owners and admins can add members to private channels',
        });
      }

      // Check if target user is team member
      const { isMember: isTargetMember } = await checkTeamMembership(ctx.db, channel.teamId, input.userId);
      if (!isTargetMember) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User must be a team member first',
        });
      }

      // Add to channel
      await ctx.db.insert(teamChannelMembers).values({
        channelId: input.channelId,
        userId: input.userId,
      });

      return { success: true };
    }),

  /**
   * Remove member from private channel (owner/admin only)
   */
  removeMember: protectedProcedure
    .input(
      z.object({
        channelId: z.string().uuid(),
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get channel
      const [channel] = await ctx.db.select().from(teamChannels).where(eq(teamChannels.id, input.channelId));

      if (!channel) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Channel not found',
        });
      }

      // Check if current user is owner/admin
      const { isMember, role } = await checkTeamMembership(ctx.db, channel.teamId, ctx.user.userId);
      if (!isMember || (role !== 'owner' && role !== 'admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only team owners and admins can remove members from private channels',
        });
      }

      await ctx.db
        .delete(teamChannelMembers)
        .where(
          and(eq(teamChannelMembers.channelId, input.channelId), eq(teamChannelMembers.userId, input.userId))
        );

      return { success: true };
    }),
});
