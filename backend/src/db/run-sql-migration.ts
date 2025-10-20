import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

async function runSqlMigration(migrationFile: string) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  const migrationPath = path.join(process.cwd(), 'migrations', migrationFile);
  const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

  console.log(`⏳ Running migration: ${migrationFile}...`);

  try {
    // Use Pool for raw SQL execution
    const result = await pool.query(sqlContent);

    console.log('✅ Migration completed successfully!');
    console.log(`  Result: ${JSON.stringify(result.rowCount)} rows affected`);
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:');
    console.error(err);
    await pool.end();
    process.exit(1);
  }
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Usage: tsx src/db/run-sql-migration.ts <migration-file>');
  process.exit(1);
}

runSqlMigration(migrationFile);
