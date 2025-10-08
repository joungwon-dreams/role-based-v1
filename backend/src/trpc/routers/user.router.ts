import { z } from 'zod';
import { router, protectedProcedure, requirePermission } from '../trpc';
import { users, userRoles } from '../../db/schema';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

export const userRouter = router({
  /**
   * Get current user profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.userId),
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }),

  /**
   * Update current user profile
   */
  updateProfile: requirePermission('user:update:own')
    .input(
      z.object({
        name: z.string().min(2).optional(),
        image: z.string().url().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.userId))
        .returning();

      return {
        success: true,
        user: updatedUser,
      };
    }),

  /**
   * Get user by ID (requires permission)
   */
  getById: requirePermission('user:read:all')
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
        with: {
          userRoles: {
            with: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
        roles: user.userRoles.map((ur: any) => ({
          id: ur.role.id,
          name: ur.role.name,
          label: ur.role.label,
          level: ur.role.level,
        })),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }),

  /**
   * List all users (admin only)
   */
  list: requirePermission('user:list:all')
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const allUsers = await ctx.db.query.users.findMany({
        limit: input.limit,
        offset: input.offset,
        with: {
          userRoles: {
            with: {
              role: true,
            },
          },
        },
        orderBy: (users, { desc }) => [desc(users.createdAt)],
      });

      return {
        users: allUsers.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
          roles: user.userRoles.map((ur: any) => ur.role.name),
          createdAt: user.createdAt,
        })),
        total: allUsers.length,
      };
    }),

  /**
   * Update any user (admin only)
   */
  updateUser: requirePermission('user:update:all')
    .input(
      z.object({
        userId: z.string().uuid(),
        name: z.string().min(2).optional(),
        image: z.string().url().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, ...updateData } = input;

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      return {
        success: true,
        user: updatedUser,
      };
    }),

  /**
   * Delete user (admin only)
   */
  deleteUser: requirePermission('user:delete:all')
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Prevent deleting yourself
      if (user.id === ctx.user.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot delete your own account',
        });
      }

      await ctx.db.delete(users).where(eq(users.id, input.userId));

      return {
        success: true,
        message: 'User deleted successfully',
      };
    }),
});
