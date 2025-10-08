import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../src/trpc/routers';
import { db } from '../../src/db';
import { verifyToken } from '../../src/utils/jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Convert VercelRequest to Fetch API Request
  const url = new URL(req.url || '', `http://${req.headers.host}`);

  const fetchRequest = new Request(url.toString(), {
    method: req.method,
    headers: new Headers(req.headers as Record<string, string>),
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
  });

  const response: globalThis.Response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req: fetchRequest,
    router: appRouter,
    createContext: async () => {
      const authHeader = req.headers.authorization;
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
        req: null,
        res: null,
      };
    },
  });

  // Convert Fetch API Response to VercelResponse
  const body = await response.text();
  res.status(response.status);

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  return res.send(body);
}
