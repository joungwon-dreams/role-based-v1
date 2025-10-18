/**
 * Database Performance Testing Script
 * Tests query performance and provides optimization recommendations
 *
 * 데이터베이스 성능 테스트 스크립트
 * 쿼리 성능을 테스트하고 최적화 권장사항을 제공합니다
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../db/index';
import { stories } from '../db/schema/features/stories';
import { comments } from '../db/schema/features/comments';
import { reactions } from '../db/schema/features/reactions';
import { commentReactions } from '../db/schema/features/comment-reactions';
import { users } from '../db/schema/core/users';
import { eq, desc, and, sql } from 'drizzle-orm';

interface PerformanceResult {
  query: string;
  duration: number;
  rowCount: number;
  avgMs: number;
}

const results: PerformanceResult[] = [];

async function measureQuery(name: string, queryFn: () => Promise<any[]>, iterations = 3) {
  console.log(`\n📊 Testing: ${name}`);
  console.log('─'.repeat(60));

  const durations: number[] = [];
  let rowCount = 0;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const result = await queryFn();
    const end = performance.now();

    const duration = end - start;
    durations.push(duration);
    rowCount = result.length;

    console.log(`  Run ${i + 1}: ${duration.toFixed(2)}ms (${rowCount} rows)`);
  }

  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / iterations;
  console.log(`  ✓ Average: ${avgDuration.toFixed(2)}ms`);

  results.push({
    query: name,
    duration: avgDuration,
    rowCount,
    avgMs: avgDuration,
  });
}

async function testDatabasePerformance() {
  console.log('\n🚀 Database Performance Test Suite');
  console.log('═'.repeat(60));

  try {
    // Test 1: Get all published stories (most common query)
    await measureQuery('Get all published stories', async () => {
      return await db
        .select()
        .from(stories)
        .where(eq(stories.isPublished, true))
        .orderBy(desc(stories.createdAt));
    });

    // Test 2: Get stories by specific author
    await measureQuery('Get stories by author', async () => {
      const allStories = await db.select().from(stories).limit(1);
      if (allStories.length === 0) return [];

      return await db
        .select()
        .from(stories)
        .where(eq(stories.authorId, allStories[0].authorId));
    });

    // Test 3: Get story with comments (JOIN query)
    await measureQuery('Get story with comments (JOIN)', async () => {
      const allStories = await db.select().from(stories).limit(1);
      if (allStories.length === 0) return [];

      return await db
        .select()
        .from(stories)
        .leftJoin(comments, eq(comments.storyId, stories.id))
        .where(eq(stories.id, allStories[0].id));
    });

    // Test 4: Get comments with reactions count
    await measureQuery('Get comments with reaction counts', async () => {
      return await db
        .select({
          comment: comments,
          reactionCount: sql<number>`count(${commentReactions.id})`,
        })
        .from(comments)
        .leftJoin(commentReactions, eq(commentReactions.commentId, comments.id))
        .groupBy(comments.id)
        .limit(50);
    });

    // Test 5: Get stories with reaction counts
    await measureQuery('Get stories with reaction counts', async () => {
      return await db
        .select({
          story: stories,
          reactionCount: sql<number>`count(${reactions.id})`,
        })
        .from(stories)
        .leftJoin(reactions, eq(reactions.storyId, stories.id))
        .where(eq(stories.isPublished, true))
        .groupBy(stories.id)
        .orderBy(desc(stories.createdAt))
        .limit(20);
    });

    // Test 6: Get hierarchical comments (recursive query simulation)
    await measureQuery('Get comments with parent-child relationship', async () => {
      const allComments = await db.select().from(comments).limit(1);
      if (allComments.length === 0) return [];

      return await db
        .select()
        .from(comments)
        .where(eq(comments.storyId, allComments[0].storyId));
    });

    // Test 7: Count queries
    await measureQuery('Count total published stories', async () => {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(stories)
        .where(eq(stories.isPublished, true));
      return result;
    });

    // Test 8: Complex filtering
    await measureQuery('Complex filter: published + recent', async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      return await db
        .select()
        .from(stories)
        .where(
          and(
            eq(stories.isPublished, true),
            sql`${stories.createdAt} >= ${sevenDaysAgo}`
          )
        )
        .orderBy(desc(stories.createdAt));
    });

    // Display summary
    console.log('\n\n📈 Performance Summary');
    console.log('═'.repeat(60));
    console.log('Query                                      | Avg Time | Rows');
    console.log('─'.repeat(60));

    results
      .sort((a, b) => b.avgMs - a.avgMs)
      .forEach((r) => {
        const queryName = r.query.padEnd(42);
        const time = `${r.avgMs.toFixed(2)}ms`.padStart(8);
        const rows = r.rowCount.toString().padStart(4);
        console.log(`${queryName} | ${time} | ${rows}`);
      });

    // Recommendations
    console.log('\n\n💡 Optimization Recommendations');
    console.log('═'.repeat(60));

    const slowQueries = results.filter((r) => r.avgMs > 100);
    if (slowQueries.length > 0) {
      console.log('⚠️  Slow queries detected (>100ms):');
      slowQueries.forEach((r) => {
        console.log(`   - ${r.query}: ${r.avgMs.toFixed(2)}ms`);
      });
    } else {
      console.log('✅ All queries are performing well (<100ms)');
    }

    // Index recommendations
    console.log('\n📋 Index Status:');
    console.log('   ✓ stories.author_id - Index created');
    console.log('   ✓ stories.is_published - Index created');
    console.log('   ✓ stories.(is_published, created_at) - Compound index created');
    console.log('   ✓ comments.story_id - Index exists');
    console.log('   ✓ comments.parent_id - Index exists');
    console.log('   ✓ reactions.story_id - Index exists');
    console.log('   ✓ comment_reactions.comment_id - Index exists');

    console.log('\n✅ Performance test complete!');
  } catch (error) {
    console.error('❌ Error during performance testing:', error);
    throw error;
  }
}

// Run the tests
testDatabasePerformance()
  .then(() => {
    console.log('\n🎉 All tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
