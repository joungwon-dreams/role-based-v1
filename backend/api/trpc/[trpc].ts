import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { appRouter } from '../../src/trpc/routers';
import { db } from '../../src/db';
import { verifyToken } from '../../src/utils/jwt';

const handler = createHTTPHandler({
  router: appRouter,
  createContext: async ({ req }: any) => {
    const authHeader = req.headers['authorization'] || req.headers.get?.('authorization');
    let user = null;

    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
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
      req,
      res: null,
    };
  },
});

export default async function trpcHandler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Convert VercelRequest to Node.js IncomingMessage-like object
  const request = {
    method: req.method,
    headers: req.headers,
    body: req.body,
    url: req.url,
  };

  const response = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: '',
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      res.setHeader(name, value);
    },
    end(data: string) {
      this.body = data;
      res.status(this.statusCode).send(data);
    },
    writeHead(code: number, headers?: Record<string, string>) {
      this.statusCode = code;
      if (headers) {
        Object.entries(headers).forEach(([key, val]) => {
          this.setHeader(key, val);
        });
      }
    },
  };

  await handler(request as any, response as any);
}
