import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixUserPermissions() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log('🔧 Adding permissions using existing enum values...\n');

  // Use only enum values that exist: create, read, update, delete, list, assign, manage
  const permissionsToCreate = [
    // Dashboard - use 'read' instead of 'view'
    { name: 'dashboard:read:own', resource: 'dashboard', action: 'read', scope: 'own', description: 'Read dashboard' },

    // Calendar
    { name: 'calendar:read:own', resource: 'calendar', action: 'read', scope: 'own', description: 'Read own calendar' },
    { name: 'calendar:create:own', resource: 'calendar', action: 'create', scope: 'own', description: 'Create own calendar events' },
    { name: 'calendar:update:own', resource: 'calendar', action: 'update', scope: 'own', description: 'Update own calendar events' },
    { name: 'calendar:delete:own', resource: 'calendar', action: 'delete', scope: 'own', description: 'Delete own calendar events' },

    // Stories
    { name: 'story:read:own', resource: 'story', action: 'read', scope: 'own', description: 'Read own stories' },
    { name: 'story:create:own', resource: 'story', action: 'create', scope: 'own', description: 'Create own stories' },
    { name: 'story:update:own', resource: 'story', action: 'update', scope: 'own', description: 'Update own stories' },
    { name: 'story:delete:own', resource: 'story', action: 'delete', scope: 'own', description: 'Delete own stories' },
    { name: 'story:read:all', resource: 'story', action: 'read', scope: 'all', description: 'Read all stories' },

    // Messages
    { name: 'message:read:own', resource: 'message', action: 'read', scope: 'own', description: 'Read own messages' },
    { name: 'message:create:own', resource: 'message', action: 'create', scope: 'own', description: 'Send messages' },
    { name: 'message:delete:own', resource: 'message', action: 'delete', scope: 'own', description: 'Delete own messages' },

    // Connections/Friends
    { name: 'connection:read:own', resource: 'connection', action: 'read', scope: 'own', description: 'Read own connections' },
    { name: 'connection:create:own', resource: 'connection', action: 'create', scope: 'own', description: 'Create connection requests' },
    { name: 'connection:manage:own', resource: 'connection', action: 'manage', scope: 'own', description: 'Manage own connections' },

    // Notifications
    { name: 'notification:read:own', resource: 'notification', action: 'read', scope: 'own', description: 'Read own notifications' },

    // Profile
    { name: 'profile:read:own', resource: 'profile', action: 'read', scope: 'own', description: 'Read own profile' },
    { name: 'profile:update:own', resource: 'profile', action: 'update', scope: 'own', description: 'Update own profile' },
  ];

  console.log('Creating permissions...');

  for (const perm of permissionsToCreate) {
    try {
      await sql`
        INSERT INTO permissions (name, resource, action, scope, description)
        VALUES (${perm.name}, ${perm.resource}, ${perm.action}, ${perm.scope}, ${perm.description})
        ON CONFLICT (name) DO NOTHING
      `;
      console.log(`  ✓ ${perm.name}`);
    } catch (error: any) {
      console.log(`  ⚠️  ${perm.name} - ${error.message}`);
    }
  }

  // Get user role ID
  const userRole = await sql`SELECT id FROM roles WHERE name = 'user' LIMIT 1`;
  if (userRole.length === 0) {
    console.error('❌ User role not found!');
    process.exit(1);
  }
  const userRoleId = userRole[0].id;

  console.log('\nAssigning permissions to user role...');

  const userPermissions = [
    'dashboard:read:own',
    'profile:read:own', 'profile:update:own',
    'calendar:read:own', 'calendar:create:own', 'calendar:update:own', 'calendar:delete:own',
    'story:read:own', 'story:create:own', 'story:update:own', 'story:delete:own', 'story:read:all',
    'message:read:own', 'message:create:own', 'message:delete:own',
    'connection:read:own', 'connection:create:own', 'connection:manage:own',
    'notification:read:own',
  ];

  for (const permName of userPermissions) {
    try {
      const permResult = await sql`SELECT id FROM permissions WHERE name = ${permName} LIMIT 1`;
      if (permResult.length > 0) {
        const permId = permResult[0].id;
        await sql`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES (${userRoleId}, ${permId})
          ON CONFLICT DO NOTHING
        `;
        console.log(`  ✓ ${permName}`);
      }
    } catch (error: any) {
      console.log(`  ⚠️  ${permName} - ${error.message}`);
    }
  }

  console.log('\n✅ Permissions added successfully!');

  // Verify
  const finalCheck = await sql`
    SELECT COUNT(*) as count
    FROM role_permissions rp
    JOIN roles r ON rp.role_id = r.id
    WHERE r.name = 'user'
  `;

  console.log(`\n📊 User role now has ${finalCheck[0].count} permissions`);

  process.exit(0);
}

fixUserPermissions();
