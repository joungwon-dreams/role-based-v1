import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../src/trpc/routers';
import { createContext } from '../../src/trpc/context';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: async () => {
      // Extract Authorization header
      const authHeader = request.headers.get('authorization');
      let user = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const { verifyToken } = await import('../../src/utils/jwt');
          user = verifyToken(token);
        } catch (error) {
          // Token is invalid or expired
        }
      }

      const { db } = await import('../../src/db');

      return {
        db,
        user,
        req: request,
        res: null,
      };
    },
  });
}
