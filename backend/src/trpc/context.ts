import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { db } from '../db';
import { verifyToken, type JWTPayload } from '../utils/jwt';

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  let user: JWTPayload | null = null;

  // Try to extract token from HttpOnly cookie first
  const cookieToken = req.cookies.accessToken;

  // Fallback to Authorization header for backward compatibility
  const authHeader = req.headers.authorization;
  const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

  if (token) {
    try {
      user = verifyToken(token);
    } catch (error) {
      // Token is invalid or expired, user remains null
      req.log.debug('Invalid or expired token');
    }
  }

  return {
    db,
    user,
    req,
    res,
    headers: req.headers,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
