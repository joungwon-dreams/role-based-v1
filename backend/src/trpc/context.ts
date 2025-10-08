import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { db } from '../db';
import { verifyToken, type JWTPayload } from '../utils/jwt';

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  let user: JWTPayload | null = null;

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
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
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
