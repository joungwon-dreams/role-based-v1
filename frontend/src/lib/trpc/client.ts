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

        // Get CSRF token from localStorage for Double Submit Cookie pattern
        const csrfToken = localStorage.getItem('csrfToken');

        // Return CSRF token in custom header for backend validation
        return csrfToken ? { 'X-CSRF-Token': csrfToken } : {};
      },
      transformer: superjson,
    }),
  ],
});
