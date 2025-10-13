/**
 * DateTimeDisplay Component
 * 통일된 날짜/시간 표시 컴포넌트
 *
 * Displays date/time with consistent formatting and locale support.
 * 일관된 포맷팅과 로케일 지원으로 날짜/시간을 표시합니다.
 */

'use client'

import { useDateTime } from '@/lib/hooks/use-date-time'
import { cn } from '@/lib/utils'

interface DateTimeDisplayProps {
  date: Date | string
  type?: 'relative' | 'full' | 'date' | 'time' | 'custom'
  format?: string
  className?: string
  showTooltip?: boolean
}

export function DateTimeDisplay({
  date,
  type = 'relative',
  format,
  className,
  showTooltip = true,
}: DateTimeDisplayProps) {
  const dateTime = useDateTime()

  if (!date) return null

  if (!dateTime.isValid(date)) {
    return <span className={cn('text-muted-foreground', className)}>Invalid date</span>
  }

  const displayValue = () => {
    switch (type) {
      case 'relative':
        return dateTime.relative(date)
      case 'full':
        return dateTime.full(date)
      case 'date':
        return dateTime.date(date)
      case 'time':
        return dateTime.time(date)
      case 'custom':
        return format ? dateTime.custom(date, format) : dateTime.full(date)
      default:
        return dateTime.relative(date)
    }
  }

  if (showTooltip && type === 'relative') {
    return (
      <time
        dateTime={dateTime.toISO(typeof date === 'string' ? new Date(date) : date)}
        className={cn('cursor-help', className)}
        title={dateTime.full(date)}
      >
        {displayValue()}
      </time>
    )
  }

  return (
    <time
      dateTime={dateTime.toISO(typeof date === 'string' ? new Date(date) : date)}
      className={className}
    >
      {displayValue()}
    </time>
  )
}
