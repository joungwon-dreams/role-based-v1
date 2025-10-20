/**
 * Calendar Page - /calendar
 *
 * Full-featured calendar with FullCalendar integration
 * Based on Vuexy design system
 *
 * Features:
 * - FullCalendar with month/week/day/list views
 * - Left sidebar with inline calendar and filters
 * - Event CRUD operations via tRPC
 * - Color-coded event labels
 * - Drag & drop event rescheduling
 * - Sheet modal for add/edit events
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { Button } from '@/components/ui/button'
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'
import { EventModal } from '@/components/calendar/event-modal'
import { EventFilters } from '@/components/calendar/event-filters'
import { InlineCalendar } from '@/components/calendar/inline-calendar'
import type { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core'

export default function CalendarPage() {
  const calendarRef = useRef<FullCalendar>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([
    'Business',
    'Personal',
    'Family',
    'Holiday',
    'ETC',
  ])
  const [currentView, setCurrentView] = useState('dayGridMonth')
  const [selectedTeam, setSelectedTeam] = useState<string>('personal') // 'personal' or teamId

  // tRPC queries
  const { data: teams = [] } = trpc.team.teams.list.useQuery(undefined, {
    refetchOnMount: true,
  })

  // Fetch events based on selected team
  const { data: personalEvents = [], refetch: refetchPersonal } = trpc.calendar.list.useQuery(undefined, {
    enabled: selectedTeam === 'personal',
    refetchOnMount: true,
  })

  const { data: teamEvents = [], refetch: refetchTeam } = trpc.team.calendar.unified.useQuery(
    { teamId: selectedTeam },
    {
      enabled: selectedTeam !== 'personal',
      refetchOnMount: true,
    }
  )

  const events = selectedTeam === 'personal' ? personalEvents : teamEvents
  const refetch = selectedTeam === 'personal' ? refetchPersonal : refetchTeam

  const createMutation = trpc.calendar.create.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('Event created successfully')
      setIsModalOpen(false)
      setSelectedEvent(null)
      setSelectedDate(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create event')
    },
  })

  const updateMutation = trpc.calendar.update.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('Event updated successfully')
      setIsModalOpen(false)
      setSelectedEvent(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update event')
    },
  })

  const deleteMutation = trpc.calendar.delete.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('Event deleted successfully')
      setIsModalOpen(false)
      setSelectedEvent(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete event')
    },
  })

  // Filter events based on active filters
  const filteredEvents = events.filter((event) => {
    const label = event.extendedProps?.label || 'Business'
    return activeFilters.includes(label)
  })

  // Handle date click (add new event)
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo.start)
    setSelectedEvent(null)
    setIsModalOpen(true)
    selectInfo.view.calendar.unselect()
  }, [])

  // Handle event click (edit event)
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const event = clickInfo.event
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      ...event.extendedProps,
    })
    setIsModalOpen(true)
  }, [])

  // Handle event drop (drag & drop)
  const handleEventDrop = useCallback(
    (dropInfo: EventDropArg) => {
      const event = dropInfo.event
      updateMutation.mutate({
        id: event.id,
        data: {
          start: event.start!.toISOString(),
          end: event.end!.toISOString(),
          allDay: event.allDay,
        },
      })
    },
    [updateMutation]
  )

  // Handle save event
  const handleSaveEvent = useCallback(
    (data: any) => {
      if (selectedEvent?.id) {
        // Update existing event
        updateMutation.mutate({
          id: selectedEvent.id,
          data,
        })
      } else {
        // Create new event
        createMutation.mutate(data)
      }
    },
    [selectedEvent, createMutation, updateMutation]
  )

  // Handle delete event
  const handleDeleteEvent = useCallback(() => {
    if (selectedEvent?.id) {
      deleteMutation.mutate({ id: selectedEvent.id })
    }
  }, [selectedEvent, deleteMutation])

  // Handle calendar navigation
  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.prev()
  }

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.next()
  }

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.today()
  }

  const handleViewChange = (view: string) => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.changeView(view)
    setCurrentView(view)
  }

  // Handle inline calendar date click
  const handleInlineDateClick = (date: Date) => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.gotoDate(date)
  }

  return (
    <main className="pt-[5rem]">
      <div className="py-6">
        <div className="flex flex-wrap -mx-3">
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 xl:w-72 px-3 mb-6 lg:mb-0">
            <div
              className="rounded-lg bg-white dark:bg-[#2f3349] p-5 transition-colors sticky top-24"
              style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
            >
              {/* Add Event Button */}
              <Button
                onClick={() => {
                  setSelectedEvent(null)
                  setSelectedDate(new Date())
                  setIsModalOpen(true)
                }}
                className="w-full bg-[#7367f0] hover:bg-[#6658d3] text-white mb-5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>

              {/* Team/Scope Filter */}
              <div className="mb-5">
                <div className="flex items-center gap-2 px-1 mb-2">
                  <Users className="w-4 h-4 text-gray-500 dark:text-[#acabc1]" />
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Calendar Scope
                  </span>
                </div>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="w-full border-gray-300 dark:border-[#44485e] bg-white dark:bg-[#25293c] text-gray-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Personal Only</span>
                        <span className="text-xs text-gray-600 dark:text-[#acabc1]">
                          My personal events
                        </span>
                      </div>
                    </SelectItem>
                    {teams.filter((team) => team.isMember).map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{team.name}</span>
                          <span className="text-xs text-gray-600 dark:text-[#acabc1]">
                            Personal + Team events
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Inline Calendar */}
              <InlineCalendar onDateClick={handleInlineDateClick} />

              {/* Event Filters */}
              <EventFilters activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
            </div>
          </div>

          {/* Main Calendar Area */}
          <div className="flex-1 px-3">
            <div
              className="rounded-lg bg-white dark:bg-[#2f3349] p-6 transition-colors"
              style={{ boxShadow: '0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)' }}
            >
              {/* Calendar Header */}
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-2">
                  <Button onClick={handlePrev} variant="outline" size="sm">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleNext} variant="outline" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleToday} variant="outline" size="sm">
                    Today
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleViewChange('dayGridMonth')}
                    variant={currentView === 'dayGridMonth' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Month
                  </Button>
                  <Button
                    onClick={() => handleViewChange('timeGridWeek')}
                    variant={currentView === 'timeGridWeek' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Week
                  </Button>
                  <Button
                    onClick={() => handleViewChange('timeGridDay')}
                    variant={currentView === 'timeGridDay' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Day
                  </Button>
                  <Button
                    onClick={() => handleViewChange('listWeek')}
                    variant={currentView === 'listWeek' ? 'default' : 'outline'}
                    size="sm"
                  >
                    List
                  </Button>
                </div>
              </div>

              {/* FullCalendar */}
              <div className="calendar-wrapper">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={false}
                  events={filteredEvents}
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  eventDrop={handleEventDrop}
                  height="auto"
                  displayEventTime={false}
                  eventClassNames={(arg) => {
                    const label = arg.event.extendedProps?.label || 'Business'
                    return [`event-${label.toLowerCase()}`]
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Event Modal */}
        <EventModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          event={selectedEvent}
          defaultDate={selectedDate}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          isLoading={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
        />
      </div>
    </main>
  )
}
