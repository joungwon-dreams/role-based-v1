import { initTRPC, TRPCError } from '@trpc/server';
import { type Context } from './context';
import superjson from 'superjson';
import { getActiveSession, getUserAgent } from '../utils/session';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof Error ? error.cause.message : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication and validates session hijacking
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  // Session Hijacking Prevention: Validate User-Agent
  const refreshToken = ctx.req.cookies?.refreshToken;
  if (refreshToken) {
    const session = await getActiveSession(refreshToken);

    if (session) {
      const currentUserAgent = getUserAgent(ctx.headers as any);

      // Check if User-Agent matches the session's stored User-Agent
      if (session.userAgent && currentUserAgent && session.userAgent !== currentUserAgent) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Session hijacking detected: User-Agent mismatch',
        });
      }
    }
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Role-based procedure - requires specific role level
 */
export const requireRole = (minLevel: number) =>
  protectedProcedure.use(({ ctx, next }) => {
    // Get user's highest role level
    const userMaxLevel = Math.max(
      ...ctx.user.roles.map((roleName) => {
        const roleMap: Record<string, number> = {
          guest: 1,
          user: 2,
          premium: 3,
          admin: 4,
          superadmin: 5,
        };
        return roleMap[roleName] || 0;
      })
    );

    if (userMaxLevel < minLevel) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have sufficient permissions to access this resource',
      });
    }

    return next();
  });

/**
 * Permission-based procedure - requires specific permission
 */
export const requirePermission = (permission: string) =>
  protectedProcedure.use(({ ctx, next }) => {
    if (!ctx.user.permissions.includes(permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing required permission: ${permission}`,
      });
    }

    return next();
  });
