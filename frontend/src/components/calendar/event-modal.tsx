/**
 * Event Modal Component
 *
 * Sheet component for adding/editing calendar events
 * Shared form for both Add and Update modes
 */

'use client'

import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DateTimePickerSimple } from '@/components/ui/date-time-picker-simple'
import { Trash2, X, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface EventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: any | null
  defaultDate: Date | null
  onSave: (data: any) => void
  onDelete: () => void
  isLoading?: boolean
}

const EVENT_LABELS = [
  { value: 'Business', label: 'Business', color: 'bg-[#7367f0]' },
  { value: 'Personal', label: 'Personal', color: 'bg-red-500' },
  { value: 'Family', label: 'Family', color: 'bg-yellow-500' },
  { value: 'Holiday', label: 'Holiday', color: 'bg-green-500' },
  { value: 'ETC', label: 'ETC', color: 'bg-blue-500' },
]

export function EventModal({
  open,
  onOpenChange,
  event,
  defaultDate,
  onSave,
  onDelete,
  isLoading = false,
}: EventModalProps) {
  const isUpdateMode = !!event?.id

  // Form state
  const [title, setTitle] = useState('')
  const [label, setLabel] = useState('Business')
  const [startDateTime, setStartDateTime] = useState<Date | null>(null)
  const [endDateTime, setEndDateTime] = useState<Date | null>(null)
  const [allDay, setAllDay] = useState(false)
  const [url, setUrl] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [guestsInput, setGuestsInput] = useState('')
  const [guests, setGuests] = useState<string[]>([])

  // Initialize form with event data or default date
  useEffect(() => {
    if (event) {
      setTitle(event.title || '')
      setLabel(event.label || 'Business')
      setAllDay(event.allDay || false)
      setUrl(event.url || '')
      setLocation(event.location || '')
      setDescription(event.description || '')
      setGuests(event.guests || [])

      if (event.start) {
        setStartDateTime(new Date(event.start))
      }

      if (event.end) {
        setEndDateTime(new Date(event.end))
      }
    } else if (defaultDate) {
      // Set default times (9 AM to 10 AM)
      const start = new Date(defaultDate)
      start.setHours(9, 0, 0, 0)
      const end = new Date(defaultDate)
      end.setHours(10, 0, 0, 0)

      setStartDateTime(start)
      setEndDateTime(end)
      setTitle('')
      setLabel('Business')
      setAllDay(false)
      setUrl('')
      setLocation('')
      setDescription('')
      setGuests([])
    }
  }, [event, defaultDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !startDateTime || !endDateTime) {
      return
    }

    const eventData = {
      title: title.trim(),
      label,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      allDay,
      url: url.trim() || undefined,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      guests: guests.length > 0 ? guests : undefined,
    }

    onSave(eventData)
  }

  const handleAddGuest = () => {
    const email = guestsInput.trim()
    if (email && !guests.includes(email)) {
      setGuests([...guests, email])
      setGuestsInput('')
    }
  }

  const handleRemoveGuest = (email: string) => {
    setGuests(guests.filter((g) => g !== email))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddGuest()
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[540px] p-0 bg-white dark:bg-[#2f3349] border-gray-200 dark:border-[#44485e]"
      >
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-gray-200 dark:border-[#44485e]">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isUpdateMode ? 'Update Event' : 'Add Event'}
                </SheetTitle>
                <SheetDescription className="text-sm text-gray-600 dark:text-[#acabc1] mt-1">
                  {isUpdateMode ? 'Update your event details' : 'Create a new event on your calendar'}
                </SheetDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-900 dark:text-white">
                Title *
              </Label>
              <Input
                id="title"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white dark:bg-[#2f3349]"
                required
                disabled={isLoading}
              />
            </div>

            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label" className="text-sm font-medium text-gray-900 dark:text-white">
                Label
              </Label>
              <Select value={label} onValueChange={setLabel} disabled={isLoading}>
                <SelectTrigger className="bg-white dark:bg-[#2f3349]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_LABELS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        {item.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date & Time */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Start Date {!allDay && '& Time'}
              </Label>
              <DateTimePickerSimple
                value={startDateTime}
                onChange={setStartDateTime}
                enableTime={!allDay}
                placeholder={allDay ? 'Select start date' : 'Select start date & time'}
                disabled={isLoading}
              />
            </div>

            {/* End Date & Time */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                End Date {!allDay && '& Time'}
              </Label>
              <DateTimePickerSimple
                value={endDateTime}
                onChange={setEndDateTime}
                enableTime={!allDay}
                placeholder={allDay ? 'Select end date' : 'Select end date & time'}
                minDate={startDateTime || undefined}
                disabled={isLoading}
              />
            </div>

            {/* All Day */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-[#44485e] bg-gray-50 dark:bg-[#25293c]">
              <div className="flex-1">
                <Label htmlFor="allDay" className="text-sm font-medium text-gray-900 dark:text-white">
                  All Day Event
                </Label>
                <p className="text-xs text-gray-500 dark:text-[#acabc1] mt-1">
                  Event lasts the entire day
                </p>
              </div>
              <Switch
                id="allDay"
                checked={allDay}
                onCheckedChange={setAllDay}
                disabled={isLoading}
              />
            </div>

            {/* Event URL */}
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium text-gray-900 dark:text-white">
                Event URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-white dark:bg-[#2f3349]"
                disabled={isLoading}
              />
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <Label htmlFor="guests" className="text-sm font-medium text-gray-900 dark:text-white">
                Guests
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="guests"
                  type="email"
                  placeholder="guest@example.com"
                  value={guestsInput}
                  onChange={(e) => setGuestsInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-white dark:bg-[#2f3349]"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddGuest}
                  disabled={isLoading}
                >
                  Add
                </Button>
              </div>
              {guests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {guests.map((guest) => (
                    <div
                      key={guest}
                      className="inline-flex items-center gap-1 bg-gray-100 dark:bg-[#44485e] rounded px-2 py-1 text-sm"
                    >
                      {guest}
                      <button
                        type="button"
                        onClick={() => handleRemoveGuest(guest)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-900 dark:text-white">
                Location
              </Label>
              <Input
                id="location"
                placeholder="Event Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-white dark:bg-[#2f3349]"
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-900 dark:text-white">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Event Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="bg-white dark:bg-[#2f3349] resize-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-[#44485e] bg-gray-50 dark:bg-[#25293c]">
            <div className="flex items-center justify-between gap-3">
              <div>
                {isUpdateMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onDelete}
                    disabled={isLoading}
                    className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#7367f0] hover:bg-[#6658d3] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUpdateMode ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>{isUpdateMode ? 'Update Event' : 'Add Event'}</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
