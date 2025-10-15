import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load .env.local
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log('🗑️  Dropping posts table if exists...');
    await sql`DROP TABLE IF EXISTS posts CASCADE`;
    console.log('✅ Posts table dropped');

    console.log('\n📝 Creating stories table...');
    await sql`
      CREATE TABLE stories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        is_published BOOLEAN DEFAULT FALSE NOT NULL,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Stories table created');

    console.log('\n📊 Creating indexes...');
    await sql`CREATE INDEX idx_stories_author_id ON stories(author_id)`;
    await sql`CREATE INDEX idx_stories_published ON stories(is_published)`;
    await sql`CREATE INDEX idx_stories_slug ON stories(slug)`;
    console.log('✅ Indexes created');

    console.log('\n🔗 Updating comments table...');
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'comments' AND column_name IN ('post_id', 'story_id')
    `;
    
    const hasPostId = columns.some((c: any) => c.column_name === 'post_id');
    const hasStoryId = columns.some((c: any) => c.column_name === 'story_id');

    if (hasPostId && !hasStoryId) {
      await sql`ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_posts_id_fk`;
      await sql`ALTER TABLE comments RENAME COLUMN post_id TO story_id`;
      await sql`
        ALTER TABLE comments 
        ADD CONSTRAINT comments_story_id_stories_id_fk 
        FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
      `;
      console.log('✅ Comments table updated (post_id → story_id)');
    } else if (hasStoryId) {
      console.log('✅ Comments table already has story_id');
    } else {
      console.log('⚠️  Comments table does not have post_id or story_id column');
    }

    console.log('\n✨ Migration completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrate();
