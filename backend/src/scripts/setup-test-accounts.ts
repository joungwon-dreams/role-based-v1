import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function setupTestAccounts() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log('🔧 Setting up test accounts...\n');

  // Get all roles
  const roles = await sql`SELECT * FROM roles ORDER BY level DESC`;
  const roleMap = Object.fromEntries(roles.map((r: any) => [r.name, r.id]));

  console.log('📊 Available roles:');
  roles.forEach((r: any) => console.log(`  - ${r.name} (Level ${r.level})`));
  console.log('');

  // Test accounts to set up
  const testAccounts = [
    { email: 'admin@example.com', role: 'superadmin' },
    { email: 'premium@willydreams.com', role: 'premium' },
    { email: 'user@willydreams.com', role: 'user' },
  ];

  // Check if we need an admin account
  const adminCheck = await sql`SELECT * FROM users WHERE email LIKE 'admin%' AND email != 'admin@example.com' LIMIT 1`;
  if (adminCheck.length > 0) {
    testAccounts.push({ email: adminCheck[0].email, role: 'admin' });
  } else {
    // Create admin account from premium1
    const premium1 = await sql`SELECT * FROM users WHERE email = 'premium1@willydreams.com' LIMIT 1`;
    if (premium1.length > 0) {
      testAccounts.push({ email: 'premium1@willydreams.com', role: 'admin' });
    }
  }

  console.log('🔄 Updating roles...\n');

  for (const account of testAccounts) {
    const user = await sql`SELECT * FROM users WHERE email = ${account.email} LIMIT 1`;

    if (user.length === 0) {
      console.log(`❌ User ${account.email} not found, skipping...`);
      continue;
    }

    const userId = user[0].id;
    const roleId = roleMap[account.role];

    if (!roleId) {
      console.log(`❌ Role ${account.role} not found, skipping...`);
      continue;
    }

    // Delete existing roles
    await sql`DELETE FROM user_roles WHERE user_id = ${userId}`;

    // Add new role
    await sql`INSERT INTO user_roles (user_id, role_id) VALUES (${userId}, ${roleId})`;

    console.log(`✅ ${account.email} → ${account.role}`);
  }

  console.log('\n📊 Final account setup:');
  const verification = await sql`
    SELECT
      u.email,
      u.name,
      r.name as role_name,
      r.level as role_level
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE u.email IN (${testAccounts.map(a => a.email)})
    ORDER BY r.level DESC
  `;

  verification.forEach((v: any) => {
    console.log(`  ${v.role_name.toUpperCase().padEnd(12)} - ${v.email} (${v.name})`);
  });

  console.log('\n✅ Test accounts ready!');
  console.log('\n📝 Default password for all test accounts: Admin@123456');

  process.exit(0);
}

setupTestAccounts();
