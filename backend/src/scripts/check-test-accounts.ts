import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkTestAccounts() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log('🔍 Checking test accounts for each role...\n');

  const accounts = await sql`
    SELECT
      u.id,
      u.email,
      u.name,
      r.name as role_name,
      r.level as role_level
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.email IN (
      'admin@example.com',
      'user@willydreams.com',
      'premium@willydreams.com',
      'premium1@willydreams.com'
    )
    ORDER BY r.level DESC
  `;

  console.log('📊 Test Accounts:');
  console.log('================\n');

  const roleGroups: Record<string, any[]> = {};

  accounts.forEach((acc: any) => {
    const roleName = acc.role_name || 'No Role';
    if (!roleGroups[roleName]) {
      roleGroups[roleName] = [];
    }
    roleGroups[roleName].push(acc);
  });

  // Display by role
  ['superadmin', 'admin', 'premium', 'user', 'No Role'].forEach(roleName => {
    if (roleGroups[roleName] && roleGroups[roleName].length > 0) {
      console.log(`${roleName.toUpperCase()} (Level ${roleGroups[roleName][0].role_level || 'N/A'}):`);
      roleGroups[roleName].forEach((acc: any) => {
        console.log(`  ✓ ${acc.email} (${acc.name})`);
      });
      console.log('');
    }
  });

  console.log('\n📝 Test Plan:');
  console.log('1. Superadmin: admin@example.com');
  console.log('2. Premium: premium@willydreams.com or premium1@willydreams.com');
  console.log('3. User: user@willydreams.com');
  console.log('\n⚠️  Need to create/assign admin role account');

  process.exit(0);
}

checkTestAccounts();
