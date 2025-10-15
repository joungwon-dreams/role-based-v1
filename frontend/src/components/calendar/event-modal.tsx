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
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DateTimePickerSimple } from '@/components/ui/date-time-picker-simple'
import { Trash2, X } from 'lucide-react'
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto bg-white dark:bg-[#2f3349]"
      >
        <form onSubmit={handleSubmit}>
          <SheetHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <SheetTitle className="text-lg font-semibold">
              {isUpdateMode ? 'Update Event' : 'Add Event'}
            </SheetTitle>
          </SheetHeader>

          <div className="py-6 px-4 space-y-5">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Label */}
            <div>
              <Label htmlFor="label" className="text-sm font-medium mb-2 block">
                Label
              </Label>
              <Select value={label} onValueChange={setLabel}>
                <SelectTrigger>
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
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Start Date {!allDay && '& Time'}
              </Label>
              <DateTimePickerSimple
                value={startDateTime}
                onChange={setStartDateTime}
                enableTime={!allDay}
                placeholder={allDay ? 'Select start date' : 'Select start date & time'}
              />
            </div>

            {/* End Date & Time */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                End Date {!allDay && '& Time'}
              </Label>
              <DateTimePickerSimple
                value={endDateTime}
                onChange={setEndDateTime}
                enableTime={!allDay}
                placeholder={allDay ? 'Select end date' : 'Select end date & time'}
                minDate={startDateTime || undefined}
              />
            </div>

            {/* All Day */}
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="allDay" className="text-sm font-medium">
                All Day
              </Label>
              <Switch id="allDay" checked={allDay} onCheckedChange={setAllDay} />
            </div>

            {/* Event URL */}
            <div>
              <Label htmlFor="url" className="text-sm font-medium mb-2 block">
                Event URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            {/* Guests */}
            <div>
              <Label htmlFor="guests" className="text-sm font-medium mb-2 block">
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
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={handleAddGuest}>
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
            <div>
              <Label htmlFor="location" className="text-sm font-medium mb-2 block">
                Location
              </Label>
              <Input
                id="location"
                placeholder="Event Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Event Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <SheetFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 flex-1">
              <Button
                type="submit"
                className="flex-1 bg-[#7367f0] hover:bg-[#6658d3] text-white"
                disabled={isLoading}
              >
                {isUpdateMode ? 'Update' : 'Add'}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
            </div>
            {isUpdateMode && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
