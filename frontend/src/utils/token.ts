/**
 * JWT Token utility functions
 */

interface DecodedToken {
  exp: number;
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  type: 'access' | 'refresh';
}

/**
 * Decode JWT token without verification
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload as DecodedToken;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired or will expire soon
 * @param token - JWT token
 * @param bufferSeconds - Consider token expired if it expires within this buffer (default: 60 seconds)
 */
export function isTokenExpired(token: string | null, bufferSeconds: number = 60): boolean {
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const bufferTime = bufferSeconds * 1000;

  return currentTime >= expirationTime - bufferTime;
}

/**
 * Get time until token expires (in seconds)
 */
export function getTokenExpirationTime(token: string | null): number | null {
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;

  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const timeUntilExpiration = Math.floor((expirationTime - currentTime) / 1000);

  return timeUntilExpiration > 0 ? timeUntilExpiration : 0;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<{ accessToken: string } | null> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken || isTokenExpired(refreshToken)) {
      console.warn('Refresh token is missing or expired');
      return null;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trpc/auth.refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (!response.ok) {
      console.error('Failed to refresh token:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.result?.data?.accessToken) {
      const newAccessToken = data.result.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);
      return { accessToken: newAccessToken };
    }

    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}
