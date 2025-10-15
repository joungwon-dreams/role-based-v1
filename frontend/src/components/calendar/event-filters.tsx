/**
 * Event Filters Component
 *
 * Checkbox filters for event labels in the sidebar
 */

'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface EventFiltersProps {
  activeFilters: string[]
  setActiveFilters: (filters: string[]) => void
}

const FILTER_OPTIONS = [
  { value: 'Business', label: 'Business', color: 'bg-[#7367f0]' },
  { value: 'Personal', label: 'Personal', color: 'bg-red-500' },
  { value: 'Family', label: 'Family', color: 'bg-yellow-500' },
  { value: 'Holiday', label: 'Holiday', color: 'bg-green-500' },
  { value: 'ETC', label: 'ETC', color: 'bg-blue-500' },
]

export function EventFilters({ activeFilters, setActiveFilters }: EventFiltersProps) {
  const handleToggleFilter = (value: string) => {
    if (activeFilters.includes(value)) {
      setActiveFilters(activeFilters.filter((f) => f !== value))
    } else {
      setActiveFilters([...activeFilters, value])
    }
  }

  return (
    <div className="mt-6 pt-5 border-t border-gray-200 dark:border-[#44485e]">
      <h6 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-4">
        Event Filters
      </h6>
      <div className="space-y-3">
        {FILTER_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center gap-3">
            <Checkbox
              id={`filter-${option.value}`}
              checked={activeFilters.includes(option.value)}
              onCheckedChange={() => handleToggleFilter(option.value)}
            />
            <Label
              htmlFor={`filter-${option.value}`}
              className="flex items-center gap-2 text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300"
            >
              <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
