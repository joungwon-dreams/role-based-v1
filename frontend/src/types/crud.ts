/**
 * CRUD Related TypeScript Types
 * CRUD 관련 TypeScript 타입
 */

/**
 * CRUD operation modes
 * CRUD 작업 모드
 */
export type CrudMode = 'create' | 'edit' | 'view' | null

/**
 * CRUD operation type
 * CRUD 작업 타입
 */
export type CrudOperation = 'create' | 'read' | 'update' | 'delete'

/**
 * CRUD action callbacks
 * CRUD 액션 콜백
 */
export interface CrudCallbacks<T> {
  onCreate?: (data: T) => Promise<void> | void
  onUpdate?: (id: string, data: T) => Promise<void> | void
  onDelete?: (id: string) => Promise<void> | void
  onView?: (id: string) => Promise<void> | void
}

/**
 * CRUD sheet state
 * CRUD sheet 상태
 */
export interface CrudSheetState<T> {
  isOpen: boolean
  mode: CrudMode
  selectedItem: T | null
}

/**
 * Delete confirmation state
 * 삭제 확인 상태
 */
export interface DeleteConfirmState<T> {
  isOpen: boolean
  selectedItem: T | null
}

/**
 * Form state
 * 폼 상태
 */
export interface FormState {
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  errors: Record<string, string>
}

/**
 * CRUD response
 * CRUD 응답
 */
export interface CrudResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Bulk operation result
 * 대량 작업 결과
 */
export interface BulkOperationResult {
  total: number
  succeeded: number
  failed: number
  errors?: Array<{ id: string; error: string }>
}
