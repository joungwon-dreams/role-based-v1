import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('⏳ Running migrations...');

  await migrate(db, { migrationsFolder: './src/db/migrations' });

  console.log('✅ Migrations completed successfully!');
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:');
  console.error(err);
  process.exit(1);
});
