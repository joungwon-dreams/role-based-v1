'use client';

import { useSyncExternalStore } from 'react';
import { authStore } from '@/store/auth.store';

export function useAuth() {
  const state = useSyncExternalStore(
    authStore.subscribe.bind(authStore),
    authStore.getState.bind(authStore),
    authStore.getState.bind(authStore)
  );

  // HttpOnly Cookies: Authentication status is based on user existence (not tokens)
  const isAuthenticated = !!state.user;

  // Update: No longer accepts tokens (they're in HttpOnly cookies)
  const login = (user: any) => {
    authStore.setUser(user);
  };

  const logout = () => {
    authStore.clearAuth();
  };

  const hasPermission = (permission: string) => {
    return state.user?.permissions.includes(permission) || false;
  };

  const hasRole = (role: string) => {
    return state.user?.roles.includes(role) || false;
  };

  return {
    isAuthenticated,
    user: state.user,
    login,
    logout,
    hasPermission,
    hasRole,
  };
}
