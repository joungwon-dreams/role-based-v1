/**
 * ErrorState Component
 * 에러 상태 컴포넌트
 *
 * Displays error state with optional retry button.
 * 선택적 재시도 버튼과 함께 에러 상태를 표시합니다.
 */

'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorState({
  title = 'Error',
  message,
  onRetry,
  retryLabel = 'Try Again',
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-12', className)}>
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-destructive">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
