/**
 * Create Personal Stories
 *
 * Creates 5 personal stories for testing
 */

import { db } from '../db';
import { users, stories } from '../db/schema';
import { eq } from 'drizzle-orm';

async function createPersonalStories() {
  try {
    console.log('📝 Creating personal stories...\n');

    // Get premium user
    const [premiumUser] = await db.select().from(users).where(eq(users.email, 'premium@willydreams.com'));
    if (!premiumUser) {
      console.error('❌ Premium user not found');
      process.exit(1);
    }
    console.log(`✅ Found premium user: ${premiumUser.email}\n`);

    // Create 5 personal stories
    const personalStories = [
      {
        title: 'My Journey into Software Development',
        content: `Started my coding journey 5 years ago. Here's what I learned along the way and how I grew as a developer...`,
        slug: 'my-journey-into-software-development',
        isPublished: true,
      },
      {
        title: 'Building a Full-Stack App from Scratch',
        content: `Documenting my experience building a full-stack application using Next.js, tRPC, and PostgreSQL. This is day 1 of my development journey...`,
        slug: 'building-fullstack-app-from-scratch',
        isPublished: true,
      },
      {
        title: 'Thoughts on Remote Work',
        content: `After working remotely for 3 years, here are my honest thoughts on the pros and cons, productivity tips, and work-life balance...`,
        slug: 'thoughts-on-remote-work',
        isPublished: true,
      },
      {
        title: 'Weekend Project Ideas',
        content: `A collection of fun weekend project ideas for developers looking to learn new technologies and build their portfolio...`,
        slug: 'weekend-project-ideas',
        isPublished: false, // Draft
      },
      {
        title: 'My 2025 Goals and Aspirations',
        content: `Setting my goals for 2025 - both personal and professional. Time to make this year count!`,
        slug: 'my-2025-goals-and-aspirations',
        isPublished: false, // Draft
      },
    ];

    console.log('Creating personal stories...');
    for (let i = 0; i < personalStories.length; i++) {
      const storyData = personalStories[i];
      const [story] = await db
        .insert(stories)
        .values({
          authorId: premiumUser.id,
          scope: 'personal',
          title: storyData.title,
          content: storyData.content,
          slug: storyData.slug,
          isPublished: storyData.isPublished,
          publishedAt: storyData.isPublished ? new Date() : null,
        })
        .returning();

      const status = story.isPublished ? '✅ Published' : '📝 Draft';
      console.log(`  ${i + 1}. ${status}: ${story.title}`);
    }

    console.log('\n✅ Successfully created 5 personal stories!');
    console.log(`   User: ${premiumUser.email}`);
    console.log(`   Published: 3, Drafts: 2`);

  } catch (error) {
    console.error('❌ Error creating personal stories:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createPersonalStories();
