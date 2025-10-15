/**
 * DateTimePicker with Simple Calendar
 *
 * Date-time picker using SimpleCalendar popup (matching Vuexy design)
 * Replaces Flatpickr with custom calendar
 *
 * Usage:
 * ```tsx
 * <DateTimePickerSimple
 *   value={date}
 *   onChange={setDate}
 *   enableTime={true}
 * />
 * ```
 */

'use client'

import * as React from 'react'
import { Calendar, Clock, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SimpleCalendar } from './simple-calendar'
import { format } from 'date-fns'
import { Input } from './input'
import { Button } from './button'

export interface DateTimePickerSimpleProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  enableTime?: boolean
  placeholder?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

export const DateTimePickerSimple = React.forwardRef<
  HTMLDivElement,
  DateTimePickerSimpleProps
>(
  (
    {
      value,
      onChange,
      enableTime = false,
      placeholder = 'Select date',
      className,
      disabled = false,
      minDate,
      maxDate,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [hours, setHours] = React.useState(value ? value.getHours() : 9)
    const [minutes, setMinutes] = React.useState(value ? value.getMinutes() : 0)
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useImperativeHandle(ref, () => containerRef.current!)

    // Close on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    const handleDateChange = (date: Date) => {
      if (enableTime) {
        date.setHours(hours)
        date.setMinutes(minutes)
      }
      if (onChange) {
        onChange(date)
      }
      if (!enableTime) {
        setIsOpen(false)
      }
    }

    const handleTimeChange = () => {
      if (value && onChange) {
        const newDate = new Date(value)
        newDate.setHours(hours)
        newDate.setMinutes(minutes)
        onChange(newDate)
      }
    }

    const handleClear = () => {
      if (onChange) {
        onChange(null)
      }
      setIsOpen(false)
    }

    const displayValue = value
      ? enableTime
        ? format(value, 'yyyy-MM-dd HH:mm')
        : format(value, 'yyyy-MM-dd')
      : ''

    return (
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Input
            value={displayValue}
            placeholder={placeholder}
            readOnly
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn('pr-20 cursor-pointer', className)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
            {enableTime ? (
              <>
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Clock className="h-4 w-4 text-muted-foreground" />
              </>
            ) : (
              <Calendar className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 pointer-events-auto"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-2 bg-white dark:bg-[#2f3349] rounded-lg shadow-lg border border-gray-200 dark:border-[#44485e]">
            <SimpleCalendar value={value} onChange={handleDateChange} minDate={minDate} maxDate={maxDate} />

            {enableTime && (
              <div className="border-t border-gray-200 dark:border-[#44485e] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Time
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={hours.toString().padStart(2, '0')}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
                      setHours(val)
                    }}
                    onBlur={handleTimeChange}
                    className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-[#44485e] rounded bg-transparent"
                  />
                  <span className="text-gray-500">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes.toString().padStart(2, '0')}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                      setMinutes(val)
                    }}
                    onBlur={handleTimeChange}
                    className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-[#44485e] rounded bg-transparent"
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="bg-[#7367f0] hover:bg-[#6658d3] text-white"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)

DateTimePickerSimple.displayName = 'DateTimePickerSimple'
