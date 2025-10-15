import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/types/trpc';
import superjson from 'superjson';

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_API_URL}/api/trpc`,
      // CRITICAL: Enable credentials to send HttpOnly cookies with cross-origin requests
      fetchOptions: {
        credentials: 'include',
      },
      async headers() {
        if (typeof window === 'undefined') {
          return {};
        }

        const headers: Record<string, string> = {};

        // Get accessToken from localStorage (fallback for cross-origin development)
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        // Get CSRF token from localStorage for Double Submit Cookie pattern
        const csrfToken = localStorage.getItem('csrfToken');
        if (csrfToken) {
          headers['X-CSRF-Token'] = csrfToken;
        }

        return headers;
      },
      transformer: superjson,
    }),
  ],
});
