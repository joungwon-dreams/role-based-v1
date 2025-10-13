/**
 * FormSection Component
 * 폼 섹션 레이아웃 컴포넌트
 *
 * Provides consistent form section layout.
 * 일관된 폼 섹션 레이아웃을 제공합니다.
 */

'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
}
