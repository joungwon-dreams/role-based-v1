import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema/index';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local if not already loaded
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: resolve(__dirname, '../../.env.local') });
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create neon client
const sql = neon(process.env.DATABASE_URL);

// Create drizzle instance
export const db = drizzle(sql, { schema });

export type Database = typeof db;
