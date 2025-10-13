import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env.local
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function addProfileFields() {
  console.log('⏳ Adding profile fields to users table...');

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(50)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(100)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(100)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS skype VARCHAR(100)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_image TEXT`;

    console.log('✅ Profile fields added successfully!');
  } catch (error) {
    console.error('❌ Failed to add profile fields:', error);
    process.exit(1);
  }
}

addProfileFields();
