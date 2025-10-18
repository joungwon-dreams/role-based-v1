import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkConnections() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const result = await sql`SELECT * FROM connections ORDER BY created_at DESC LIMIT 20`;
  console.log('\n📊 Total connections:', result.length);
  console.log('\n🔗 Connections:');
  result.forEach((conn: any, idx: number) => {
    console.log(`${idx + 1}. ID: ${conn.id}`);
    console.log(`   Requester: ${conn.requester_id}`);
    console.log(`   Addressee: ${conn.addressee_id}`);
    console.log(`   Status: ${conn.status}`);
    console.log(`   Created: ${conn.created_at}\n`);
  });
}

checkConnections();
