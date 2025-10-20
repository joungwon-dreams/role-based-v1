'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/types/trpc';
import superjson from 'superjson';
import { isTokenExpired, refreshAccessToken } from '@/utils/token';
import { toast } from 'sonner';

export const trpc = createTRPCReact<AppRouter>();

// Track ongoing token refresh to prevent multiple simultaneous refreshes
let refreshPromise: Promise<{ accessToken: string } | null> | null = null;

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL}/api/trpc`,
          fetchOptions: {
            credentials: 'include', // Enable cookies for cross-origin requests
          },
          async headers() {
            if (typeof window === 'undefined') {
              return {};
            }

            let token = localStorage.getItem('accessToken');

            // Check if token is expired or will expire soon (within 60 seconds)
            if (token && isTokenExpired(token, 60)) {
              console.log('🔄 Access token expired or expiring soon, refreshing...');

              // Use existing refresh promise if one is in progress
              if (!refreshPromise) {
                refreshPromise = refreshAccessToken().finally(() => {
                  refreshPromise = null;
                });
              }

              const result = await refreshPromise;

              if (result) {
                token = result.accessToken;
                console.log('✅ Token refreshed successfully');
              } else {
                console.warn('⚠️ Failed to refresh token, user needs to re-login');
                // Clear tokens if refresh failed
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                // Show toast message and redirect to signin
                toast.error('토큰이 만료되었습니다. 다시 로그인해주세요.', {
                  description: 'Token expired. Please login again.',
                });

                // Redirect to signin page after a short delay
                setTimeout(() => {
                  window.location.href = '/auth/signin';
                }, 1500);

                return {};
              }
            }

            return token ? { Authorization: `Bearer ${token}` } : {};
          },
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
