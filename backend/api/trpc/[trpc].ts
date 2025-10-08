import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';
import { appRouter } from '../../src/trpc/routers';
import { db } from '../../src/db';
import { verifyToken } from '../../src/utils/jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fastify = Fastify();

  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/api/trpc',
    trpcOptions: {
      router: appRouter,
      createContext: async ({ req: fastifyReq }: any) => {
        const authHeader = req.headers.authorization || fastifyReq.headers.authorization;
        let user = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          try {
            user = verifyToken(token);
          } catch (error) {
            // Token is invalid or expired
          }
        }

        return {
          db,
          user,
          req: fastifyReq,
          res: null,
        };
      },
    },
  });

  await fastify.ready();
  fastify.server.emit('request', req, res);
}
