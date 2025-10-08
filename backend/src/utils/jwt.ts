import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/app.config';

export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  type: 'access' | 'refresh';
}

/**
 * Generate access token (15 minutes)
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' } as any,
    jwtConfig.secret as any,
    { expiresIn: jwtConfig.accessExpiresIn } as any
  );
}

/**
 * Generate refresh token (30 days)
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' } as any,
    jwtConfig.secret as any,
    { expiresIn: jwtConfig.refreshExpiresIn } as any
  );
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, jwtConfig.secret) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  const payload = decoded as any;
  if (!payload.exp) return true;

  return Date.now() >= payload.exp * 1000;
}
