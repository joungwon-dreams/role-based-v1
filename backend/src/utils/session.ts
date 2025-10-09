/**
 * Session Management Utilities
 * - Secure session creation and tracking
 * - Real-time login monitoring
 * - IP address and User-Agent logging for security
 */

import { db } from '../db';
import { sessions } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';

export interface CreateSessionInput {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create a new session for user login
 */
export async function createSession(input: CreateSessionInput) {
  const [session] = await db
    .insert(sessions)
    .values({
      userId: input.userId,
      refreshToken: input.refreshToken,
      expiresAt: input.expiresAt,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      lastActivity: new Date(),
      isActive: true,
    })
    .returning();

  return session;
}

/**
 * Update session last activity (called on token refresh)
 */
export async function updateSessionActivity(refreshToken: string) {
  const [session] = await db
    .update(sessions)
    .set({
      lastActivity: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(sessions.refreshToken, refreshToken),
        eq(sessions.isActive, true)
      )
    )
    .returning();

  return session;
}

/**
 * Invalidate session (soft delete on signout)
 */
export async function invalidateSession(refreshToken: string) {
  const [session] = await db
    .update(sessions)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(sessions.refreshToken, refreshToken))
    .returning();

  return session;
}

/**
 * Get active session by refresh token
 */
export async function getActiveSession(refreshToken: string) {
  const session = await db.query.sessions.findFirst({
    where: and(
      eq(sessions.refreshToken, refreshToken),
      eq(sessions.isActive, true),
      gt(sessions.expiresAt, new Date())
    ),
    with: {
      user: {
        columns: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return session;
}

/**
 * Get all active sessions for a user
 */
export async function getUserActiveSessions(userId: string) {
  const userSessions = await db.query.sessions.findMany({
    where: and(
      eq(sessions.userId, userId),
      eq(sessions.isActive, true),
      gt(sessions.expiresAt, new Date())
    ),
    orderBy: (sessions, { desc }) => [desc(sessions.lastActivity)],
  });

  return userSessions;
}

/**
 * Get all currently active sessions (for admin)
 */
export async function getAllActiveSessions() {
  const activeSessions = await db.query.sessions.findMany({
    where: and(
      eq(sessions.isActive, true),
      gt(sessions.expiresAt, new Date())
    ),
    with: {
      user: {
        columns: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: (sessions, { desc }) => [desc(sessions.lastActivity)],
  });

  return activeSessions;
}

/**
 * Clean up expired sessions (called by cron job)
 */
export async function cleanupExpiredSessions() {
  const result = await db
    .update(sessions)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(sessions.isActive, true)
      )
    )
    .returning();

  return {
    cleanedCount: result.length,
    sessions: result,
  };
}

/**
 * Extract IP address from request headers
 * Handles Vercel/proxy forwarded IPs securely
 */
export function getClientIp(headers: any): string | undefined {
  // Support both Fastify headers (plain object) and Web API Headers
  const getHeader = (name: string) => {
    if (typeof headers.get === 'function') {
      return headers.get(name);
    }
    return headers[name];
  };

  // Vercel provides x-forwarded-for and x-real-ip
  const forwardedFor = getHeader('x-forwarded-for');
  const realIp = getHeader('x-real-ip');

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, first one is client
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return undefined;
}

/**
 * Extract User-Agent from request headers
 */
export function getUserAgent(headers: any): string | undefined {
  // Support both Fastify headers (plain object) and Web API Headers
  if (typeof headers.get === 'function') {
    return headers.get('user-agent') || undefined;
  }
  return headers['user-agent'] || undefined;
}
