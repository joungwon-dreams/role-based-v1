/**
 * useDeleteConfirm Hook
 * 삭제 확인 다이얼로그 상태 관리를 위한 React Hook
 *
 * Manages state for delete confirmation dialogs.
 * 삭제 확인 다이얼로그의 상태를 관리합니다.
 */

'use client'

import { useState } from 'react'

export interface UseDeleteConfirmReturn<T> {
  isOpen: boolean
  selectedItem: T | null
  open: (item: T) => void
  close: () => void
  reset: () => void
}

export function useDeleteConfirm<T = any>(): UseDeleteConfirmReturn<T> {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)

  const open = (item: T) => {
    setSelectedItem(item)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
  }

  const reset = () => {
    setIsOpen(false)
    setSelectedItem(null)
  }

  return {
    isOpen,
    selectedItem,
    open,
    close,
    reset,
  }
}
