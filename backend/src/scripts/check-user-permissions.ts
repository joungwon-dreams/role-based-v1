import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkUserPermissions() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log('🔍 Checking user role permissions...\n');

  const permissions = await sql`
    SELECT r.name as role_name, p.name as permission_name
    FROM roles r
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE r.name = 'user'
    ORDER BY p.name
  `;

  console.log(`User role has ${permissions.length} permissions:`);
  permissions.forEach((p: any) => console.log(`  ✓ ${p.permission_name}`));

  // Also check what permissions the actual user account has
  console.log('\n📊 Checking user@willydreams.com permissions...\n');

  const userPerms = await sql`
    SELECT DISTINCT p.name as permission_name
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.email = 'user@willydreams.com'
    ORDER BY p.name
  `;

  console.log(`user@willydreams.com has ${userPerms.length} permissions:`);
  userPerms.forEach((p: any) => console.log(`  ✓ ${p.permission_name}`));

  process.exit(0);
}

checkUserPermissions();
