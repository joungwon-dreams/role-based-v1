---
created: 2025-10-15 09:19:32
updated: 2025-10-15 09:19:32
tags: [calendar, fullcalendar, vuexy, crud, trpc]
author: wonny
status: complete
---

# Calendar Page Implementation

A fully functional calendar page built with FullCalendar, matching Vuexy design system.

## Overview

The Calendar page provides a comprehensive event management interface with:
- FullCalendar integration with multiple views (Month, Week, Day, List)
- Left sidebar with inline calendar and event filters
- Event CRUD operations via tRPC
- Color-coded event labels (Business, Personal, Family, Holiday, ETC)
- Drag & drop event rescheduling
- Sheet modal for add/edit events
- Responsive design with dark mode support

## File Structure

```
frontend/src/
├── app/
│   ├── (protected)/
│   │   └── calendar/
│   │       └── page.tsx                 # Main calendar page
│   └── globals.css                      # Updated with FullCalendar imports
├── components/
│   └── calendar/
│       ├── index.ts                     # Component exports
│       ├── event-modal.tsx              # Add/Edit event modal
│       ├── event-filters.tsx            # Event label filters
│       └── inline-calendar.tsx          # Mini calendar widget
└── styles/
    └── calendar.css                     # FullCalendar custom styles

backend/src/
└── trpc/
    └── routers/
        └── calendar.router.ts           # Calendar tRPC router (already exists)
```

## Features

### 1. FullCalendar Views

**Month View** (dayGridMonth)
- Default view
- Shows events across the month
- Click empty date to add event
- Click existing event to edit

**Week View** (timeGridWeek)
- Shows week with time slots
- Drag & drop to reschedule
- Time-based event display

**Day View** (timeGridDay)
- Single day with hourly slots
- Detailed event view

**List View** (listWeek)
- Event list format
- Grouped by date
- Compact display

### 2. Left Sidebar

**Add Event Button**
- Opens modal in add mode
- Default date: today

**Inline Calendar**
- Mini calendar widget
- Click date to navigate main calendar
- Built with date-fns (no external dependencies)
- Shows current month with navigation
- Today and selected date highlighting

**Event Filters**
- Checkbox filters for each label
- Toggle event visibility by type
- Color indicators matching event labels

### 3. Event Modal (Sheet Component)

**Shared Form** for Add/Update modes

**Form Fields:**
- **Title** (required) - Event name
- **Label** - Select: Business, Personal, Family, Holiday, ETC
- **Start Date & Time** - Date + time inputs (or date only if all-day)
- **End Date & Time** - Date + time inputs (or date only if all-day)
- **All Day** - Switch toggle
- **Event URL** - Optional URL input
- **Guests** - Multi-input tags (add email addresses)
- **Location** - Optional location text
- **Description** - Textarea for details

**Buttons:**
- **Add/Update** - Primary action (changes based on mode)
- **Cancel** - Close modal
- **Delete** - Only visible in Update mode

### 4. Event Colors by Label

```css
Business  → Purple (#7367f0)
Personal  → Red (#ef4444)
Family    → Yellow (#eab308)
Holiday   → Green (#22c55e)
ETC       → Blue (#3b82f6)
```

### 5. tRPC Operations

**Query:**
```typescript
trpc.calendar.list.useQuery()
// Returns: Array of events in FullCalendar format
```

**Mutations:**
```typescript
trpc.calendar.create.useMutation()
trpc.calendar.update.useMutation()
trpc.calendar.delete.useMutation()
```

**Event Data Structure:**
```typescript
{
  id: string
  title: string
  start: Date | string
  end: Date | string
  allDay: boolean
  extendedProps: {
    label: 'Business' | 'Personal' | 'Family' | 'Holiday' | 'ETC'
    description?: string
    location?: string
    url?: string
    guests?: string[]
  }
  classNames: ['event-business'] // CSS class for color
}
```

## User Interactions

### Adding an Event

1. Click "Add Event" button in sidebar, OR
2. Click empty date on calendar
3. Modal opens with form
4. Fill in details
5. Click "Add" button
6. Event created via tRPC mutation
7. Calendar refreshes automatically

### Editing an Event

1. Click existing event on calendar
2. Modal opens with pre-filled data
3. Modify fields
4. Click "Update" button
5. Event updated via tRPC mutation
6. Calendar refreshes automatically

### Deleting an Event

1. Click existing event to open modal
2. Click "Delete" button
3. Event deleted via tRPC mutation
4. Calendar refreshes automatically

### Rescheduling (Drag & Drop)

1. Drag event to new date/time
2. Drop event
3. Update mutation called automatically
4. Toast notification shows success/error

### Filtering Events

1. Use checkboxes in sidebar
2. Uncheck a label to hide those events
3. Check to show again
4. Filters apply immediately to calendar

## Styling

### Vuexy Design System

- Card shadows: `box-shadow: 0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.12)`
- Primary color: `#7367f0` (Vuexy purple)
- Dark mode: `#2f3349` (card background)
- Border color (dark): `#44485e`

### FullCalendar Customization

All styles in `/src/styles/calendar.css`:
- Custom colors for day/week/list views
- Event styling with brand colors
- Dark mode support
- Today highlighting
- Hover states
- Scrollbar styling

### Responsive Design

- Sidebar: Full width on mobile, 260px on desktop
- Calendar: Responsive to container width
- Modal: Full screen on mobile, 24rem max-width on desktop
- Touch-friendly tap targets

## Error Handling

**Loading States:**
- Show during data fetch
- Disable buttons during mutations

**Error Messages:**
- Toast notifications using sonner
- Success messages on CRUD operations
- Error messages with details

**Validation:**
- Title required
- Date validation (end after start)
- URL format validation (optional)
- Email format for guests (optional)

## Accessibility

**Keyboard Navigation:**
- Tab through all form fields
- Enter to submit form
- Escape to close modal

**Screen Readers:**
- Semantic HTML structure
- ARIA labels on buttons
- Form field labels
- Error announcements

**Color Contrast:**
- WCAG AA compliant
- Event text on colored backgrounds
- Dark mode support

## Performance

**Optimizations:**
- React.useCallback for event handlers
- Minimal re-renders
- Efficient event filtering
- Date-fns for lightweight date manipulation

**Bundle Size:**
- FullCalendar plugins loaded on-demand
- Tree-shaking enabled
- CSS split by feature

## Backend Requirements

The backend calendar router (`/backend/src/trpc/routers/calendar.router.ts`) provides:

1. **Protected procedures** - User authentication required
2. **Database schema** - `calendarEvents` table with:
   - userId (foreign key)
   - title, startTime, endTime
   - isAllDay, label
   - description, location, url
   - guests (JSON array)
3. **CRUD operations** - create, list, update, delete
4. **Row-level security** - Users only access their own events

## Testing

### Manual Testing Checklist

- [ ] Add event with all fields
- [ ] Add all-day event
- [ ] Edit event
- [ ] Delete event
- [ ] Drag & drop to reschedule
- [ ] Filter events by label
- [ ] Navigate between views
- [ ] Navigate between months
- [ ] Click inline calendar dates
- [ ] Test on mobile viewport
- [ ] Test dark mode
- [ ] Test error states (network failure)
- [ ] Test validation (required fields)

### Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari: iOS 14+
- Chrome Android: Latest

## Known Limitations

1. **No recurring events** - Each event is standalone
2. **No event conflicts** - Multiple events can overlap
3. **No timezone support** - Uses browser local time
4. **No event reminders** - No notification system
5. **No event sharing** - No collaboration features

## Future Enhancements

1. **Recurring events** - Daily, weekly, monthly patterns
2. **Event categories** - Beyond the 5 labels
3. **Calendar sharing** - Share with other users
4. **Event reminders** - Email/push notifications
5. **Import/Export** - iCal, Google Calendar sync
6. **Team calendars** - View multiple users' calendars
7. **Event conflicts** - Warning when double-booking
8. **Timezone support** - Multi-timezone events
9. **Event templates** - Quick create from templates
10. **Attendance tracking** - RSVP for event guests

## Dependencies

```json
{
  "@fullcalendar/core": "^6.1.19",
  "@fullcalendar/daygrid": "^6.1.19",
  "@fullcalendar/interaction": "^6.1.19",
  "@fullcalendar/list": "^6.1.19",
  "@fullcalendar/react": "^6.1.19",
  "@fullcalendar/timegrid": "^6.1.19",
  "date-fns": "^4.1.0"
}
```

## Related Files

- Menu config: `/frontend/src/config/menu.config.ts` (line 140-163)
- Backend schema: `/backend/src/db/schema/index.ts` (calendarEvents table)
- Permissions: User level requires `calendar:view:own` permission

## Implementation Notes

1. **No flatpickr** - Built custom inline calendar with date-fns to avoid external dependency
2. **Sheet vs Dialog** - Using Sheet (side panel) matches Vuexy offcanvas design
3. **Guest management** - Simple email tags, not full user lookup
4. **Event validation** - Client-side + server-side validation
5. **Real-time updates** - Manual refetch after mutations (could add subscription later)

## References

- FullCalendar Docs: https://fullcalendar.io/docs
- Vuexy Design: Reference images in `/repo/vuexy-*.png`
- tRPC: https://trpc.io/docs
- shadcn/ui: https://ui.shadcn.com/docs
