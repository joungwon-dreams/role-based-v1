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
      action: 'create' | 'read' | 'update' | 'delete' | 'list' | 'assign' | 'manage';
      scope: 'own' | 'team' | 'all';
      description: string;
    }> = [
      // User permissions
      { name: 'user:read:own', resource: 'user', action: 'read', scope: 'own', description: 'Read own profile' },
      { name: 'user:update:own', resource: 'user', action: 'update', scope: 'own', description: 'Update own profile' },
      { name: 'user:read:all', resource: 'user', action: 'read', scope: 'all', description: 'Read all users' },
      { name: 'user:update:all', resource: 'user', action: 'update', scope: 'all', description: 'Update any user' },
      { name: 'user:delete:all', resource: 'user', action: 'delete', scope: 'all', description: 'Delete any user' },
      { name: 'user:list:all', resource: 'user', action: 'list', scope: 'all', description: 'List all users' },

      // Post permissions
      { name: 'post:create:own', resource: 'post', action: 'create', scope: 'own', description: 'Create own posts' },
      { name: 'post:read:all', resource: 'post', action: 'read', scope: 'all', description: 'Read all posts' },
      { name: 'post:update:own', resource: 'post', action: 'update', scope: 'own', description: 'Update own posts' },
      { name: 'post:delete:own', resource: 'post', action: 'delete', scope: 'own', description: 'Delete own posts' },
      { name: 'post:manage:all', resource: 'post', action: 'manage', scope: 'all', description: 'Manage all posts' },

      // Team permissions
      { name: 'team:create:own', resource: 'team', action: 'create', scope: 'own', description: 'Create teams' },
      { name: 'team:read:team', resource: 'team', action: 'read', scope: 'team', description: 'Read team data' },
      { name: 'team:update:team', resource: 'team', action: 'update', scope: 'team', description: 'Update team' },
      { name: 'team:delete:team', resource: 'team', action: 'delete', scope: 'team', description: 'Delete team' },
      { name: 'team:manage:all', resource: 'team', action: 'manage', scope: 'all', description: 'Manage all teams' },

      // Project permissions
      { name: 'project:create:own', resource: 'project', action: 'create', scope: 'own', description: 'Create projects' },
      { name: 'project:read:team', resource: 'project', action: 'read', scope: 'team', description: 'Read team projects' },
      { name: 'project:update:own', resource: 'project', action: 'update', scope: 'own', description: 'Update own projects' },
      { name: 'project:delete:own', resource: 'project', action: 'delete', scope: 'own', description: 'Delete own projects' },
      { name: 'project:manage:all', resource: 'project', action: 'manage', scope: 'all', description: 'Manage all projects' },

      // Role permissions
      { name: 'role:read:all', resource: 'role', action: 'read', scope: 'all', description: 'Read all roles' },
      { name: 'role:assign:all', resource: 'role', action: 'assign', scope: 'all', description: 'Assign roles to users' },
      { name: 'role:manage:all', resource: 'role', action: 'manage', scope: 'all', description: 'Manage role system' },

      // Permission permissions
      { name: 'permission:read:all', resource: 'permission', action: 'read', scope: 'all', description: 'Read all permissions' },
      { name: 'permission:manage:all', resource: 'permission', action: 'manage', scope: 'all', description: 'Manage permissions' },

      // Database permissions
      { name: 'database:manage:all', resource: 'database', action: 'manage', scope: 'all', description: 'Database operations' },

      // Security permissions
      { name: 'security:manage:all', resource: 'security', action: 'manage', scope: 'all', description: 'Security policies' },
    ];

    const insertedPermissions = await db.insert(permissions).values(permissionsData).returning();
    console.log(`✅ Created ${insertedPermissions.length} permissions\n`);

    // 3. Assign permissions to roles
    console.log('Assigning permissions to roles...');
    const rolePermissionsData = [
      // User role (level 2) - Basic permissions
      ...['user:read:own', 'user:update:own'].map((perm) => ({
        roleId: insertedRoles.find((r) => r.name === 'user')!.id,
        permissionId: insertedPermissions.find((p) => p.name === perm)!.id,
      })),

      // Premium role (level 3) - User + Premium features
      ...['user:read:own', 'user:update:own', 'post:create:own', 'post:read:all', 'post:update:own', 'post:delete:own', 'team:create:own', 'team:read:team', 'team:update:team', 'project:create:own', 'project:read:team', 'project:update:own'].map((perm) => ({
        roleId: insertedRoles.find((r) => r.name === 'premium')!.id,
        permissionId: insertedPermissions.find((p) => p.name === perm)!.id,
      })),

      // Admin role (level 4) - User management + System operations
      ...['user:read:all', 'user:update:all', 'user:delete:all', 'user:list:all', 'post:manage:all', 'team:manage:all', 'project:manage:all', 'role:read:all', 'role:assign:all', 'permission:read:all'].map((perm) => ({
        roleId: insertedRoles.find((r) => r.name === 'admin')!.id,
        permissionId: insertedPermissions.find((p) => p.name === perm)!.id,
      })),

      // Superadmin role (level 5) - All permissions
      ...insertedPermissions.map((permission) => ({
        roleId: insertedRoles.find((r) => r.name === 'superadmin')!.id,
        permissionId: permission.id,
      })),
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
