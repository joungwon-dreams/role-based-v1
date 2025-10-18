import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function addUserPermissions() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log('🔧 Adding missing permissions to user role...\n');

  // Define all permissions that should exist
  const permissionsToCreate = [
    // Dashboard
    { name: 'dashboard:view:own', resource: 'dashboard', action: 'view', scope: 'own', description: 'View dashboard' },

    // Calendar
    { name: 'calendar:view:own', resource: 'calendar', action: 'view', scope: 'own', description: 'View own calendar' },
    { name: 'calendar:create:own', resource: 'calendar', action: 'create', scope: 'own', description: 'Create own calendar events' },
    { name: 'calendar:edit:own', resource: 'calendar', action: 'edit', scope: 'own', description: 'Edit own calendar events' },
    { name: 'calendar:delete:own', resource: 'calendar', action: 'delete', scope: 'own', description: 'Delete own calendar events' },

    // Stories (using 'story' to match frontend)
    { name: 'story:view:own', resource: 'story', action: 'view', scope: 'own', description: 'View own stories' },
    { name: 'story:create:own', resource: 'story', action: 'create', scope: 'own', description: 'Create own stories' },
    { name: 'story:edit:own', resource: 'story', action: 'edit', scope: 'own', description: 'Edit own stories' },
    { name: 'story:delete:own', resource: 'story', action: 'delete', scope: 'own', description: 'Delete own stories' },
    { name: 'story:view:all', resource: 'story', action: 'view', scope: 'all', description: 'View all stories' },

    // Messages
    { name: 'message:view:own', resource: 'message', action: 'view', scope: 'own', description: 'View own messages' },
    { name: 'message:send:own', resource: 'message', action: 'send', scope: 'own', description: 'Send messages' },
    { name: 'message:delete:own', resource: 'message', action: 'delete', scope: 'own', description: 'Delete own messages' },

    // Connections/Friends
    { name: 'connection:view:own', resource: 'connection', action: 'view', scope: 'own', description: 'View own connections' },
    { name: 'connection:create:own', resource: 'connection', action: 'create', scope: 'own', description: 'Create connection requests' },
    { name: 'connection:manage:own', resource: 'connection', action: 'manage', scope: 'own', description: 'Manage own connections' },

    // Notifications
    { name: 'notification:view:own', resource: 'notification', action: 'view', scope: 'own', description: 'View own notifications' },

    // Profile
    { name: 'profile:view:own', resource: 'profile', action: 'view', scope: 'own', description: 'View own profile' },
    { name: 'profile:edit:own', resource: 'profile', action: 'edit', scope: 'own', description: 'Edit own profile' },
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
    } catch (error) {
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
    'dashboard:view:own',
    'profile:view:own', 'profile:edit:own',
    'calendar:view:own', 'calendar:create:own', 'calendar:edit:own', 'calendar:delete:own',
    'story:view:own', 'story:create:own', 'story:edit:own', 'story:delete:own', 'story:view:all',
    'message:view:own', 'message:send:own', 'message:delete:own',
    'connection:view:own', 'connection:create:own', 'connection:manage:own',
    'notification:view:own',
  ];

  for (const permName of userPermissions) {
    try {
      const permResult = await sql`SELECT id FROM permissions WHERE name = ${permName} LIMIT 1`;
      if (permResult.length > 0) {
        const permId = permResult[0].id;
        await sql`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES (${userRoleId}, ${permId})
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `;
        console.log(`  ✓ ${permName}`);
      }
    } catch (error) {
      console.log(`  ⚠️  ${permName} - ${error.message}`);
    }
  }

  console.log('\n✅ Permissions added successfully!');
  console.log('\n📝 Please log out and log back in to see the sidebar menu.');

  process.exit(0);
}

addUserPermissions();
