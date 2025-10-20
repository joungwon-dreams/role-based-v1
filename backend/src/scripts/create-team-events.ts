/**
 * Create Team Calendar Events
 *
 * Creates 5 team calendar events for testing
 */

import { db } from '../db';
import { users, teams, calendarEvents } from '../db/schema';
import { eq } from 'drizzle-orm';

async function createTeamEvents() {
  try {
    console.log('🗓️  Creating team calendar events...\n');

    // Get premium user
    const [premiumUser] = await db.select().from(users).where(eq(users.email, 'premium@willydreams.com'));
    if (!premiumUser) {
      console.error('❌ Premium user not found');
      process.exit(1);
    }
    console.log(`✅ Found premium user: ${premiumUser.email}\n`);

    // Get the team (assuming it was created earlier)
    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.ownerId, premiumUser.id))
      .limit(1);

    if (!team) {
      console.error('❌ No team found for premium user');
      process.exit(1);
    }
    console.log(`✅ Found team: ${team.name} (${team.id})\n`);

    // Create 5 team calendar events
    const teamEvents = [
      {
        title: 'Team Standup Meeting',
        description: 'Daily standup to discuss progress and blockers',
        start: new Date('2025-01-22T09:00:00'),
        end: new Date('2025-01-22T09:30:00'),
        allDay: false,
        label: 'Business' as const,
      },
      {
        title: 'Sprint Planning',
        description: 'Plan tasks for the upcoming sprint',
        start: new Date('2025-01-23T14:00:00'),
        end: new Date('2025-01-23T16:00:00'),
        allDay: false,
        label: 'Business' as const,
      },
      {
        title: 'Team Lunch',
        description: 'Team building lunch activity',
        start: new Date('2025-01-24T12:00:00'),
        end: new Date('2025-01-24T13:00:00'),
        allDay: false,
        label: 'Family' as const,
      },
      {
        title: 'Code Review Session',
        description: 'Review pull requests and discuss best practices',
        start: new Date('2025-01-25T15:00:00'),
        end: new Date('2025-01-25T16:30:00'),
        allDay: false,
        label: 'Business' as const,
      },
      {
        title: 'Team Retrospective',
        description: 'Reflect on the sprint and identify improvements',
        start: new Date('2025-01-26T10:00:00'),
        end: new Date('2025-01-26T11:30:00'),
        allDay: false,
        label: 'Business' as const,
      },
    ];

    console.log('Creating team events...');
    for (let i = 0; i < teamEvents.length; i++) {
      const eventData = teamEvents[i];
      const [event] = await db
        .insert(calendarEvents)
        .values({
          userId: premiumUser.id,
          teamId: team.id,
          scope: 'team',
          title: eventData.title,
          description: eventData.description,
          startTime: eventData.start,
          endTime: eventData.end,
          isAllDay: eventData.allDay,
          label: eventData.label,
        })
        .returning();

      console.log(`  ${i + 1}. ✅ Created: ${event.title} (${event.startTime} - ${event.endTime})`);
    }

    console.log('\n✅ Successfully created 5 team calendar events!');
    console.log(`   Team: ${team.name}`);
    console.log(`   User: ${premiumUser.email}`);

  } catch (error) {
    console.error('❌ Error creating team events:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createTeamEvents();
