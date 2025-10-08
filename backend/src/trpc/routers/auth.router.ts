import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { users, accounts, userRoles, roles, permissions, rolePermissions } from '../../db/schema';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../utils/jwt';
import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';

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

      // Find user by email
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
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
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, account.password);
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Get user roles and permissions
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

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        roles: roleNames,
        permissions: permissionNames,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      return {
        success: true,
        accessToken,
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
        refreshToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const payload = verifyToken(input.refreshToken);

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

        return {
          success: true,
          accessToken,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
        });
      }
    }),

  /**
   * Sign out (client-side token removal)
   */
  signout: protectedProcedure.mutation(async () => {
    return {
      success: true,
      message: 'Signed out successfully',
    };
  }),
});
