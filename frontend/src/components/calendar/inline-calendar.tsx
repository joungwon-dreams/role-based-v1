/**
 * Inline Calendar Component
 *
 * Mini calendar for the sidebar using native date picker styling
 */

'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns'

interface InlineCalendarProps {
  onDateClick: (date: Date) => void
}

export function InlineCalendar({ onDateClick }: InlineCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateClick(date)
  }

  return (
    <div className="mb-6 pb-5 border-b border-gray-200 dark:border-[#44485e]">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h6 className="text-sm font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h6>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevMonth}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday Headers */}
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = isSameDay(day, selectedDate)
          const isToday = isSameDay(day, new Date())

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => handleDateClick(day)}
              className={`
                aspect-square text-xs rounded-md transition-colors
                ${isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}
                ${isSelected ? 'bg-[#7367f0] text-white hover:bg-[#6658d3]' : ''}
                ${!isSelected && isToday ? 'bg-blue-100 dark:bg-blue-900/30 text-[#7367f0]' : ''}
                ${!isSelected && !isToday ? 'hover:bg-gray-100 dark:hover:bg-[#44485e]' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
