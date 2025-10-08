import { z } from 'zod';
import { router, requirePermission } from '../trpc';
import { permissions } from '../../db/schema';

export const permissionRouter = router({
  /**
   * List all permissions
   */
  list: requirePermission('permission:read:all').query(async ({ ctx }) => {
    const allPermissions = await ctx.db.query.permissions.findMany({
      orderBy: (permissions, { asc }) => [asc(permissions.resource), asc(permissions.action)],
    });

    return {
      permissions: allPermissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        scope: permission.scope,
        description: permission.description,
        createdAt: permission.createdAt,
      })),
    };
  }),

  /**
   * List permissions by resource
   */
  listByResource: requirePermission('permission:read:all')
    .input(z.object({ resource: z.string() }))
    .query(async ({ ctx, input }) => {
      const resourcePermissions = await ctx.db.query.permissions.findMany({
        where: (permissions, { eq }) => eq(permissions.resource, input.resource),
        orderBy: (permissions, { asc }) => [asc(permissions.action)],
      });

      return {
        permissions: resourcePermissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          resource: permission.resource,
          action: permission.action,
          scope: permission.scope,
          description: permission.description,
        })),
      };
    }),

  /**
   * Get permission by ID
   */
  getById: requirePermission('permission:read:all')
    .input(z.object({ permissionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const permission = await ctx.db.query.permissions.findFirst({
        where: (permissions, { eq }) => eq(permissions.id, input.permissionId),
      });

      if (!permission) {
        return null;
      }

      return {
        id: permission.id,
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        scope: permission.scope,
        description: permission.description,
        createdAt: permission.createdAt,
      };
    }),

  /**
   * Get grouped permissions (grouped by resource)
   */
  grouped: requirePermission('permission:read:all').query(async ({ ctx }) => {
    const allPermissions = await ctx.db.query.permissions.findMany({
      orderBy: (permissions, { asc }) => [asc(permissions.resource), asc(permissions.action)],
    });

    // Group by resource
    const grouped = allPermissions.reduce(
      (acc, permission) => {
        if (!acc[permission.resource]) {
          acc[permission.resource] = [];
        }
        acc[permission.resource].push({
          id: permission.id,
          name: permission.name,
          action: permission.action,
          scope: permission.scope,
          description: permission.description,
        });
        return acc;
      },
      {} as Record<string, any[]>
    );

    return { grouped };
  }),
});
