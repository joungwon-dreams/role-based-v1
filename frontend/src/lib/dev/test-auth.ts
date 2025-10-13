/**
 * Dev-Only Authentication Test Utilities
 * 개발 전용 인증 테스트 유틸리티
 *
 * WARNING: This file should ONLY be used in development environment
 * 경고: 이 파일은 개발 환경에서만 사용해야 합니다
 */

import { authStore } from '@/store/auth.store'
import { mockUsers } from '@/lib/mock/users'
import { RoleLevel } from '@/types/auth'

/**
 * Set mock user by role level for testing
 * 테스트를 위해 역할 레벨별 mock 사용자 설정
 */
export function setTestUser(level: RoleLevel) {
  switch (level) {
    case RoleLevel.GUEST:
      authStore.clearAuth()
      break
    case RoleLevel.USER: {
      const user = mockUsers.user
      authStore.setUser({
        userId: user.id,
        email: user.email,
        name: user.profile?.displayName,
        roles: [user.role.name],
        permissions: user.permissions,
      })
      break
    }
    case RoleLevel.PREMIUM: {
      const user = mockUsers.premium
      authStore.setUser({
        userId: user.id,
        email: user.email,
        name: user.profile?.displayName,
        roles: [user.role.name],
        permissions: user.permissions,
      })
      break
    }
    case RoleLevel.ADMIN: {
      const user = mockUsers.admin
      authStore.setUser({
        userId: user.id,
        email: user.email,
        name: user.profile?.displayName,
        roles: [user.role.name],
        permissions: user.permissions,
      })
      break
    }
    case RoleLevel.SUPER_ADMIN: {
      const user = mockUsers.superAdmin
      authStore.setUser({
        userId: user.id,
        email: user.email,
        name: user.profile?.displayName,
        roles: [user.role.name],
        permissions: user.permissions,
      })
      break
    }
    default:
      console.error('Invalid role level:', level)
  }
}

/**
 * Set super admin user for testing
 * 테스트를 위해 슈퍼 관리자 사용자 설정
 */
export function setSuperAdminUser() {
  const user = mockUsers.superAdmin

  const authUser = {
    userId: user.id,
    email: 'superadmin@willydreams.com',
    name: 'Super Admin',
    roles: [user.role.name],
    permissions: user.permissions,
  }

  authStore.setUser(authUser)
  console.log('✅ Super Admin user set:', authUser.email)
  console.log('📋 Roles:', authUser.roles)
  console.log('🔑 Permissions:', authUser.permissions.length)
}

/**
 * Clear authentication (logout)
 * 인증 정보 제거 (로그아웃)
 */
export function clearTestAuth() {
  authStore.clearAuth()
  console.log('✅ Auth cleared')
}

/**
 * Get current user info
 * 현재 사용자 정보 가져오기
 */
export function getCurrentUser() {
  const { user } = authStore.getState()

  if (!user) {
    console.log('❌ No authenticated user')
    return null
  }

  console.log('✅ Current user:', user.email)
  console.log('📋 Roles:', user.roles)
  console.log('🔑 Permissions:', user.permissions.length)

  return user
}

// Expose to window for dev console access
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testAuth = {
    setSuperAdmin: setSuperAdminUser,
    setUser: setTestUser,
    clear: clearTestAuth,
    getCurrentUser: getCurrentUser,
    mockUsers,
  }
  console.log('🔧 Dev Auth Utils available: window.testAuth')
}
