/**
 * DateTimePicker Component
 *
 * Modular date-time picker using Flatpickr (matching Vuexy design)
 * Supports both date-only and date-time modes
 *
 * Usage:
 * ```tsx
 * <DateTimePicker
 *   value={date}
 *   onChange={setDate}
 *   enableTime={true}
 *   placeholder="Select date and time"
 * />
 * ```
 */

'use client'

import * as React from 'react'
import Flatpickr from 'react-flatpickr'
import { Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'flatpickr/dist/themes/material_blue.css'

export interface DateTimePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  enableTime?: boolean
  dateFormat?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  mode?: 'single' | 'multiple' | 'range'
}

export const DateTimePicker = React.forwardRef<Flatpickr, DateTimePickerProps>(
  (
    {
      value,
      onChange,
      enableTime = false,
      dateFormat,
      placeholder = 'Select date',
      className,
      disabled = false,
      minDate,
      maxDate,
      mode = 'single',
    },
    ref
  ) => {
    const defaultDateFormat = enableTime ? 'Y-m-d H:i' : 'Y-m-d'

    return (
      <div className="relative">
        <Flatpickr
          ref={ref}
          value={value || undefined}
          onChange={(dates) => {
            if (onChange) {
              onChange(dates[0] || null)
            }
          }}
          options={{
            enableTime,
            dateFormat: dateFormat || defaultDateFormat,
            time_24hr: true,
            minDate,
            maxDate,
            mode,
            disableMobile: true, // Use flatpickr on mobile instead of native
          }}
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30',
            'border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs',
            'transition-[color,box-shadow] outline-none',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            'md:text-sm',
            className
          )}
          placeholder={placeholder}
          disabled={disabled}
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
      </div>
    )
  }
)

DateTimePicker.displayName = 'DateTimePicker'
