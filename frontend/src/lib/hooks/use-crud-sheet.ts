/**
 * useCrudSheet Hook
 * CRUD Sheet 상태 관리를 위한 React Hook
 *
 * Manages state for create/edit sheet panels.
 * Create/Edit sheet 패널의 상태를 관리합니다.
 */

'use client'

import { useState } from 'react'

export interface UseCrudSheetReturn<T> {
  isOpen: boolean
  mode: 'create' | 'edit' | null
  selectedItem: T | null
  openCreate: () => void
  openEdit: (item: T) => void
  close: () => void
  reset: () => void
}

export function useCrudSheet<T = any>(): UseCrudSheetReturn<T> {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit' | null>(null)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)

  const openCreate = () => {
    setMode('create')
    setSelectedItem(null)
    setIsOpen(true)
  }

  const openEdit = (item: T) => {
    setMode('edit')
    setSelectedItem(item)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
  }

  const reset = () => {
    setIsOpen(false)
    setMode(null)
    setSelectedItem(null)
  }

  return {
    isOpen,
    mode,
    selectedItem,
    openCreate,
    openEdit,
    close,
    reset,
  }
}
