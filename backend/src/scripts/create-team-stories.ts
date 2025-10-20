/**
 * Create Team Stories
 *
 * Creates 5 team stories for testing
 */

import { db } from '../db';
import { users, teams, stories } from '../db/schema';
import { eq } from 'drizzle-orm';

// Generate slug from title
function generateSlug(title: string, index: number): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${baseSlug}-${Date.now()}-${index}`;
}

async function createTeamStories() {
  try {
    console.log('📝 Creating team stories...\n');

    // Get premium user
    const [premiumUser] = await db.select().from(users).where(eq(users.email, 'premium@willydreams.com'));
    if (!premiumUser) {
      console.error('❌ Premium user not found');
      process.exit(1);
    }
    console.log(`✅ Found premium user: ${premiumUser.email}\n`);

    // Get the team
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

    // Create 5 team stories
    const teamStories = [
      {
        title: 'Welcome to Development Team! 🎉',
        content: `We're excited to have everyone on board! This is our team workspace where we'll share updates, collaborate on projects, and stay connected.

Let's build something amazing together!`,
      },
      {
        title: 'Sprint Goals for This Week',
        content: `Our main objectives for this sprint:

1. Complete user authentication module
2. Implement team collaboration features
3. Finish API documentation
4. Code review sessions on Friday

Let's stay focused and support each other!`,
      },
      {
        title: 'New Feature Released: Real-time Notifications',
        content: `Great news! We've just deployed real-time notifications to production.

Key features:
- Instant updates on team activities
- Customizable notification preferences
- Mobile push notifications support

Thanks to everyone who worked on this!`,
      },
      {
        title: 'Team Meeting Notes - Sprint Planning',
        content: `Summary from today's sprint planning meeting:

**Decided:**
- Sprint duration: 2 weeks
- Daily standups at 9:00 AM
- Code freeze on Thursday evenings

**Action Items:**
- Update project timeline
- Review technical specifications
- Assign tasks in project board

See you all tomorrow!`,
      },
      {
        title: 'Congratulations on Successful Deployment! 🚀',
        content: `Big shoutout to the entire team for the successful deployment today!

**Stats:**
- Zero downtime
- All tests passing
- Performance improved by 30%

Great work everyone. Let's celebrate this win!`,
      },
    ];

    console.log('Creating team stories...');
    for (let i = 0; i < teamStories.length; i++) {
      const storyData = teamStories[i];
      const [story] = await db
        .insert(stories)
        .values({
          authorId: premiumUser.id,
          teamId: team.id,
          scope: 'team',
          title: storyData.title,
          content: storyData.content,
          slug: generateSlug(storyData.title, i),
          visibility: 'team',
        })
        .returning();

      console.log(`  ${i + 1}. ✅ Created: ${story.title}`);
    }

    console.log('\n✅ Successfully created 5 team stories!');
    console.log(`   Team: ${team.name}`);
    console.log(`   User: ${premiumUser.email}`);

  } catch (error) {
    console.error('❌ Error creating team stories:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createTeamStories();
