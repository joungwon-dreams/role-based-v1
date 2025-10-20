import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { users, accounts, userRoles, roles, permissions, rolePermissions, auditLogs } from '../../db/schema';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../utils/jwt';
import { loginRateLimiter, signupRateLimiter } from '../../utils/rate-limiter';
import { createSession, updateSessionActivity, invalidateSession, getClientIp, getUserAgent } from '../../utils/session';
import { generateCsrfToken } from '../../utils/csrf';
import { TRPCError } from '@trpc/server';
import { eq, and, inArray } from 'drizzle-orm';

export const authRouter = router({
  /**
   * Sign up with email and password
   */
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters')
          .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
          .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
          .regex(/[0-9]/, 'Password must contain at least one number'),
        name: z.string().min(2, 'Name must be at least 2 characters'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password, name } = input;

      // Rate limiting check
      if (signupRateLimiter.isRateLimited(email)) {
        const resetTime = signupRateLimiter.getResetTime(email);
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Too many signup attempts. Please try again in ${Math.ceil(resetTime / 60)} minutes.`,
        });
      }

      // Record signup attempt
      signupRateLimiter.recordAttempt(email);

      // Check if user already exists
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const [newUser] = await ctx.db
        .insert(users)
        .values({
          email,
          name,
          emailVerified: new Date(), // Auto-verify for now
        })
        .returning();

      // Create account
      await ctx.db.insert(accounts).values({
        userId: newUser.id,
        type: 'credentials',
        provider: 'email',
        providerAccountId: email,
        password: hashedPassword,
      });

      // Assign default 'user' role
      const userRole = await ctx.db.query.roles.findFirst({
        where: eq(roles.name, 'user'),
      });

      if (userRole) {
        await ctx.db.insert(userRoles).values({
          userId: newUser.id,
          roleId: userRole.id,
        });
      }

      return {
        success: true,
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      };
    }),

  /**
   * Sign in with email and password
   */
  signin: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;

      // Get client info for audit logging
      const ipAddress = getClientIp(ctx.headers as any);
      const userAgent = getUserAgent(ctx.headers as any);

      // Rate limiting check
      if (loginRateLimiter.isRateLimited(email)) {
        const resetTime = loginRateLimiter.getResetTime(email);
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Too many login attempts. Please try again in ${Math.ceil(resetTime / 60)} minutes.`,
        });
      }

      // Record login attempt
      loginRateLimiter.recordAttempt(email);

      // Find user by email
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        // Record failed signin attempt - user not found
        await ctx.db.insert(auditLogs).values({
          userId: null, // No user ID since user doesn't exist
          action: 'SIGNIN_FAILURE',
          tableName: 'users',
          recordId: null,
          oldValues: null,
          newValues: { email, reason: 'user_not_found' },
          ipAddress,
          userAgent,
        });

        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Find user's account
      const account = await ctx.db.query.accounts.findFirst({
        where: and(eq(accounts.userId, user.id), eq(accounts.provider, 'email')),
      });

      if (!account || !account.password) {
        // Record failed signin attempt - no account
        await ctx.db.insert(auditLogs).values({
          userId: user.id,
          action: 'SIGNIN_FAILURE',
          tableName: 'users',
          recordId: user.id,
          oldValues: null,
          newValues: { email, reason: 'no_account' },
          ipAddress,
          userAgent,
        });

        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, account.password);
      if (!isValidPassword) {
        // Record failed signin attempt - invalid password
        await ctx.db.insert(auditLogs).values({
          userId: user.id,
          action: 'SIGNIN_FAILURE',
          tableName: 'users',
          recordId: user.id,
          oldValues: null,
          newValues: { email, reason: 'invalid_password' },
          ipAddress,
          userAgent,
        });

        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Record successful signin attempt
      await ctx.db.insert(auditLogs).values({
        userId: user.id,
        action: 'SIGNIN_SUCCESS',
        tableName: 'users',
        recordId: user.id,
        oldValues: null,
        newValues: { email },
        ipAddress,
        userAgent,
      });

      // Get user roles and permissions using separate queries
      const userRolesData = await ctx.db.query.userRoles.findMany({
        where: eq(userRoles.userId, user.id),
      });

      const roleIds = userRolesData.map(ur => ur.roleId);

      // Get roles
      const rolesData = await ctx.db.query.roles.findMany({
        where: inArray(roles.id, roleIds),
      });

      // Get role permissions
      const rolePermissionsData = await ctx.db.query.rolePermissions.findMany({
        where: inArray(rolePermissions.roleId, roleIds),
      });

      const permissionIds = rolePermissionsData.map(rp => rp.permissionId);

      // Get permissions
      const permissionsData = await ctx.db.query.permissions.findMany({
        where: inArray(permissions.id, permissionIds),
      });

      const roleNames = rolesData.map(r => r.name);
      const permissionNames = permissionsData.map(p => p.name);

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        roles: roleNames,
        permissions: permissionNames,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);
      const csrfToken = generateCsrfToken();

      // Create session for real-time tracking
      await createSession({
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        ipAddress,
        userAgent,
      });

      // Set HttpOnly cookies for XSS protection
      ctx.res.setCookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // lax for dev cross-origin
        maxAge: 15 * 60, // 15 minutes in seconds
        path: '/',
      });

      ctx.res.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // lax for dev cross-origin
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        path: '/',
      });

      // Set CSRF token in cookie (Double Submit Cookie pattern)
      ctx.res.setCookie('csrfToken', csrfToken, {
        httpOnly: false, // Must be readable by JavaScript for header submission
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // lax for dev cross-origin
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        path: '/',
      });

      return {
        success: true,
        csrfToken, // Send CSRF token to client
        accessToken, // Also send tokens for localStorage fallback (development)
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: roleNames,
          permissions: permissionNames,
        },
      };
    }),

  /**
   * Get current user info
   */
  me: protectedProcedure.query(async ({ ctx }) => {
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
      roles: ctx.user.roles,
      permissions: ctx.user.permissions,
      createdAt: user.createdAt,
    };
  }),

  /**
   * Refresh access token using refresh token
   */
  refresh: publicProcedure
    .input(
      z.object({
        refreshToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Try to get refreshToken from cookie first, then fall back to input
      const refreshToken = ctx.req.cookies.refreshToken || input.refreshToken;

      if (!refreshToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Refresh token not provided',
        });
      }
      try {
        const payload = verifyToken(refreshToken);

        if (payload.type !== 'refresh') {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid token type',
          });
        }

        // Verify user still exists
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, payload.userId),
        });

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not found',
          });
        }

        // Get updated roles and permissions
        const userRolesData = await ctx.db.query.userRoles.findMany({
          where: eq(userRoles.userId, user.id),
          with: {
            role: {
              with: {
                rolePermissions: {
                  with: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

        const roleNames = userRolesData.map((ur: any) => ur.role.name);
        const permissionSet = new Set<string>();

        userRolesData.forEach((ur: any) => {
          ur.role.rolePermissions.forEach((rp: any) => {
            permissionSet.add(rp.permission.name);
          });
        });

        const permissionNames = Array.from(permissionSet);

        // Generate new access token
        const tokenPayload = {
          userId: user.id,
          email: user.email,
          roles: roleNames,
          permissions: permissionNames,
        };

        const accessToken = generateAccessToken(tokenPayload);

        // Refresh Token Rotation: Generate new refresh token
        const newRefreshToken = generateRefreshToken(tokenPayload);

        // Invalidate old session
        await invalidateSession(refreshToken);

        // Create new session with new refresh token
        const ipAddress = getClientIp(ctx.headers as any);
        const userAgent = getUserAgent(ctx.headers as any);

        await createSession({
          userId: user.id,
          refreshToken: newRefreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          ipAddress,
          userAgent,
        });

        // Set new accessToken in HttpOnly cookie
        ctx.res.setCookie('accessToken', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60, // 15 minutes in seconds
          path: '/',
        });

        // Set new refreshToken in HttpOnly cookie (Token Rotation)
        ctx.res.setCookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
          path: '/',
        });

        return {
          success: true,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
        });
      }
    }),

  /**
   * Sign out (invalidate session)
   */
  signout: protectedProcedure
    .input(
      z.object({
        refreshToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Try to get refreshToken from cookie first, then fall back to input
      const refreshToken = ctx.req.cookies.refreshToken || input.refreshToken;

      if (refreshToken) {
        // Invalidate session for security
        await invalidateSession(refreshToken);
      }

      // Clear HttpOnly cookies and CSRF token
      ctx.res.clearCookie('accessToken', { path: '/' });
      ctx.res.clearCookie('refreshToken', { path: '/' });
      ctx.res.clearCookie('csrfToken', { path: '/' });

      return {
        success: true,
        message: 'Signed out successfully',
      };
    }),

  /**
   * Get active sessions (Admin only)
   */
  getActiveSessions: protectedProcedure
    .query(async ({ ctx }) => {
      // Check admin permission
      if (!ctx.user.permissions.includes('users:read') && !ctx.user.roles.includes('admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view active sessions',
        });
      }

      const { getAllActiveSessions } = await import('../../utils/session');
      const activeSessions = await getAllActiveSessions();

      return {
        sessions: activeSessions.map(session => ({
          id: session.id,
          user: session.user,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          lastActivity: session.lastActivity,
          createdAt: session.createdAt,
        })),
        total: activeSessions.length,
      };
    }),
});
