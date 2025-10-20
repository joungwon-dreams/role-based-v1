/**
 * Team Calendar View Component
 *
 * Reusable FullCalendar component for team calendars
 * Uses the same UI/logic as /calendar page but scoped to a specific team
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { Button } from '@/components/ui/button'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'
import { EventModal } from '@/components/calendar/event-modal'
import { EventFilters } from '@/components/calendar/event-filters'
import { InlineCalendar } from '@/components/calendar/inline-calendar'
import type { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core'

interface TeamCalendarViewProps {
  teamId: string
}

export function TeamCalendarView({ teamId }: TeamCalendarViewProps) {
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

  // Fetch team calendar events
  const { data: events = [], refetch } = trpc.team.calendar.list.useQuery(
    { teamId },
    {
      enabled: !!teamId,
      refetchOnMount: true,
    }
  )

  // Calendar event mutations for team
  const createMutation = trpc.team.calendar.create.useMutation({
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

  const updateMutation = trpc.team.calendar.update.useMutation({
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

  const deleteMutation = trpc.team.calendar.delete.useMutation({
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
        teamId,
        data: {
          start: event.start!.toISOString(),
          end: event.end!.toISOString(),
          allDay: event.allDay,
        },
      })
    },
    [updateMutation, teamId]
  )

  // Handle save event
  const handleSaveEvent = useCallback(
    (data: any) => {
      if (selectedEvent?.id) {
        // Update existing event
        updateMutation.mutate({
          id: selectedEvent.id,
          teamId,
          data,
        })
      } else {
        // Create new event
        createMutation.mutate({
          teamId,
          ...data,
        })
      }
    },
    [selectedEvent, createMutation, updateMutation, teamId]
  )

  // Handle delete event
  const handleDeleteEvent = useCallback(() => {
    if (selectedEvent?.id) {
      deleteMutation.mutate({
        id: selectedEvent.id,
        teamId,
      })
    }
  }, [selectedEvent, deleteMutation, teamId])

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
    <div className="flex flex-wrap -mx-3">
      {/* Left Sidebar */}
      <div className="w-full lg:w-64 xl:w-72 px-3 mb-6 lg:mb-0">
        <div
          className="rounded-lg bg-white dark:bg-[#2f3349] p-5 transition-colors"
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
              eventContent={(arg) => {
                const teamName = arg.event.extendedProps?.teamName
                const label = arg.event.extendedProps?.label
                return {
                  html: `
                    <div class="fc-event-main-frame">
                      <div class="fc-event-title-container">
                        <div class="fc-event-title fc-sticky">
                          ${teamName ? `<span class="text-xs opacity-75">[${teamName}]</span> ` : ''}${arg.event.title}
                        </div>
                      </div>
                    </div>
                  `
                }
              }}
            />
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
  )
}
