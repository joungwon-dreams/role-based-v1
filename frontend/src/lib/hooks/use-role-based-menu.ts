/**
 * Role-Based Menu Hook
 * Filter menu items based on user's role level and permissions
 *
 * 역할 기반 메뉴 훅
 * 사용자의 역할 레벨과 권한에 따라 메뉴 아이템 필터링
 */

import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { menuItems, filterMenuByRole, type MenuItem } from '@/config/menu.config'
import { RoleLevel } from '@/types/auth'

/**
 * Hook to get filtered menu items based on current user's role and permissions
 * 현재 사용자의 역할과 권한에 따라 필터링된 메뉴 아이템을 가져오는 훅
 *
 * @returns Filtered menu items / 필터링된 메뉴 아이템
 */
export function useRoleBasedMenu(): MenuItem[] {
  const { user } = useAuth()

  const filteredMenu = useMemo(() => {
    // Guest users (not authenticated) get no dashboard menu
    // 게스트 사용자(인증되지 않은 사용자)는 대시보드 메뉴 없음
    if (!user) {
      return []
    }

    // Map role name to RoleLevel
    const roleMap: Record<string, RoleLevel> = {
      'guest': RoleLevel.GUEST,
      'user': RoleLevel.USER,
      'premium_user': RoleLevel.PREMIUM,
      'admin': RoleLevel.ADMIN,
      'super_admin': RoleLevel.SUPER_ADMIN,
    }

    const roleName = user.roles?.[0] || 'guest'
    const roleLevel = roleMap[roleName] || RoleLevel.GUEST
    const permissions = user.permissions || []

    return filterMenuByRole(menuItems, roleLevel, permissions)
  }, [user])

  return filteredMenu
}
