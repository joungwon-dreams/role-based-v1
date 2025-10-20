/**
 * Create Personal Calendar Events
 *
 * Creates 5 personal calendar events for testing
 */

import { db } from '../db';
import { users, calendarEvents } from '../db/schema';
import { eq } from 'drizzle-orm';

async function createPersonalEvents() {
  try {
    console.log('🗓️  Creating personal calendar events...\n');

    // Get premium user
    const [premiumUser] = await db.select().from(users).where(eq(users.email, 'premium@willydreams.com'));
    if (!premiumUser) {
      console.error('❌ Premium user not found');
      process.exit(1);
    }
    console.log(`✅ Found premium user: ${premiumUser.email}\n`);

    // Create 5 personal calendar events
    const personalEvents = [
      {
        title: 'Morning Workout',
        description: 'Daily gym session - cardio and weights',
        startTime: new Date('2025-01-22T06:00:00'),
        endTime: new Date('2025-01-22T07:30:00'),
        isAllDay: false,
        label: 'Personal' as const,
      },
      {
        title: 'Doctor Appointment',
        description: 'Annual health checkup',
        startTime: new Date('2025-01-23T10:00:00'),
        endTime: new Date('2025-01-23T11:00:00'),
        isAllDay: false,
        label: 'Personal' as const,
      },
      {
        title: 'Family Dinner',
        description: 'Dinner with parents',
        startTime: new Date('2025-01-24T18:00:00'),
        endTime: new Date('2025-01-24T20:00:00'),
        isAllDay: false,
        label: 'Family' as const,
      },
      {
        title: 'Birthday Party',
        description: 'Friend\'s birthday celebration',
        startTime: new Date('2025-01-25T19:00:00'),
        endTime: new Date('2025-01-25T22:00:00'),
        isAllDay: false,
        label: 'Personal' as const,
      },
      {
        title: 'Weekend Hiking Trip',
        description: 'Mountain hiking with friends',
        startTime: new Date('2025-01-26T00:00:00'),
        endTime: new Date('2025-01-26T23:59:59'),
        isAllDay: true,
        label: 'Holiday' as const,
      },
    ];

    console.log('Creating personal events...');
    for (let i = 0; i < personalEvents.length; i++) {
      const eventData = personalEvents[i];
      const [event] = await db
        .insert(calendarEvents)
        .values({
          userId: premiumUser.id,
          scope: 'personal',
          title: eventData.title,
          description: eventData.description,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          isAllDay: eventData.isAllDay,
          label: eventData.label,
        })
        .returning();

      const eventType = event.isAllDay ? 'All-day' : 'Timed';
      console.log(`  ${i + 1}. ✅ Created [${eventType}]: ${event.title} - ${event.label}`);
    }

    console.log('\n✅ Successfully created 5 personal calendar events!');
    console.log(`   User: ${premiumUser.email}`);
    console.log(`   All-day: 1, Timed: 4`);

  } catch (error) {
    console.error('❌ Error creating personal events:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createPersonalEvents();
