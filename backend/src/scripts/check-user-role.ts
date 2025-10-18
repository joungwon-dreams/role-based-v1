import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkUserRole() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('🔍 Checking admin@example.com role...\n');

  const result = await sql`
    SELECT
      u.id,
      u.email,
      u.name,
      ur.role_id,
      r.name as role_name,
      r.level as role_level
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.email = 'admin@example.com'
  `;

  if (result.length === 0) {
    console.log('❌ User admin@example.com not found');
    process.exit(1);
  }

  console.log('📊 User Information:');
  result.forEach((row: any) => {
    console.log(`ID: ${row.id}`);
    console.log(`Email: ${row.email}`);
    console.log(`Name: ${row.name}`);
    console.log(`Role ID: ${row.role_id || 'None'}`);
    console.log(`Role Name: ${row.role_name || 'None'}`);
    console.log(`Role Level: ${row.role_level || 'None'}`);
    console.log('---');
  });

  process.exit(0);
}

checkUserRole();
