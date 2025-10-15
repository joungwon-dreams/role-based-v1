/**
 * Check User Permissions Script
 *
 * This script checks user permissions in the database
 */

import { db } from '../db/index';
import { users, roles, permissions, rolePermissions, userRoles } from '../db/schema/index';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: resolve(__dirname, '../../../.env.local') });

async function checkPermissions() {
  console.log('🔍 Checking user permissions...\n');

  try {
    // Check superadmin@willydreams.com
    const superadminUser = await db.query.users.findFirst({
      where: eq(users.email, 'superadmin@willydreams.com'),
    });

    if (superadminUser) {
      console.log('✅ Found superadmin@willydreams.com:');
      console.log(`   User ID: ${superadminUser.id}`);

      // Get user role
      const userRole = await db.query.userRoles.findFirst({
        where: eq(userRoles.userId, superadminUser.id),
      });

      if (userRole) {
        const role = await db.query.roles.findFirst({
          where: eq(roles.id, userRole.roleId),
        });

        console.log(`   Role: ${role?.name} (level ${role?.level})`);

        // Get all permissions for this role
        const rolePerms = await db.query.rolePermissions.findMany({
          where: eq(rolePermissions.roleId, userRole.roleId),
        });

        console.log(`   Permissions: ${rolePerms.length} permissions`);

        // Get sample permissions
        const samplePerms = await Promise.all(
          rolePerms.slice(0, 5).map(async (rp) => {
            const perm = await db.query.permissions.findFirst({
              where: eq(permissions.id, rp.permissionId),
            });
            return perm?.name;
          })
        );

        console.log(`   Sample permissions: ${samplePerms.join(', ')}...`);
      } else {
        console.log('   ⚠️  No role assigned');
      }
    } else {
      console.log('❌ User superadmin@willydreams.com not found');
    }

    console.log('\n');

    // Check admin@example.com
    const adminUser = await db.query.users.findFirst({
      where: eq(users.email, 'admin@example.com'),
    });

    if (adminUser) {
      console.log('✅ Found admin@example.com:');
      console.log(`   User ID: ${adminUser.id}`);

      // Get user role
      const userRole = await db.query.userRoles.findFirst({
        where: eq(userRoles.userId, adminUser.id),
      });

      if (userRole) {
        const role = await db.query.roles.findFirst({
          where: eq(roles.id, userRole.roleId),
        });

        console.log(`   Role: ${role?.name} (level ${role?.level})`);

        // Get all permissions for this role
        const rolePerms = await db.query.rolePermissions.findMany({
          where: eq(rolePermissions.roleId, userRole.roleId),
        });

        console.log(`   Permissions: ${rolePerms.length} permissions`);

        // Get sample permissions
        const samplePerms = await Promise.all(
          rolePerms.slice(0, 5).map(async (rp) => {
            const perm = await db.query.permissions.findFirst({
              where: eq(permissions.id, rp.permissionId),
            });
            return perm?.name;
          })
        );

        console.log(`   Sample permissions: ${samplePerms.join(', ')}...`);
      } else {
        console.log('   ⚠️  No role assigned');
      }
    } else {
      console.log('❌ User admin@example.com not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Check failed:');
    console.error(error);
    process.exit(1);
  }
}

checkPermissions();
