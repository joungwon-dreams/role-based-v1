/**
 * usePermissions Hook
 * 권한 체크를 위한 React Hook
 *
 * Provides permission checking functionality.
 * 권한 체크 기능을 제공합니다.
 */

'use client'

import { useAuthStore } from '@/store/auth-store'
import { useMemo } from 'react'

export function usePermissions() {
  const { user } = useAuthStore()

  const permissions = useMemo(() => {
    return user?.permissions || []
  }, [user?.permissions])

  const roleLevel = useMemo(() => {
    return user?.role?.level || 0
  }, [user?.role?.level])

  /**
   * Check if user has specific permission
   * 사용자가 특정 권한을 가지고 있는지 확인
   */
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  /**
   * Check if user has any of the specified permissions
   * 사용자가 지정된 권한 중 하나라도 가지고 있는지 확인
   */
  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some((permission) => permissions.includes(permission))
  }

  /**
   * Check if user has all of the specified permissions
   * 사용자가 지정된 모든 권한을 가지고 있는지 확인
   */
  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every((permission) => permissions.includes(permission))
  }

  /**
   * Check if user's role level is at least the specified level
   * 사용자의 역할 레벨이 최소 지정된 레벨 이상인지 확인
   */
  const hasRoleLevel = (minLevel: number): boolean => {
    return roleLevel >= minLevel
  }

  /**
   * Check if user is guest
   * 사용자가 게스트인지 확인
   */
  const isGuest = (): boolean => {
    return roleLevel === 0
  }

  /**
   * Check if user is authenticated (not guest)
   * 사용자가 인증되었는지 확인 (게스트가 아님)
   */
  const isAuthenticated = (): boolean => {
    return roleLevel > 0
  }

  /**
   * Check if user is at least User level
   * 사용자가 최소 User 레벨인지 확인
   */
  const isUser = (): boolean => {
    return roleLevel >= 1
  }

  /**
   * Check if user is at least Premium level
   * 사용자가 최소 Premium 레벨인지 확인
   */
  const isPremium = (): boolean => {
    return roleLevel >= 2
  }

  /**
   * Check if user is at least Admin level
   * 사용자가 최소 Admin 레벨인지 확인
   */
  const isAdmin = (): boolean => {
    return roleLevel >= 3
  }

  /**
   * Check if user is Super Admin
   * 사용자가 Super Admin인지 확인
   */
  const isSuperAdmin = (): boolean => {
    return roleLevel >= 4
  }

  return {
    permissions,
    roleLevel,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRoleLevel,
    isGuest,
    isAuthenticated,
    isUser,
    isPremium,
    isAdmin,
    isSuperAdmin,
  }
}
