/**
 * Teams tRPC Router
 *
 * Team management, members, and invitations
 */

import { z } from 'zod';
import { router, protectedProcedure, requirePermission } from '../../trpc';
import { teams, teamMembers, teamInvites, users } from '../../../db/schema/index';
import { eq, and, or, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// Team validation schemas
const teamSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  description: z.string().optional(),
  visibility: z.enum(['private', 'public']).default('private'),
});

const inviteSchema = z.object({
  teamId: z.string().uuid(),
  // Either userId (existing user) or email (invite by email)
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
}).refine(data => data.userId || data.email, {
  message: 'Either userId or email must be provided',
});

/**
 * Helper function to check if user is team owner or admin
 */
async function checkTeamPermission(
  db: any,
  teamId: string,
  userId: string,
  requiredRoles: Array<'owner' | 'admin' | 'member' | 'viewer'> = ['owner', 'admin']
): Promise<boolean> {
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

  if (!membership) return false;
  return requiredRoles.includes(membership.role);
}

export const teamsRouter = router({
  /**
   * List all teams user is a member of
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const userTeams = await ctx.db
      .select({
        team: teams,
        membership: teamMembers,
        owner: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .leftJoin(users, eq(teams.ownerId, users.id))
      .where(eq(teamMembers.userId, ctx.user.userId))
      .orderBy(desc(teamMembers.joinedAt));

    return userTeams.map(({ team, membership, owner }) => ({
      id: team.id,
      name: team.name,
      slug: team.slug,
      description: team.description,
      visibility: team.visibility,
      ownerId: team.ownerId,
      ownerName: owner?.name || null,
      ownerEmail: owner?.email || null,
      memberRole: membership.role,
      isMember: true,
      joinedAt: membership.joinedAt,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      memberCount: 1, // TODO: Add actual member count query
    }));
  }),

  /**
   * Get single team by ID with member info
   */
  getById: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    // Check if user is a member
    const [membership] = await ctx.db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, input.id), eq(teamMembers.userId, ctx.user.userId)));

    if (!membership) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      });
    }

    const [team] = await ctx.db
      .select({
        team: teams,
        owner: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(teams)
      .leftJoin(users, eq(teams.ownerId, users.id))
      .where(eq(teams.id, input.id));

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      });
    }

    // Get all members
    const members = await ctx.db
      .select({
        member: teamMembers,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, input.id))
      .orderBy(teamMembers.joinedAt);

    return {
      id: team.team.id,
      name: team.team.name,
      slug: team.team.slug,
      description: team.team.description,
      ownerId: team.team.ownerId,
      ownerName: team.owner?.name || null,
      ownerEmail: team.owner?.email || null,
      myRole: membership.role,
      createdAt: team.team.createdAt,
      updatedAt: team.team.updatedAt,
      members: members.map(({ member, user }) => ({
        id: member.id,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        role: member.role,
        joinedAt: member.joinedAt,
      })),
    };
  }),

  /**
   * Create a new team (Premium+ users only)
   */
  create: requirePermission('team:create:own').input(teamSchema).mutation(async ({ ctx, input }) => {
    // Auto-generate slug from name if not provided
    let slug = input.slug || input.name.toLowerCase()
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '')   // Remove non-alphanumeric except hyphens
      .replace(/-+/g, '-')          // Replace multiple hyphens with single
      .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens

    // Ensure slug is unique by appending number if needed
    let slugCandidate = slug;
    let counter = 1;
    while (true) {
      const [existing] = await ctx.db.select().from(teams).where(eq(teams.slug, slugCandidate));
      if (!existing) {
        slug = slugCandidate;
        break;
      }
      slugCandidate = `${slug}-${counter}`;
      counter++;
    }

    // Create team
    const [newTeam] = await ctx.db
      .insert(teams)
      .values({
        name: input.name,
        slug: slug,
        description: input.description,
        visibility: input.visibility,
        ownerId: ctx.user.userId,
      })
      .returning();

    // Add creator as owner member
    await ctx.db.insert(teamMembers).values({
      teamId: newTeam.id,
      userId: ctx.user.userId,
      role: 'owner',
    });

    return {
      id: newTeam.id,
      name: newTeam.name,
      slug: newTeam.slug,
      description: newTeam.description,
      ownerId: newTeam.ownerId,
      myRole: 'owner' as const,
      createdAt: newTeam.createdAt,
      updatedAt: newTeam.updatedAt,
    };
  }),

  /**
   * Update team (owner/admin only)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: teamSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check permission
      const hasPermission = await checkTeamPermission(ctx.db, input.id, ctx.user.userId);
      if (!hasPermission) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only team owners and admins can update team details',
        });
      }

      // If slug is being updated, check availability
      if (input.data.slug) {
        const [existing] = await ctx.db
          .select()
          .from(teams)
          .where(and(eq(teams.slug, input.data.slug), eq(teams.id, input.id)));

        if (existing && existing.id !== input.id) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Team slug already exists',
          });
        }
      }

      const [updatedTeam] = await ctx.db
        .update(teams)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(teams.id, input.id))
        .returning();

      return {
        id: updatedTeam.id,
        name: updatedTeam.name,
        slug: updatedTeam.slug,
        description: updatedTeam.description,
        ownerId: updatedTeam.ownerId,
        updatedAt: updatedTeam.updatedAt,
      };
    }),

  /**
   * Delete team (owner only)
   */
  delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    // Check if user is owner
    const [team] = await ctx.db.select().from(teams).where(eq(teams.id, input.id));

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      });
    }

    if (team.ownerId !== ctx.user.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only team owner can delete the team',
      });
    }

    // Delete team (cascade will handle members, invites, etc.)
    await ctx.db.delete(teams).where(eq(teams.id, input.id));

    return { success: true, id: input.id };
  }),

  /**
   * Invite user to team (owner/admin only)
   */
  invite: protectedProcedure.input(inviteSchema).mutation(async ({ ctx, input }) => {
    // Check permission
    const hasPermission = await checkTeamPermission(ctx.db, input.teamId, ctx.user.userId);
    if (!hasPermission) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only team owners and admins can invite members',
      });
    }

    // If userId provided, check if already a member
    if (input.userId) {
      const [existing] = await ctx.db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, input.teamId), eq(teamMembers.userId, input.userId)));

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already a team member',
        });
      }
    }

    // Create invitation
    const [invite] = await ctx.db
      .insert(teamInvites)
      .values({
        teamId: input.teamId,
        invitedBy: ctx.user.userId,
        userId: input.userId,
        email: input.email,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
      .returning();

    return {
      id: invite.id,
      teamId: invite.teamId,
      invitedBy: invite.invitedBy,
      userId: invite.userId,
      email: invite.email,
      status: invite.status,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
    };
  }),

  /**
   * Accept team invitation
   */
  acceptInvite: protectedProcedure
    .input(z.object({ inviteId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get invite
      const [invite] = await ctx.db.select().from(teamInvites).where(eq(teamInvites.id, input.inviteId));

      if (!invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        });
      }

      // Check if invite is for current user
      if (invite.userId && invite.userId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This invitation is for a different user',
        });
      }

      // Check if still pending and not expired
      if (invite.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invitation has already been responded to',
        });
      }

      if (invite.expiresAt && invite.expiresAt < new Date()) {
        // Mark as expired
        await ctx.db
          .update(teamInvites)
          .set({ status: 'expired', updatedAt: new Date() })
          .where(eq(teamInvites.id, input.inviteId));

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invitation has expired',
        });
      }

      // Add user to team
      await ctx.db.insert(teamMembers).values({
        teamId: invite.teamId,
        userId: ctx.user.userId,
        role: 'member',
      });

      // Update invite status
      await ctx.db
        .update(teamInvites)
        .set({
          status: 'accepted',
          respondedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(teamInvites.id, input.inviteId));

      return { success: true, teamId: invite.teamId };
    }),

  /**
   * Reject team invitation
   */
  rejectInvite: protectedProcedure
    .input(z.object({ inviteId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get invite
      const [invite] = await ctx.db.select().from(teamInvites).where(eq(teamInvites.id, input.inviteId));

      if (!invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        });
      }

      // Check if invite is for current user
      if (invite.userId && invite.userId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This invitation is for a different user',
        });
      }

      // Update invite status
      await ctx.db
        .update(teamInvites)
        .set({
          status: 'rejected',
          respondedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(teamInvites.id, input.inviteId));

      return { success: true };
    }),

  /**
   * Remove member from team (owner/admin only)
   */
  removeMember: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check permission
      const hasPermission = await checkTeamPermission(ctx.db, input.teamId, ctx.user.userId);
      if (!hasPermission) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only team owners and admins can remove members',
        });
      }

      // Cannot remove team owner
      const [team] = await ctx.db.select().from(teams).where(eq(teams.id, input.teamId));
      if (team && team.ownerId === input.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot remove team owner',
        });
      }

      // Remove member
      await ctx.db
        .delete(teamMembers)
        .where(and(eq(teamMembers.teamId, input.teamId), eq(teamMembers.userId, input.userId)));

      return { success: true };
    }),

  /**
   * Update member role (owner only)
   */
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        userId: z.string().uuid(),
        role: z.enum(['admin', 'member', 'viewer']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if current user is owner
      const [team] = await ctx.db.select().from(teams).where(eq(teams.id, input.teamId));

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      if (team.ownerId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only team owner can change member roles',
        });
      }

      // Cannot change owner's role
      if (team.ownerId === input.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot change team owner role',
        });
      }

      // Update role
      const [updatedMember] = await ctx.db
        .update(teamMembers)
        .set({ role: input.role })
        .where(and(eq(teamMembers.teamId, input.teamId), eq(teamMembers.userId, input.userId)))
        .returning();

      return {
        userId: input.userId,
        role: updatedMember.role,
      };
    }),

  /**
   * Leave team (cannot leave if owner)
   */
  leave: protectedProcedure.input(z.object({ teamId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    // Check if user is owner
    const [team] = await ctx.db.select().from(teams).where(eq(teams.id, input.teamId));

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      });
    }

    if (team.ownerId === ctx.user.userId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Team owner cannot leave. Transfer ownership or delete the team instead.',
      });
    }

    // Remove membership
    await ctx.db
      .delete(teamMembers)
      .where(and(eq(teamMembers.teamId, input.teamId), eq(teamMembers.userId, ctx.user.userId)));

    return { success: true };
  }),
});
