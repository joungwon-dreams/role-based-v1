import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

async function updateAdminRole() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('🔄 Updating admin@example.com role to superadmin...\n');

  // First, get all roles
  const roles = await sql`SELECT * FROM roles ORDER BY level DESC`;
  console.log('📊 Available roles:');
  roles.forEach((role: any) => {
    console.log(`  - ${role.name} (Level ${role.level})`);
  });
  console.log('');

  // Find superadmin role
  const superadminRole = roles.find((r: any) => r.name === 'superadmin');
  if (!superadminRole) {
    console.log('❌ Superadmin role not found');
    process.exit(1);
  }

  // Get admin user
  const adminUser = await sql`SELECT * FROM users WHERE email = 'admin@example.com' LIMIT 1`;
  if (adminUser.length === 0) {
    console.log('❌ Admin user not found');
    process.exit(1);
  }

  const userId = adminUser[0].id;
  console.log(`👤 User ID: ${userId}`);
  console.log(`📧 Email: ${adminUser[0].email}`);
  console.log(`👤 Name: ${adminUser[0].name}\n`);

  // Delete existing user role
  await sql`DELETE FROM user_roles WHERE user_id = ${userId}`;
  console.log('✓ Removed existing role');

  // Add superadmin role
  await sql`
    INSERT INTO user_roles (user_id, role_id)
    VALUES (${userId}, ${superadminRole.id})
  `;
  console.log(`✓ Added superadmin role (${superadminRole.id})\n`);

  // Verify
  const verification = await sql`
    SELECT
      u.email,
      u.name,
      r.name as role_name,
      r.level as role_level
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE u.email = 'admin@example.com'
  `;

  console.log('✅ Update successful!');
  console.log('📊 New role information:');
  verification.forEach((row: any) => {
    console.log(`  Email: ${row.email}`);
    console.log(`  Name: ${row.name}`);
    console.log(`  Role: ${row.role_name}`);
    console.log(`  Level: ${row.role_level}`);
  });

  process.exit(0);
}

updateAdminRole();
