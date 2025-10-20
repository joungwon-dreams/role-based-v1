/**
 * Team Calendar tRPC Router
 *
 * Team calendar event management
 * Only handles team events (scope='team')
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../../trpc';
import { calendarEvents, teamMembers, users, teams } from '../../../db/schema/index';
import { eq, and, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// Event labels matching Vuexy design
const eventLabelSchema = z.enum(['Business', 'Personal', 'Family', 'Holiday', 'ETC']);

const teamCalendarEventSchema = z.object({
  teamId: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  start: z.string().or(z.date()),
  end: z.string().or(z.date()),
  allDay: z.boolean().default(false),
  label: eventLabelSchema.default('Business'),
  description: z.string().optional(),
  location: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  guests: z.array(z.string()).optional().default([]),
  visibility: z.enum(['team', 'public']).default('team'),
});

/**
 * Helper function to check if user is team member
 */
async function checkTeamMembership(db: any, teamId: string, userId: string): Promise<boolean> {
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

  return !!membership;
}

export const teamCalendarRouter = router({
  /**
   * Get all calendar events for a specific team
   */
  list: protectedProcedure.input(z.object({ teamId: z.string().uuid() })).query(async ({ ctx, input }) => {
    // Check if user is team member
    const isMember = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
    if (!isMember) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      });
    }

    const events = await ctx.db
      .select({
        event: calendarEvents,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        team: {
          id: teams.id,
          name: teams.name,
        },
      })
      .from(calendarEvents)
      .leftJoin(users, eq(calendarEvents.createdBy, users.id))
      .leftJoin(teams, eq(calendarEvents.teamId, teams.id))
      .where(and(eq(calendarEvents.teamId, input.teamId), eq(calendarEvents.scope, 'team')))
      .orderBy(calendarEvents.startTime);

    // Transform to FullCalendar format
    return events.map(({ event, creator, team }) => ({
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
        visibility: event.visibility,
        createdBy: creator?.name || null,
        createdByEmail: creator?.email || null,
        teamName: team?.name || null,
      },
      classNames: [`event-${(event.label || 'business').toLowerCase()}`, 'team-event'],
    }));
  }),

  /**
   * Create a new team calendar event
   */
  create: protectedProcedure.input(teamCalendarEventSchema).mutation(async ({ ctx, input }) => {
    // Check if user is team member
    const isMember = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
    if (!isMember) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      });
    }

    const [newEvent] = await ctx.db
      .insert(calendarEvents)
      .values({
        // Team-specific fields
        teamId: input.teamId,
        scope: 'team',
        visibility: input.visibility,
        createdBy: ctx.user.userId,
        userId: ctx.user.userId, // Still set userId for compatibility
        // Event details
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
        visibility: newEvent.visibility,
      },
      classNames: [`event-${(newEvent.label || 'business').toLowerCase()}`, 'team-event'],
    };
  }),

  /**
   * Update a team calendar event
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        teamId: z.string().uuid(),
        data: teamCalendarEventSchema.omit({ teamId: true }).partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is team member
      const isMember = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this team',
        });
      }

      // Check if event exists and is a team event for this team
      const [existingEvent] = await ctx.db
        .select()
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.id, input.id),
            eq(calendarEvents.teamId, input.teamId),
            eq(calendarEvents.scope, 'team')
          )
        );

      if (!existingEvent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found or not a team event',
        });
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
      if (input.data.visibility !== undefined) updateData.visibility = input.data.visibility;

      const [updatedEvent] = await ctx.db
        .update(calendarEvents)
        .set(updateData)
        .where(
          and(
            eq(calendarEvents.id, input.id),
            eq(calendarEvents.teamId, input.teamId),
            eq(calendarEvents.scope, 'team')
          )
        )
        .returning();

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
          visibility: updatedEvent.visibility,
        },
        classNames: [`event-${(updatedEvent.label || 'business').toLowerCase()}`, 'team-event'],
      };
    }),

  /**
   * Delete a team calendar event
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        teamId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is team member
      const isMember = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this team',
        });
      }

      // Check if event exists and is a team event for this team
      const [existingEvent] = await ctx.db
        .select()
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.id, input.id),
            eq(calendarEvents.teamId, input.teamId),
            eq(calendarEvents.scope, 'team')
          )
        );

      if (!existingEvent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found or not a team event',
        });
      }

      await ctx.db
        .delete(calendarEvents)
        .where(
          and(
            eq(calendarEvents.id, input.id),
            eq(calendarEvents.teamId, input.teamId),
            eq(calendarEvents.scope, 'team')
          )
        );

      return { success: true, id: input.id };
    }),

  /**
   * Get unified calendar events (personal + team events for a specific team)
   * Useful for displaying a combined calendar view
   */
  unified: protectedProcedure.input(z.object({ teamId: z.string().uuid() })).query(async ({ ctx, input }) => {
    // Check if user is team member
    const isMember = await checkTeamMembership(ctx.db, input.teamId, ctx.user.userId);
    if (!isMember) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      });
    }

    // Get both personal and team events
    const events = await ctx.db
      .select({
        event: calendarEvents,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(calendarEvents)
      .leftJoin(users, eq(calendarEvents.createdBy, users.id))
      .where(
        and(
          // Personal events owned by user OR team events for this team
          eq(calendarEvents.userId, ctx.user.userId)
        )
      )
      .orderBy(calendarEvents.startTime);

    // Filter to get personal + specific team events
    const filteredEvents = events.filter((item) => {
      const event = item.event;
      return (
        (event.scope === 'personal' && event.userId === ctx.user.userId) ||
        (event.scope === 'team' && event.teamId === input.teamId)
      );
    });

    // Transform to FullCalendar format
    return filteredEvents.map(({ event, creator }) => ({
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
        visibility: event.visibility,
        scope: event.scope,
        teamId: event.teamId,
        createdBy: creator?.name || null,
        createdByEmail: creator?.email || null,
      },
      classNames: [
        `event-${(event.label || 'business').toLowerCase()}`,
        event.scope === 'team' ? 'team-event' : 'personal-event',
      ],
    }));
  }),
});
