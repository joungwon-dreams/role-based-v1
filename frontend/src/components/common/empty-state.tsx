/**
 * EmptyState Component
 * 빈 상태 컴포넌트
 *
 * Displays empty state with optional action button.
 * 선택적 액션 버튼과 함께 빈 상태를 표시합니다.
 */

'use client'

import { ReactNode } from 'react'
import { FileX, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon = FileX,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-12', className)}>
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  )
}
