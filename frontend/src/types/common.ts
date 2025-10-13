/**
 * Common TypeScript Types
 * 공통 TypeScript 타입
 */

/**
 * API Response wrapper
 * API 응답 래퍼
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Pagination metadata
 * 페이지네이션 메타데이터
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * Paginated response
 * 페이지네이션된 응답
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/**
 * Sort direction
 * 정렬 방향
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Sort configuration
 * 정렬 설정
 */
export interface Sort {
  field: string
  direction: SortDirection
}

/**
 * Filter configuration
 * 필터 설정
 */
export interface Filter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'notIn'
  value: any
}

/**
 * Query parameters
 * 쿼리 파라미터
 */
export interface QueryParams {
  page?: number
  limit?: number
  sort?: Sort
  filters?: Filter[]
  search?: string
}

/**
 * Loading states
 * 로딩 상태
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

/**
 * Status type for entities
 * 엔티티 상태 타입
 */
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'archived'

/**
 * User role levels
 * 사용자 역할 레벨
 */
export type RoleLevel = 0 | 1 | 2 | 3 | 4

/**
 * Role names
 * 역할 이름
 */
export type RoleName = 'guest' | 'user' | 'premium_user' | 'admin' | 'super_admin'

/**
 * Locale type
 * 로케일 타입
 */
export type Locale = 'en' | 'kr'

/**
 * Theme type
 * 테마 타입
 */
export type Theme = 'light' | 'dark' | 'system'
