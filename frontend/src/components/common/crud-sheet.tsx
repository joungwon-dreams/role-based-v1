/**
 * CrudSheet Component
 * 재사용 가능한 CRUD Sheet 컴포넌트
 *
 * Reusable sheet component for Create/Edit operations.
 * Create/Edit 작업을 위한 재사용 가능한 Sheet 컴포넌트입니다.
 */

'use client'

import { ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface CrudSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  onSave?: () => void
  onCancel?: () => void
  saveLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'full'
}

/**
 * Reusable CRUD Sheet component
 * - Slides from right to left
 * - Used for Create/Edit operations
 * - Consistent layout and behavior
 *
 * 재사용 가능한 CRUD Sheet 컴포넌트
 * - 우측에서 좌측으로 슬라이드
 * - Create/Edit 작업에 사용
 * - 일관된 레이아웃과 동작
 */
export function CrudSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSave,
  onCancel,
  saveLabel,
  cancelLabel,
  isLoading = false,
  size = 'default',
}: CrudSheetProps) {
  const { t } = useLocale()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn('flex flex-col', {
          'sm:max-w-md': size === 'default',
          'sm:max-w-sm': size === 'sm',
          'sm:max-w-lg': size === 'lg',
          'sm:max-w-xl': size === 'xl',
          'sm:max-w-full': size === 'full',
        })}
      >
        {/* Header */}
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto py-4">{children}</div>

        {/* Footer - Fixed at bottom */}
        <SheetFooter className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.()
              onOpenChange(false)
            }}
            disabled={isLoading}
          >
            {cancelLabel || t('common.cancel')}
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? t('common.loading') : saveLabel || t('common.save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
