/**
 * Simple Calendar Component
 *
 * Inline calendar picker matching Vuexy design
 * Features:
 * - Month navigation (previous/next)
 * - Simple grid layout
 * - Date selection
 */

'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimpleCalendarProps {
  value?: Date | null
  onChange?: (date: Date) => void
  className?: string
  minDate?: Date
  maxDate?: Date
}

export function SimpleCalendar({ value, onChange, className, minDate, maxDate }: SimpleCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    return value ? new Date(value.getFullYear(), value.getMonth(), 1) : new Date()
  })

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    )
  }

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    )
  }

  const handleDateClick = (day: number) => {
    if (isDisabled(day)) return
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    if (onChange) {
      onChange(selectedDate)
    }
  }

  const isSelectedDate = (day: number) => {
    if (!value) return false
    return (
      value.getDate() === day &&
      value.getMonth() === currentMonth.getMonth() &&
      value.getFullYear() === currentMonth.getFullYear()
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    )
  }

  const isDisabled = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )

    if (minDate) {
      const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      if (dateOnly < minDateOnly) return true
    }

    if (maxDate) {
      const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      if (dateOnly > maxDateOnly) return true
    }

    return false
  }

  // Generate calendar grid
  const calendarDays = []

  // Empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-8" />)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const disabled = isDisabled(day)
    calendarDays.push(
      <button
        key={day}
        type="button"
        onClick={() => handleDateClick(day)}
        disabled={disabled}
        className={cn(
          'h-8 w-8 rounded text-sm transition-colors',
          disabled
            ? 'opacity-30 cursor-not-allowed text-gray-400 dark:text-gray-600'
            : 'hover:bg-gray-100 dark:hover:bg-[#44485e]',
          isSelectedDate(day) &&
            !disabled &&
            'bg-[#7367f0] text-white hover:bg-[#6658d3]',
          isToday(day) &&
            !isSelectedDate(day) &&
            !disabled &&
            'border border-[#7367f0] text-[#7367f0]',
          !isSelectedDate(day) &&
            !isToday(day) &&
            !disabled &&
            'text-gray-700 dark:text-gray-300'
        )}
      >
        {day}
      </button>
    )
  }

  return (
    <div className={cn('p-4', className)}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-[#44485e] rounded transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-gray-900 dark:text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-[#44485e] rounded transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">{calendarDays}</div>
    </div>
  )
}
