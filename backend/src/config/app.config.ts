import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export const appConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
} as const;

export const jwtConfig = {
  secret: process.env.JWT_SECRET || '',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
} as const;

export const cookieConfig = {
  secret: process.env.COOKIE_SECRET || process.env.JWT_SECRET || '',
} as const;

export const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  },
  kakao: {
    clientId: process.env.KAKAO_CLIENT_ID || '',
    callbackUrl: process.env.KAKAO_CALLBACK_URL || '',
  },
  naver: {
    clientId: process.env.NAVER_CLIENT_ID || '',
    clientSecret: process.env.NAVER_CLIENT_SECRET || '',
    callbackUrl: process.env.NAVER_CALLBACK_URL || '',
  },
} as const;

export const serverConfig = {
  env: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  rateLimitWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
} as const;

// Validate required environment variables
if (!appConfig.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

if (!jwtConfig.secret) {
  throw new Error('JWT_SECRET is required');
}
