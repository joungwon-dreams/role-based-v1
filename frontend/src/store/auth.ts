/**
 * Authentication Store
 * Zustand-based global authentication state management
 *
 * Zustand 기반 전역 인증 상태 관리
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Role, RoleLevel } from '@/types/auth'

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearAuth: () => void
  updateUser: (updates: Partial<User>) => void

  // Helpers
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  hasRoleLevel: (minLevel: RoleLevel) => boolean
  isGuest: () => boolean
  isUser: () => boolean
  isPremium: () => boolean
  isAdmin: () => boolean
  isSuperAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Set user and authentication status
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      // Set loading state
      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      // Set error message
      setError: (error) =>
        set({
          error,
          isLoading: false,
        }),

      // Clear all authentication data
      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),

      // Update user data
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // Check if user has a specific permission
      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false
        return user.permissions.includes(permission)
      },

      // Check if user has any of the specified permissions
      hasAnyPermission: (permissions) => {
        const { user } = get()
        if (!user) return false
        return permissions.some((p) => user.permissions.includes(p))
      },

      // Check if user has all of the specified permissions
      hasAllPermissions: (permissions) => {
        const { user } = get()
        if (!user) return false
        return permissions.every((p) => user.permissions.includes(p))
      },

      // Check if user has minimum role level
      hasRoleLevel: (minLevel) => {
        const { user } = get()
        if (!user) return false
        return user.role.level >= minLevel
      },

      // Role level checkers
      isGuest: () => {
        const { user } = get()
        return !user || user.role.level === RoleLevel.GUEST
      },

      isUser: () => {
        const { user } = get()
        return !!user && user.role.level >= RoleLevel.USER
      },

      isPremium: () => {
        const { user } = get()
        return !!user && user.role.level >= RoleLevel.PREMIUM
      },

      isAdmin: () => {
        const { user } = get()
        return !!user && user.role.level >= RoleLevel.ADMIN
      },

      isSuperAdmin: () => {
        const { user } = get()
        return !!user && user.role.level >= RoleLevel.SUPER_ADMIN
      },
    }),
    {
      name: 'auth-storage', // LocalStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user and isAuthenticated
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
