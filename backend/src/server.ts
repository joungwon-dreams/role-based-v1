import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from './trpc/routers';
import { createContext } from './trpc/context';
import { serverConfig, cookieConfig } from './config/app.config';

export async function createServer() {
  const server = Fastify({
    logger: {
      level: serverConfig.env === 'production' ? 'info' : 'debug',
      transport: serverConfig.env === 'development' ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      } : undefined,
    },
    routerOptions: {
      maxParamLength: 5000,
    },
  });

  // Register helmet for security headers
  await server.register(helmet, {
    contentSecurityPolicy: serverConfig.env === 'production' ? undefined : false,
  });

  // Register cookie plugin for HttpOnly cookies
  await server.register(cookie, {
    secret: cookieConfig.secret,
    parseOptions: {},
  });

  // Register CORS
  await server.register(cors, {
    origin: serverConfig.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Register rate limiting
  await server.register(rateLimit, {
    max: serverConfig.rateLimitMax,
    timeWindow: serverConfig.rateLimitWindow,
  });

  // Register tRPC at /trpc endpoint
  await server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }: { path?: string; error: any }) {
        (server.log as any).error(`Error in tRPC handler on path '${path}':`, error);
      },
    },
  });

  // Also register tRPC at /api/trpc for compatibility
  await server.register(fastifyTRPCPlugin, {
    prefix: '/api/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }: { path?: string; error: any }) {
        (server.log as any).error(`Error in tRPC handler on path '${path}':`, error);
      },
    },
  });

  // Health check endpoint
  server.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  return server;
}
