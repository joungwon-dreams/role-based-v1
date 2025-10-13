/**
 * Mock User Data for Testing Role-Based Menu
 * 역할 기반 메뉴 테스트를 위한 Mock 사용자 데이터
 */

import type { User, Role, RoleLevel } from '@/types/auth'

// Mock roles
const mockRoles: Record<RoleLevel, Role> = {
  [RoleLevel.GUEST]: {
    id: '1',
    name: 'guest',
    displayNameEn: 'Guest',
    displayNameKr: '게스트',
    level: RoleLevel.GUEST,
    description: 'Non-authenticated user - no dashboard access',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  [RoleLevel.USER]: {
    id: '2',
    name: 'user',
    displayNameEn: 'User',
    displayNameKr: '사용자',
    level: RoleLevel.USER,
    description: 'Basic authenticated user with personal workspace',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  [RoleLevel.PREMIUM]: {
    id: '3',
    name: 'premium_user',
    displayNameEn: 'Premium User',
    displayNameKr: '프리미엄 사용자',
    level: RoleLevel.PREMIUM,
    description: 'Paid user with team and project features',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  [RoleLevel.ADMIN]: {
    id: '4',
    name: 'admin',
    displayNameEn: 'Admin',
    displayNameKr: '관리자',
    level: RoleLevel.ADMIN,
    description: 'Content and user manager',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  [RoleLevel.SUPER_ADMIN]: {
    id: '5',
    name: 'super_admin',
    displayNameEn: 'Super Admin',
    displayNameKr: '슈퍼 관리자',
    level: RoleLevel.SUPER_ADMIN,
    description: 'Full system administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}

// User level permissions
const userPermissions = [
  'dashboard:view:own',
  'profile:view:own',
  'profile:edit:own',
  'calendar:view:own',
  'calendar:create:own',
  'calendar:edit:own',
  'calendar:delete:own',
  'post:view:own',
  'post:create:own',
  'post:edit:own',
  'post:delete:own',
  'message:view:own',
  'message:send:own',
  'message:delete:own',
  'connection:view:own',
  'connection:create:own',
  'connection:manage:own',
  'notification:view:own',
]

// Premium user permissions (User + Team features)
const premiumPermissions = [
  ...userPermissions,
  'team:view:team',
  'team:create:own',
  'team:edit:team',
  'team:manage:team',
  'team:delete:team',
  'team_member:view:team',
  'team_member:invite:team',
  'team_member:manage:team',
  'team_member:remove:team',
  'project:view:team',
  'project:create:team',
  'project:edit:team',
  'project:delete:team',
  'analytics:view:team',
  'support:create:own',
]

// Admin permissions (Premium + Management)
const adminPermissions = [
  ...premiumPermissions,
  'landing_page:view:all',
  'landing_page:create:all',
  'landing_page:edit:all',
  'landing_page:delete:all',
  'post:view:all',
  'post:manage:all',
  'post:moderate:all',
  'media:view:all',
  'media:upload:all',
  'media:manage:all',
  'media:delete:all',
  'user:view:all',
  'user:create:all',
  'user:edit:all',
  'user:suspend:all',
  'user:delete:all',
  'user:manage:all',
  'activity:view:all',
  'activity:monitor:all',
  'report:view:all',
  'report:export:all',
]

// Super admin permissions (All permissions)
const superAdminPermissions = [
  ...adminPermissions,
  'system:manage:all',
  'system:configure:all',
  'database:view:all',
  'database:manage:all',
  'database:backup:all',
  'database:restore:all',
  'database:monitor:all',
  'security:view:all',
  'security:manage:all',
  'security:configure:all',
  'log:view:all',
  'log:export:all',
  'automation:view:all',
  'automation:manage:all',
  'role:view:all',
  'role:create:all',
  'role:edit:all',
  'role:delete:all',
  'role:manage:all',
  'permission:view:all',
  'permission:manage:all',
]

/**
 * Create mock user for testing
 * 테스트용 Mock 사용자 생성
 */
function createMockUser(roleLevel: RoleLevel, email: string, firstName: string): User {
  const role = mockRoles[roleLevel]
  let permissions: string[] = []

  switch (roleLevel) {
    case RoleLevel.GUEST:
      permissions = []
      break
    case RoleLevel.USER:
      permissions = userPermissions
      break
    case RoleLevel.PREMIUM:
      permissions = premiumPermissions
      break
    case RoleLevel.ADMIN:
      permissions = adminPermissions
      break
    case RoleLevel.SUPER_ADMIN:
      permissions = superAdminPermissions
      break
  }

  return {
    id: `user-${roleLevel}`,
    email,
    emailVerified: true,
    emailVerifiedAt: new Date().toISOString(),
    isActive: true,
    isSuspended: false,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    role,
    permissions,
    profile: {
      id: `profile-${roleLevel}`,
      userId: `user-${roleLevel}`,
      firstName,
      lastName: 'Test',
      displayName: `${firstName} Test`,
      bio: `Test ${role.displayNameEn} account`,
      avatarUrl: `https://ui-avatars.com/api/?name=${firstName}+Test&background=7367f0&color=fff`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * Mock users for each role level
 * 각 역할 레벨별 Mock 사용자
 */
export const mockUsers = {
  guest: createMockUser(RoleLevel.GUEST, 'guest@example.com', 'Guest'),
  user: createMockUser(RoleLevel.USER, 'user@example.com', 'John'),
  premium: createMockUser(RoleLevel.PREMIUM, 'premium@example.com', 'Jane'),
  admin: createMockUser(RoleLevel.ADMIN, 'admin@example.com', 'Alice'),
  superAdmin: createMockUser(RoleLevel.SUPER_ADMIN, 'superadmin@example.com', 'Bob'),
}

/**
 * Get mock user by role level
 * 역할 레벨로 Mock 사용자 가져오기
 */
export function getMockUserByLevel(level: RoleLevel): User | null {
  switch (level) {
    case RoleLevel.GUEST:
      return null // Guest has no user object
    case RoleLevel.USER:
      return mockUsers.user
    case RoleLevel.PREMIUM:
      return mockUsers.premium
    case RoleLevel.ADMIN:
      return mockUsers.admin
    case RoleLevel.SUPER_ADMIN:
      return mockUsers.superAdmin
    default:
      return null
  }
}
