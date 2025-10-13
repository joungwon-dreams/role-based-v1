/**
 * Unified Toast Notification Utilities
 * 통일된 토스트 알림 유틸리티
 *
 * All toast notifications should use these utilities for consistency.
 * 모든 토스트 알림은 일관성을 위해 이 유틸리티를 사용해야 합니다.
 */

'use client'

import { toast as sonnerToast } from 'sonner'

/**
 * Unified toast notification utility
 * 통일된 토스트 알림 유틸리티
 */
export const toast = {
  /**
   * Success notification (green)
   * 성공 알림 (초록색)
   */
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description })
  },

  /**
   * Error notification (red)
   * 에러 알림 (빨간색)
   */
  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description })
  },

  /**
   * Warning notification (yellow)
   * 경고 알림 (노란색)
   */
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description })
  },

  /**
   * Info notification (blue)
   * 정보 알림 (파란색)
   */
  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description })
  },

  /**
   * Loading notification (spinner)
   * 로딩 알림 (스피너)
   */
  loading: (message: string) => {
    return sonnerToast.loading(message)
  },

  /**
   * Promise-based notification (automatic state management)
   * Promise 기반 알림 (자동 상태 관리)
   */
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, { loading, success, error })
  },

  /**
   * Dismiss a specific toast
   * 특정 토스트 제거
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId)
  }
}

/**
 * Standard CRUD toast messages
 * 표준 CRUD 토스트 메시지
 *
 * Usage:
 * const toasts = useCrudToasts('User')
 * toasts.created() // "User created successfully"
 */
export function useCrudToasts(entityName: string) {
  return {
    created: () => toast.success(`${entityName} created successfully`),
    updated: () => toast.success(`${entityName} updated successfully`),
    deleted: () => toast.success(`${entityName} deleted successfully`),
    createError: (error?: string) => toast.error(`Failed to create ${entityName}`, error),
    updateError: (error?: string) => toast.error(`Failed to update ${entityName}`, error),
    deleteError: (error?: string) => toast.error(`Failed to delete ${entityName}`, error),
  }
}

/**
 * Standard CRUD toast messages with i18n support
 * i18n 지원하는 표준 CRUD 토스트 메시지
 *
 * Usage:
 * const toasts = useCrudToastsI18n('User', t)
 * toasts.created() // Uses translation keys
 */
export function useCrudToastsI18n(
  entityName: string,
  t: (key: string, params?: Record<string, any>) => string
) {
  return {
    created: () => toast.success(t('common.toast.created', { entity: entityName })),
    updated: () => toast.success(t('common.toast.updated', { entity: entityName })),
    deleted: () => toast.success(t('common.toast.deleted', { entity: entityName })),
    createError: (error?: string) =>
      toast.error(t('common.toast.createError', { entity: entityName }), error),
    updateError: (error?: string) =>
      toast.error(t('common.toast.updateError', { entity: entityName }), error),
    deleteError: (error?: string) =>
      toast.error(t('common.toast.deleteError', { entity: entityName }), error),
  }
}
