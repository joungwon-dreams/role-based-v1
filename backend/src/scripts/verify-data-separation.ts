/**
 * Verify Data Separation
 *
 * Checks that personal and team data are properly isolated
 */

import { db } from '../db';
import { users, teams, stories, calendarEvents } from '../db/schema';
import { eq } from 'drizzle-orm';

async function verifyDataSeparation() {
  try {
    console.log('🔍 Verifying data separation between personal and team content...\n');

    // Get premium user
    const [premiumUser] = await db.select().from(users).where(eq(users.email, 'premium@willydreams.com'));
    if (!premiumUser) {
      console.error('❌ Premium user not found');
      process.exit(1);
    }
    console.log(`✅ Testing with user: ${premiumUser.email}\n`);

    // Get the team
    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.ownerId, premiumUser.id))
      .limit(1);

    if (!team) {
      console.error('❌ No team found');
      process.exit(1);
    }
    console.log(`✅ Found team: ${team.name} (${team.id})\n`);

    // Check stories separation
    console.log('📝 Stories Separation:');
    console.log('='.repeat(50));

    const personalStories = await db
      .select()
      .from(stories)
      .where(eq(stories.scope, 'personal'));

    const teamStories = await db
      .select()
      .from(stories)
      .where(eq(stories.scope, 'team'));

    console.log(`Personal stories: ${personalStories.length}`);
    personalStories.forEach((story, i) => {
      console.log(`  ${i + 1}. ${story.title} (scope: ${story.scope}, teamId: ${story.teamId || 'null'})`);
    });

    console.log(`\nTeam stories: ${teamStories.length}`);
    teamStories.forEach((story, i) => {
      console.log(`  ${i + 1}. ${story.title} (scope: ${story.scope}, teamId: ${story.teamId})`);
    });

    // Verify no mixing
    const mixedStories = personalStories.filter(s => s.teamId !== null);
    if (mixedStories.length > 0) {
      console.log('\n❌ ERROR: Found personal stories with teamId!');
      mixedStories.forEach(s => console.log(`   - ${s.title}`));
    } else {
      console.log('\n✅ Personal stories properly separated (no teamId)');
    }

    const unmixedTeamStories = teamStories.filter(s => s.teamId === null);
    if (unmixedTeamStories.length > 0) {
      console.log('❌ ERROR: Found team stories without teamId!');
      unmixedTeamStories.forEach(s => console.log(`   - ${s.title}`));
    } else {
      console.log('✅ Team stories properly associated with team');
    }

    // Check calendar events separation
    console.log('\n\n🗓️  Calendar Events Separation:');
    console.log('='.repeat(50));

    const personalEvents = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.scope, 'personal'));

    const teamEvents = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.scope, 'team'));

    console.log(`Personal events: ${personalEvents.length}`);
    personalEvents.forEach((event, i) => {
      console.log(`  ${i + 1}. ${event.title} (scope: ${event.scope}, teamId: ${event.teamId || 'null'})`);
    });

    console.log(`\nTeam events: ${teamEvents.length}`);
    teamEvents.forEach((event, i) => {
      console.log(`  ${i + 1}. ${event.title} (scope: ${event.scope}, teamId: ${event.teamId})`);
    });

    // Verify no mixing
    const mixedEvents = personalEvents.filter(e => e.teamId !== null);
    if (mixedEvents.length > 0) {
      console.log('\n❌ ERROR: Found personal events with teamId!');
      mixedEvents.forEach(e => console.log(`   - ${e.title}`));
    } else {
      console.log('\n✅ Personal events properly separated (no teamId)');
    }

    const unmixedTeamEvents = teamEvents.filter(e => e.teamId === null);
    if (unmixedTeamEvents.length > 0) {
      console.log('❌ ERROR: Found team events without teamId!');
      unmixedTeamEvents.forEach(e => console.log(`   - ${e.title}`));
    } else {
      console.log('✅ Team events properly associated with team');
    }

    // Summary
    console.log('\n\n📊 Summary:');
    console.log('='.repeat(50));
    console.log(`Personal Stories: ${personalStories.length}`);
    console.log(`Team Stories: ${teamStories.length}`);
    console.log(`Personal Events: ${personalEvents.length}`);
    console.log(`Team Events: ${teamEvents.length}`);

    const allPassed =
      mixedStories.length === 0 &&
      unmixedTeamStories.length === 0 &&
      mixedEvents.length === 0 &&
      unmixedTeamEvents.length === 0;

    if (allPassed) {
      console.log('\n✅ ALL TESTS PASSED - Data separation is working correctly!');
    } else {
      console.log('\n❌ SOME TESTS FAILED - Data separation has issues!');
    }

  } catch (error) {
    console.error('❌ Error verifying data separation:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

verifyDataSeparation();
