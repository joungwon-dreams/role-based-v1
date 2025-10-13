/**
 * Table Related TypeScript Types
 * 테이블 관련 TypeScript 타입
 */

import { ColumnDef } from '@tanstack/react-table'

/**
 * Table column configuration
 * 테이블 컬럼 설정
 */
export interface TableColumn<T> extends ColumnDef<T> {
  accessorKey?: string
  header: string
  cell?: (props: { row: { original: T } }) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
}

/**
 * Table configuration
 * 테이블 설정
 */
export interface TableConfig<T> {
  columns: TableColumn<T>[]
  data: T[]
  pageSize?: number
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
  enableRowSelection?: boolean
  onRowClick?: (row: T) => void
  onRowSelect?: (rows: T[]) => void
}

/**
 * Table action
 * 테이블 액션
 */
export interface TableAction<T> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (row: T) => void
  variant?: 'default' | 'destructive' | 'ghost'
  show?: (row: T) => boolean
}

/**
 * Table bulk action
 * 테이블 대량 액션
 */
export interface TableBulkAction<T> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (rows: T[]) => void
  variant?: 'default' | 'destructive' | 'ghost'
  requireConfirm?: boolean
}

/**
 * Table filter
 * 테이블 필터
 */
export interface TableFilter {
  column: string
  label: string
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number'
  options?: Array<{ label: string; value: any }>
  placeholder?: string
}

/**
 * Table sort
 * 테이블 정렬
 */
export interface TableSort {
  column: string
  direction: 'asc' | 'desc'
}

/**
 * Table state
 * 테이블 상태
 */
export interface TableState {
  sorting: TableSort[]
  filtering: Record<string, any>
  pagination: {
    pageIndex: number
    pageSize: number
  }
  rowSelection: Record<string, boolean>
}
