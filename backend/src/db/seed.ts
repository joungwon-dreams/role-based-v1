import { db } from './index';
import { roles, permissions, rolePermissions, users, userRoles, accounts } from './schema/index';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // 1. Create roles
    console.log('Creating roles...');
    const rolesData = [
      {
        name: 'guest',
        level: 1,
        label: { en: 'Guest', ko: '손님' },
        description: 'Public access only, cannot create accounts',
      },
      {
        name: 'user',
        level: 2,
        label: { en: 'User', ko: '사용자' },
        description: 'Standard authenticated user with basic features',
      },
      {
        name: 'premium',
        level: 3,
        label: { en: 'Premium User', ko: '프리미엄 사용자' },
        description: 'Paid subscription with advanced features (AI, Teams, Projects)',
      },
      {
        name: 'admin',
        level: 4,
        label: { en: 'Administrator', ko: '관리자' },
        description: 'Manages users, roles, permissions, and system operations',
      },
      {
        name: 'superadmin',
        level: 5,
        label: { en: 'Super Administrator', ko: '최고 관리자' },
        description: 'Full system control including database and security policies',
      },
    ];

    const insertedRoles = await db.insert(roles).values(rolesData).returning();
    console.log(`✅ Created ${insertedRoles.length} roles\n`);

    // 2. Create permissions
    console.log('Creating permissions...');
    const permissionsData: Array<{
      name: string;
      resource: string;
      action: 'create' | 'read' | 'update' | 'delete' | 'list' | 'assign' | 'manage' | 'view' | 'edit' | 'send' | 'invite' | 'moderate' | 'upload' | 'publish' | 'export' | 'suspend' | 'monitor' | 'configure' | 'backup' | 'restore';
      scope: 'own' | 'team' | 'all';
      description: string;
    }> = [
      // Dashboard permissions
      { name: 'dashboard:view:own', resource: 'dashboard', action: 'view', scope: 'own', description: 'View dashboard' },

      // Profile permissions
      { name: 'profile:view:own', resource: 'profile', action: 'view', scope: 'own', description: 'View own profile' },
      { name: 'profile:edit:own', resource: 'profile', action: 'edit', scope: 'own', description: 'Edit own profile' },

      // Calendar permissions
      { name: 'calendar:view:own', resource: 'calendar', action: 'view', scope: 'own', description: 'View calendar' },
      { name: 'calendar:create:own', resource: 'calendar', action: 'create', scope: 'own', description: 'Create calendar events' },
      { name: 'calendar:edit:own', resource: 'calendar', action: 'edit', scope: 'own', description: 'Edit calendar events' },
      { name: 'calendar:delete:own', resource: 'calendar', action: 'delete', scope: 'own', description: 'Delete calendar events' },

      // Posts permissions
      { name: 'post:view:own', resource: 'post', action: 'view', scope: 'own', description: 'View own posts' },
      { name: 'post:create:own', resource: 'post', action: 'create', scope: 'own', description: 'Create posts' },
      { name: 'post:edit:own', resource: 'post', action: 'edit', scope: 'own', description: 'Edit own posts' },
      { name: 'post:delete:own', resource: 'post', action: 'delete', scope: 'own', description: 'Delete own posts' },
      { name: 'post:view:all', resource: 'post', action: 'view', scope: 'all', description: 'View all posts' },
      { name: 'post:manage:all', resource: 'post', action: 'manage', scope: 'all', description: 'Manage all posts' },
      { name: 'post:moderate:all', resource: 'post', action: 'moderate', scope: 'all', description: 'Moderate posts' },

      // Messages permissions
      { name: 'message:view:own', resource: 'message', action: 'view', scope: 'own', description: 'View messages' },
      { name: 'message:send:own', resource: 'message', action: 'send', scope: 'own', description: 'Send messages' },
      { name: 'message:delete:own', resource: 'message', action: 'delete', scope: 'own', description: 'Delete messages' },

      // Connections permissions
      { name: 'connection:view:own', resource: 'connection', action: 'view', scope: 'own', description: 'View connections' },
      { name: 'connection:create:own', resource: 'connection', action: 'create', scope: 'own', description: 'Add connections' },
      { name: 'connection:manage:own', resource: 'connection', action: 'manage', scope: 'own', description: 'Manage connections' },

      // Notifications permissions
      { name: 'notification:view:own', resource: 'notification', action: 'view', scope: 'own', description: 'View notifications' },

      // Teams permissions (Premium)
      { name: 'team:view:team', resource: 'team', action: 'view', scope: 'team', description: 'View teams' },
      { name: 'team:create:own', resource: 'team', action: 'create', scope: 'own', description: 'Create teams' },
      { name: 'team:edit:team', resource: 'team', action: 'edit', scope: 'team', description: 'Edit teams' },
      { name: 'team:manage:team', resource: 'team', action: 'manage', scope: 'team', description: 'Manage teams' },
      { name: 'team:delete:team', resource: 'team', action: 'delete', scope: 'team', description: 'Delete teams' },
      { name: 'team:manage:all', resource: 'team', action: 'manage', scope: 'all', description: 'Manage all teams' },

      // Team Members permissions (Premium)
      { name: 'team_member:view:team', resource: 'team_member', action: 'view', scope: 'team', description: 'View team members' },
      { name: 'team_member:invite:team', resource: 'team_member', action: 'invite', scope: 'team', description: 'Invite members' },
      { name: 'team_member:manage:team', resource: 'team_member', action: 'manage', scope: 'team', description: 'Manage members' },
      { name: 'team_member:delete:team', resource: 'team_member', action: 'delete', scope: 'team', description: 'Remove members' },

      // Projects permissions (Premium)
      { name: 'project:view:team', resource: 'project', action: 'view', scope: 'team', description: 'View projects' },
      { name: 'project:create:team', resource: 'project', action: 'create', scope: 'team', description: 'Create projects' },
      { name: 'project:edit:team', resource: 'project', action: 'edit', scope: 'team', description: 'Edit projects' },
      { name: 'project:delete:team', resource: 'project', action: 'delete', scope: 'team', description: 'Delete projects' },
      { name: 'project:manage:all', resource: 'project', action: 'manage', scope: 'all', description: 'Manage all projects' },

      // Analytics permissions (Premium)
      { name: 'analytics:view:own', resource: 'analytics', action: 'view', scope: 'own', description: 'View basic analytics' },
      { name: 'analytics:view:team', resource: 'analytics', action: 'view', scope: 'team', description: 'View advanced analytics' },

      // Support permissions (Premium)
      { name: 'support:create:own', resource: 'support', action: 'create', scope: 'own', description: 'Priority support' },

      // Landing Pages permissions (Admin)
      { name: 'landing_page:view:all', resource: 'landing_page', action: 'view', scope: 'all', description: 'View landing pages' },
      { name: 'landing_page:create:all', resource: 'landing_page', action: 'create', scope: 'all', description: 'Create landing pages' },
      { name: 'landing_page:edit:all', resource: 'landing_page', action: 'edit', scope: 'all', description: 'Edit landing pages' },
      { name: 'landing_page:delete:all', resource: 'landing_page', action: 'delete', scope: 'all', description: 'Delete landing pages' },
      { name: 'landing_page:manage:all', resource: 'landing_page', action: 'manage', scope: 'all', description: 'Manage landing pages' },
      { name: 'landing_page:publish:all', resource: 'landing_page', action: 'publish', scope: 'all', description: 'Publish landing pages' },

      // Media permissions (Admin)
      { name: 'media:view:all', resource: 'media', action: 'view', scope: 'all', description: 'View media' },
      { name: 'media:upload:all', resource: 'media', action: 'upload', scope: 'all', description: 'Upload media' },
      { name: 'media:manage:all', resource: 'media', action: 'manage', scope: 'all', description: 'Manage media' },
      { name: 'media:delete:all', resource: 'media', action: 'delete', scope: 'all', description: 'Delete media' },

      // Users permissions (Admin)
      { name: 'user:view:all', resource: 'user', action: 'view', scope: 'all', description: 'View all users' },
      { name: 'user:create:all', resource: 'user', action: 'create', scope: 'all', description: 'Create users' },
      { name: 'user:edit:all', resource: 'user', action: 'edit', scope: 'all', description: 'Edit users' },
      { name: 'user:suspend:all', resource: 'user', action: 'suspend', scope: 'all', description: 'Suspend users' },
      { name: 'user:delete:all', resource: 'user', action: 'delete', scope: 'all', description: 'Delete users' },
      { name: 'user:manage:all', resource: 'user', action: 'manage', scope: 'all', description: 'Manage users' },

      // Activities permissions (Admin)
      { name: 'activity:view:all', resource: 'activity', action: 'view', scope: 'all', description: 'View activities' },
      { name: 'activity:monitor:all', resource: 'activity', action: 'monitor', scope: 'all', description: 'Monitor activities' },

      // Reports permissions (Admin)
      { name: 'report:view:all', resource: 'report', action: 'view', scope: 'all', description: 'View all reports' },
      { name: 'report:export:all', resource: 'report', action: 'export', scope: 'all', description: 'Export reports' },

      // System permissions (Super Admin)
      { name: 'system:manage:all', resource: 'system', action: 'manage', scope: 'all', description: 'Manage system' },
      { name: 'system:configure:all', resource: 'system', action: 'configure', scope: 'all', description: 'Configure system' },

      // Database permissions (Super Admin)
      { name: 'database:view:all', resource: 'database', action: 'view', scope: 'all', description: 'View database' },
      { name: 'database:manage:all', resource: 'database', action: 'manage', scope: 'all', description: 'Manage database' },
      { name: 'database:backup:all', resource: 'database', action: 'backup', scope: 'all', description: 'Backup database' },
      { name: 'database:restore:all', resource: 'database', action: 'restore', scope: 'all', description: 'Restore database' },
      { name: 'database:monitor:all', resource: 'database', action: 'monitor', scope: 'all', description: 'Monitor database' },

      // Security permissions (Super Admin)
      { name: 'security:view:all', resource: 'security', action: 'view', scope: 'all', description: 'View security' },
      { name: 'security:manage:all', resource: 'security', action: 'manage', scope: 'all', description: 'Manage security' },
      { name: 'security:configure:all', resource: 'security', action: 'configure', scope: 'all', description: 'Configure security' },

      // Logs permissions (Super Admin)
      { name: 'log:view:all', resource: 'log', action: 'view', scope: 'all', description: 'View logs' },
      { name: 'log:export:all', resource: 'log', action: 'export', scope: 'all', description: 'Export logs' },

      // Automation permissions (Super Admin)
      { name: 'automation:view:all', resource: 'automation', action: 'view', scope: 'all', description: 'View automation' },
      { name: 'automation:manage:all', resource: 'automation', action: 'manage', scope: 'all', description: 'Manage automation' },

      // Roles & Permissions (Super Admin)
      { name: 'role:view:all', resource: 'role', action: 'view', scope: 'all', description: 'View roles' },
      { name: 'role:create:all', resource: 'role', action: 'create', scope: 'all', description: 'Create roles' },
      { name: 'role:edit:all', resource: 'role', action: 'edit', scope: 'all', description: 'Edit roles' },
      { name: 'role:delete:all', resource: 'role', action: 'delete', scope: 'all', description: 'Delete roles' },
      { name: 'role:manage:all', resource: 'role', action: 'manage', scope: 'all', description: 'Manage roles' },
      { name: 'permission:view:all', resource: 'permission', action: 'view', scope: 'all', description: 'View permissions' },
      { name: 'permission:manage:all', resource: 'permission', action: 'manage', scope: 'all', description: 'Manage permissions' },
    ];

    const insertedPermissions = await db.insert(permissions).values(permissionsData).returning();
    console.log(`✅ Created ${insertedPermissions.length} permissions\n`);

    // 3. Assign permissions to roles
    console.log('Assigning permissions to roles...');

    // User role (level 2) - Personal workspace permissions
    const userPermissions = [
      'dashboard:view:own',
      'profile:view:own', 'profile:edit:own',
      'calendar:view:own', 'calendar:create:own', 'calendar:edit:own', 'calendar:delete:own',
      'post:view:own', 'post:create:own', 'post:edit:own', 'post:delete:own', 'post:view:all',
      'message:view:own', 'message:send:own', 'message:delete:own',
      'connection:view:own', 'connection:create:own', 'connection:manage:own',
      'notification:view:own',
    ].map((perm) => ({
      roleId: insertedRoles.find((r) => r.name === 'user')!.id,
      permissionId: insertedPermissions.find((p) => p.name === perm)!.id,
    }));

    // Premium role (level 3) - User + Team collaboration permissions
    const premiumPermissions = [
      // All user permissions
      'dashboard:view:own',
      'profile:view:own', 'profile:edit:own',
      'calendar:view:own', 'calendar:create:own', 'calendar:edit:own', 'calendar:delete:own',
      'post:view:own', 'post:create:own', 'post:edit:own', 'post:delete:own', 'post:view:all',
      'message:view:own', 'message:send:own', 'message:delete:own',
      'connection:view:own', 'connection:create:own', 'connection:manage:own',
      'notification:view:own',
      // Premium features
      'team:view:team', 'team:create:own', 'team:edit:team', 'team:manage:team', 'team:delete:team',
      'team_member:view:team', 'team_member:invite:team', 'team_member:manage:team', 'team_member:delete:team',
      'project:view:team', 'project:create:team', 'project:edit:team', 'project:delete:team',
      'analytics:view:own', 'analytics:view:team',
      'support:create:own',
    ].map((perm) => ({
      roleId: insertedRoles.find((r) => r.name === 'premium')!.id,
      permissionId: insertedPermissions.find((p) => p.name === perm)!.id,
    }));

    // Admin role (level 4) - Premium + Content & user management
    const adminPermissions = [
      // All premium permissions
      'dashboard:view:own',
      'profile:view:own', 'profile:edit:own',
      'calendar:view:own', 'calendar:create:own', 'calendar:edit:own', 'calendar:delete:own',
      'post:view:own', 'post:create:own', 'post:edit:own', 'post:delete:own', 'post:view:all',
      'message:view:own', 'message:send:own', 'message:delete:own',
      'connection:view:own', 'connection:create:own', 'connection:manage:own',
      'notification:view:own',
      'team:view:team', 'team:create:own', 'team:edit:team', 'team:manage:team', 'team:delete:team', 'team:manage:all',
      'team_member:view:team', 'team_member:invite:team', 'team_member:manage:team', 'team_member:delete:team',
      'project:view:team', 'project:create:team', 'project:edit:team', 'project:delete:team', 'project:manage:all',
      'analytics:view:own', 'analytics:view:team',
      'support:create:own',
      // Admin features
      'post:manage:all', 'post:moderate:all',
      'landing_page:view:all', 'landing_page:create:all', 'landing_page:edit:all', 'landing_page:delete:all', 'landing_page:manage:all', 'landing_page:publish:all',
      'media:view:all', 'media:upload:all', 'media:manage:all', 'media:delete:all',
      'user:view:all', 'user:create:all', 'user:edit:all', 'user:suspend:all', 'user:delete:all', 'user:manage:all',
      'activity:view:all', 'activity:monitor:all',
      'report:view:all', 'report:export:all',
    ].map((perm) => ({
      roleId: insertedRoles.find((r) => r.name === 'admin')!.id,
      permissionId: insertedPermissions.find((p) => p.name === perm)!.id,
    }));

    // Superadmin role (level 5) - All permissions
    const superadminPermissions = insertedPermissions.map((permission) => ({
      roleId: insertedRoles.find((r) => r.name === 'superadmin')!.id,
      permissionId: permission.id,
    }));

    const rolePermissionsData = [
      ...userPermissions,
      ...premiumPermissions,
      ...adminPermissions,
      ...superadminPermissions,
    ];

    await db.insert(rolePermissions).values(rolePermissionsData);
    console.log(`✅ Assigned permissions to roles\n`);

    // 4. Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);

    const [adminUser] = await db
      .insert(users)
      .values({
        email: 'admin@example.com',
        emailVerified: new Date(),
        name: 'System Admin',
        image: null,
      })
      .returning();

    // Create email account for admin
    await db.insert(accounts).values({
      userId: adminUser.id,
      type: 'credentials',
      provider: 'email',
      providerAccountId: adminUser.email,
      password: hashedPassword,
    });

    // Assign superadmin role
    await db.insert(userRoles).values({
      userId: adminUser.id,
      roleId: insertedRoles.find((r) => r.name === 'superadmin')!.id,
    });

    console.log(`✅ Created admin user: ${adminUser.email}`);
    console.log(`   Password: Admin@123456\n`);

    console.log('🎉 Database seeded successfully!\n');
    console.log('📋 Summary:');
    console.log(`   - Roles: ${insertedRoles.length}`);
    console.log(`   - Permissions: ${insertedPermissions.length}`);
    console.log(`   - Admin user: ${adminUser.email}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:');
    console.error(error);
    process.exit(1);
  }
}

seed();
