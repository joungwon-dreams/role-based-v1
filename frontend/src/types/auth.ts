/**
 * Authentication & Authorization TypeScript Types
 * 인증 및 권한 관련 TypeScript 타입
 */

/**
 * Role levels (0-4)
 * 역할 레벨
 */
export enum RoleLevel {
  GUEST = 0,
  USER = 1,
  PREMIUM = 2,
  ADMIN = 3,
  SUPER_ADMIN = 4,
}

/**
 * Role names
 * 역할 이름
 */
export type RoleName = 'guest' | 'user' | 'premium_user' | 'admin' | 'super_admin'

/**
 * Role interface
 * 역할 인터페이스
 */
export interface Role {
  id: string
  name: RoleName
  displayNameEn: string
  displayNameKr: string
  level: RoleLevel
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * Permission interface
 * 권한 인터페이스
 */
export interface Permission {
  id: string
  name: string // e.g., 'dashboard:view:own', 'user:manage:all'
  displayNameEn: string
  displayNameKr: string
  category: string
  description?: string
  createdAt: string
}

/**
 * User profile interface
 * 사용자 프로필 인터페이스
 */
export interface UserProfile {
  id: string
  userId: string
  firstName?: string
  lastName?: string
  displayName?: string
  bio?: string
  avatarUrl?: string
  coverUrl?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  location?: string
  website?: string
  socialLinks?: Record<string, string>
  preferences?: Record<string, any>
  createdAt: string
  updatedAt: string
}

/**
 * User interface
 * 사용자 인터페이스
 */
export interface User {
  id: string
  email: string
  emailVerified: boolean
  emailVerifiedAt?: string
  isActive: boolean
  isSuspended: boolean
  suspensionReason?: string
  lastLoginAt?: string
  lastLoginIp?: string
  createdAt: string
  updatedAt: string

  // Relations
  role: Role
  permissions: string[] // Array of permission names
  profile?: UserProfile
}

/**
 * Auth state interface
 * 인증 상태 인터페이스
 */
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Login credentials
 * 로그인 자격 증명
 */
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Register data
 * 회원가입 데이터
 */
export interface RegisterData {
  email: string
  password: string
  passwordConfirm: string
  firstName?: string
  lastName?: string
  acceptTerms: boolean
}

/**
 * Auth response
 * 인증 응답
 */
export interface AuthResponse {
  user: User
  accessToken?: string
  refreshToken?: string
}

/**
 * Password reset request
 * 비밀번호 재설정 요청
 */
export interface PasswordResetRequest {
  email: string
}

/**
 * Password reset confirmation
 * 비밀번호 재설정 확인
 */
export interface PasswordResetConfirm {
  token: string
  password: string
  passwordConfirm: string
}
