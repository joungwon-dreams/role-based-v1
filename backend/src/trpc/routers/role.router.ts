import { z } from 'zod';
import { router, protectedProcedure, requirePermission } from '../trpc';
import { roles, userRoles, rolePermissions } from '../../db/schema';
import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';

export const roleRouter = router({
  /**
   * List all roles
   */
  list: requirePermission('role:read:all').query(async ({ ctx }) => {
    const allRoles = await ctx.db.query.roles.findMany({
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
      orderBy: (roles, { asc }) => [asc(roles.level)],
    });

    return {
      roles: allRoles.map((role) => ({
        id: role.id,
        name: role.name,
        label: role.label,
        description: role.description,
        level: role.level,
        permissions: role.rolePermissions.map((rp: any) => rp.permission.name),
        createdAt: role.createdAt,
      })),
    };
  }),

  /**
   * Get role by ID
   */
  getById: requirePermission('role:read:all')
    .input(z.object({ roleId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const role = await ctx.db.query.roles.findFirst({
        where: eq(roles.id, input.roleId),
        with: {
          rolePermissions: {
            with: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        });
      }

      return {
        id: role.id,
        name: role.name,
        label: role.label,
        description: role.description,
        level: role.level,
        permissions: role.rolePermissions.map((rp: any) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          resource: rp.permission.resource,
          action: rp.permission.action,
          scope: rp.permission.scope,
        })),
        createdAt: role.createdAt,
      };
    }),

  /**
   * Assign role to user (admin only)
   */
  assignToUser: requirePermission('role:assign:all')
    .input(
      z.object({
        userId: z.string().uuid(),
        roleId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if role exists
      const role = await ctx.db.query.roles.findFirst({
        where: eq(roles.id, input.roleId),
      });

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        });
      }

      // Check if user already has this role
      const existingUserRole = await ctx.db.query.userRoles.findFirst({
        where: and(eq(userRoles.userId, input.userId), eq(userRoles.roleId, input.roleId)),
      });

      if (existingUserRole) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already has this role',
        });
      }

      // Assign role
      await ctx.db.insert(userRoles).values({
        userId: input.userId,
        roleId: input.roleId,
      });

      return {
        success: true,
        message: 'Role assigned successfully',
      };
    }),

  /**
   * Remove role from user (admin only)
   */
  removeFromUser: requirePermission('role:assign:all')
    .input(
      z.object({
        userId: z.string().uuid(),
        roleId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = await ctx.db.query.userRoles.findFirst({
        where: and(eq(userRoles.userId, input.userId), eq(userRoles.roleId, input.roleId)),
      });

      if (!userRole) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User does not have this role',
        });
      }

      await ctx.db
        .delete(userRoles)
        .where(and(eq(userRoles.userId, input.userId), eq(userRoles.roleId, input.roleId)));

      return {
        success: true,
        message: 'Role removed successfully',
      };
    }),

  /**
   * Get user roles
   */
  getUserRoles: requirePermission('role:read:all')
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userRolesData = await ctx.db.query.userRoles.findMany({
        where: eq(userRoles.userId, input.userId),
        with: {
          role: true,
        },
      });

      return {
        roles: userRolesData.map((ur: any) => ({
          id: ur.role.id,
          name: ur.role.name,
          label: ur.role.label,
          level: ur.role.level,
          assignedAt: ur.assignedAt,
        })),
      };
    }),
});
