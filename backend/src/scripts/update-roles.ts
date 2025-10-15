/**
 * Update User Roles Script
 *
 * This script updates user roles in the database:
 * 1. Change superadmin@willydreams.com from 'user' to 'superadmin'
 * 2. Change admin@example.com from 'superadmin' to 'user'
 */

import { db } from '../db/index';
import { users, userRoles, roles } from '../db/schema/index';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: resolve(__dirname, '../../../.env.local') });

async function updateRoles() {
  console.log('🔄 Updating user roles...\n');

  try {
    // 1. Get users
    const superadminUser = await db.query.users.findFirst({
      where: eq(users.email, 'superadmin@willydreams.com'),
    });

    const adminUser = await db.query.users.findFirst({
      where: eq(users.email, 'admin@example.com'),
    });

    if (!superadminUser) {
      console.log('❌ User superadmin@willydreams.com not found');
      process.exit(1);
    }

    if (!adminUser) {
      console.log('❌ User admin@example.com not found');
      process.exit(1);
    }

    // 2. Get roles
    const superadminRole = await db.query.roles.findFirst({
      where: eq(roles.name, 'superadmin'),
    });

    const userRole = await db.query.roles.findFirst({
      where: eq(roles.name, 'user'),
    });

    if (!superadminRole || !userRole) {
      console.log('❌ Required roles not found in database');
      process.exit(1);
    }

    console.log('📋 Current state:');
    console.log(`   superadmin@willydreams.com: user (${superadminUser.id})`);
    console.log(`   admin@example.com: superadmin (${adminUser.id})\n`);

    // 3. Update superadmin@willydreams.com to superadmin role
    await db
      .update(userRoles)
      .set({ roleId: superadminRole.id })
      .where(eq(userRoles.userId, superadminUser.id));

    console.log('✅ Updated superadmin@willydreams.com to superadmin role');

    // 4. Update admin@example.com to user role
    await db
      .update(userRoles)
      .set({ roleId: userRole.id })
      .where(eq(userRoles.userId, adminUser.id));

    console.log('✅ Updated admin@example.com to user role\n');

    // 5. Verify changes
    console.log('🔍 Verifying changes...\n');

    const updatedSuperadminUserRole = await db.query.userRoles.findFirst({
      where: eq(userRoles.userId, superadminUser.id),
    });

    const updatedAdminUserRole = await db.query.userRoles.findFirst({
      where: eq(userRoles.userId, adminUser.id),
    });

    const verifiedSuperadminRole = await db.query.roles.findFirst({
      where: eq(roles.id, updatedSuperadminUserRole!.roleId),
    });

    const verifiedAdminRole = await db.query.roles.findFirst({
      where: eq(roles.id, updatedAdminUserRole!.roleId),
    });

    console.log('📋 Updated state:');
    console.log(`   superadmin@willydreams.com: ${verifiedSuperadminRole?.name} (level ${verifiedSuperadminRole?.level})`);
    console.log(`   admin@example.com: ${verifiedAdminRole?.name} (level ${verifiedAdminRole?.level})\n`);

    console.log('🎉 Role update completed successfully!\n');
    console.log('⚠️  Users need to log out and log back in for changes to take effect.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Role update failed:');
    console.error(error);
    process.exit(1);
  }
}

updateRoles();
