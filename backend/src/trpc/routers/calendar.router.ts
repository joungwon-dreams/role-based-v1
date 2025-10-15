/**
 * Calendar Events tRPC Router
 *
 * CRUD operations for calendar events following Vuexy design
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { calendarEvents } from '../../db/schema/index';
import { eq, and } from 'drizzle-orm';

// Event labels matching Vuexy design
const eventLabelSchema = z.enum(['Business', 'Personal', 'Family', 'Holiday', 'ETC']);

const calendarEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  start: z.string().or(z.date()),
  end: z.string().or(z.date()),
  allDay: z.boolean().default(false),
  label: eventLabelSchema.default('Business'),
  description: z.string().optional(),
  location: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  guests: z.array(z.string()).optional().default([]),
});

export const calendarRouter = router({
  /**
   * Get all calendar events for the authenticated user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const events = await ctx.db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.userId, ctx.user.userId))
      .orderBy(calendarEvents.startTime);

    // Transform to FullCalendar format
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.startTime,
      end: event.endTime,
      allDay: event.isAllDay,
      extendedProps: {
        label: event.label || 'Business',
        description: event.description,
        location: event.location,
        url: event.url,
        guests: event.guests || [],
      },
      classNames: [`event-${(event.label || 'business').toLowerCase()}`],
    }));
  }),

  /**
   * Create a new calendar event
   */
  create: protectedProcedure.input(calendarEventSchema).mutation(async ({ ctx, input }) => {
    const [newEvent] = await ctx.db
      .insert(calendarEvents)
      .values({
        userId: ctx.user.userId,
        title: input.title,
        startTime: new Date(input.start),
        endTime: new Date(input.end),
        isAllDay: input.allDay,
        label: input.label,
        description: input.description,
        location: input.location,
        url: input.url || null,
        guests: input.guests || [],
      })
      .returning();

    // Return in FullCalendar format
    return {
      id: newEvent.id,
      title: newEvent.title,
      start: newEvent.startTime,
      end: newEvent.endTime,
      allDay: newEvent.isAllDay,
      extendedProps: {
        label: newEvent.label || 'Business',
        description: newEvent.description,
        location: newEvent.location,
        url: newEvent.url,
        guests: newEvent.guests || [],
      },
      classNames: [`event-${(newEvent.label || 'business').toLowerCase()}`],
    };
  }),

  /**
   * Update an existing calendar event
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: calendarEventSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if event exists and belongs to user
      const [existingEvent] = await ctx.db
        .select()
        .from(calendarEvents)
        .where(and(eq(calendarEvents.id, input.id), eq(calendarEvents.userId, ctx.user.userId)));

      if (!existingEvent) {
        throw new Error('Event not found');
      }

      // Prepare update object
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (input.data.title) updateData.title = input.data.title;
      if (input.data.start) updateData.startTime = new Date(input.data.start);
      if (input.data.end) updateData.endTime = new Date(input.data.end);
      if (input.data.allDay !== undefined) updateData.isAllDay = input.data.allDay;
      if (input.data.label) updateData.label = input.data.label;
      if (input.data.description !== undefined) updateData.description = input.data.description;
      if (input.data.location !== undefined) updateData.location = input.data.location;
      if (input.data.url !== undefined) updateData.url = input.data.url || null;
      if (input.data.guests !== undefined) updateData.guests = input.data.guests || [];

      const [updatedEvent] = await ctx.db
        .update(calendarEvents)
        .set(updateData)
        .where(and(eq(calendarEvents.id, input.id), eq(calendarEvents.userId, ctx.user.userId)))
        .returning();

      // Return in FullCalendar format
      return {
        id: updatedEvent.id,
        title: updatedEvent.title,
        start: updatedEvent.startTime,
        end: updatedEvent.endTime,
        allDay: updatedEvent.isAllDay,
        extendedProps: {
          label: updatedEvent.label || 'Business',
          description: updatedEvent.description,
          location: updatedEvent.location,
          url: updatedEvent.url,
          guests: updatedEvent.guests || [],
        },
        classNames: [`event-${(updatedEvent.label || 'business').toLowerCase()}`],
      };
    }),

  /**
   * Delete a calendar event
   */
  delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    // Check if event exists and belongs to user
    const [existingEvent] = await ctx.db
      .select()
      .from(calendarEvents)
      .where(and(eq(calendarEvents.id, input.id), eq(calendarEvents.userId, ctx.user.userId)));

    if (!existingEvent) {
      throw new Error('Event not found');
    }

    await ctx.db.delete(calendarEvents).where(and(eq(calendarEvents.id, input.id), eq(calendarEvents.userId, ctx.user.userId)));

    return { success: true, id: input.id };
  }),
});
