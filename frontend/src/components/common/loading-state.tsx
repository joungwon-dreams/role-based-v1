/**
 * LoadingState Component
 * 로딩 상태 컴포넌트
 *
 * Displays loading state with spinner.
 * 스피너와 함께 로딩 상태를 표시합니다.
 */

'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({ message, className, size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-8', className)}>
      <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses[size])} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
