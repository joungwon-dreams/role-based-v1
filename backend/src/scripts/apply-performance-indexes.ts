/**
 * Apply Performance Indexes
 * Applies the performance indexes migration to the database
 *
 * 성능 인덱스 적용
 * 데이터베이스에 성능 인덱스 마이그레이션을 적용합니다
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

async function applyPerformanceIndexes() {
  console.log('\n🚀 Applying Performance Indexes Migration');
  console.log('═'.repeat(60));

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const sql = neon(process.env.DATABASE_URL);

    // Read the migration file
    const migrationPath = join(__dirname, '../../migrations/add_stories_performance_indexes.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));

    console.log('\n⏳ Executing migration...');

    // Execute each index creation statement
    try {
      console.log('  Creating idx_stories_author_id...');
      await sql`CREATE INDEX IF NOT EXISTS "idx_stories_author_id" ON "stories"("author_id")`;

      console.log('  Creating idx_stories_is_published...');
      await sql`CREATE INDEX IF NOT EXISTS "idx_stories_is_published" ON "stories"("is_published")`;

      console.log('  Creating idx_stories_published_created...');
      await sql`CREATE INDEX IF NOT EXISTS "idx_stories_published_created" ON "stories"("is_published", "created_at" DESC)`;

      console.log('  Creating idx_stories_created_at...');
      await sql`CREATE INDEX IF NOT EXISTS "idx_stories_created_at" ON "stories"("created_at" DESC)`;

      // Add comments
      console.log('  Adding index comments...');
      await sql`COMMENT ON INDEX "idx_stories_author_id" IS 'Improves performance when filtering stories by author'`;
      await sql`COMMENT ON INDEX "idx_stories_is_published" IS 'Improves performance when filtering by publication status'`;
      await sql`COMMENT ON INDEX "idx_stories_published_created" IS 'Optimizes queries that filter by publication status and sort by date'`;
      await sql`COMMENT ON INDEX "idx_stories_created_at" IS 'Improves performance when sorting stories by creation date'`;
    } catch (error: any) {
      if (error.message && error.message.includes('already exists')) {
        console.log('  ℹ️  Some indexes already exist');
      } else {
        throw error;
      }
    }

    console.log('✅ Performance indexes created successfully!');
    console.log('\nIndexes created:');
    console.log('  • idx_stories_author_id');
    console.log('  • idx_stories_is_published');
    console.log('  • idx_stories_published_created');
    console.log('  • idx_stories_created_at');

    console.log('\n🎉 Migration complete!');
  } catch (error: any) {
    // Check if the error is because indexes already exist
    if (error.message && error.message.includes('already exists')) {
      console.log('ℹ️  Indexes already exist, skipping...');
      console.log('✅ No action needed!');
    } else {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }
}

// Run the migration
applyPerformanceIndexes()
  .then(() => {
    console.log('\n✅ Process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Process failed:', error);
    process.exit(1);
  });
