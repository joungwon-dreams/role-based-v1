/**
 * Check User Account Script
 *
 * This script checks user account information
 */

import { db } from '../db/index';
import { users, accounts } from '../db/schema/index';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: resolve(__dirname, '../../../.env.local') });

async function checkUser() {
  console.log('🔍 Checking user accounts...\n');

  try {
    // Check superadmin@willydreams.com
    const superadminUser = await db.query.users.findFirst({
      where: eq(users.email, 'superadmin@willydreams.com'),
    });

    if (superadminUser) {
      console.log('✅ Found superadmin@willydreams.com:');
      console.log(`   User ID: ${superadminUser.id}`);
      console.log(`   Email: ${superadminUser.email}`);
      console.log(`   Name: ${superadminUser.name}`);
      console.log(`   Email Verified: ${superadminUser.emailVerified ? 'Yes' : 'No'}`);
      // Get roles separately
      const userRolesData = await db.query.userRoles.findMany({
        where: eq(users.id, superadminUser.id),
      });
      console.log(`   Roles: ${userRolesData.length} role(s) assigned`);

      // Check account
      const account = await db.query.accounts.findFirst({
        where: eq(accounts.userId, superadminUser.id),
      });

      if (account) {
        console.log(`   Account Provider: ${account.provider}`);
        console.log(`   Has Password: ${account.password ? 'Yes' : 'No'}`);
      } else {
        console.log(`   ⚠️  No account found for this user`);
      }
    } else {
      console.log('❌ User superadmin@willydreams.com not found\n');
    }

    console.log('\n');

    // Check admin@example.com
    const adminUser = await db.query.users.findFirst({
      where: eq(users.email, 'admin@example.com'),
    });

    if (adminUser) {
      console.log('✅ Found admin@example.com:');
      console.log(`   User ID: ${adminUser.id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Email Verified: ${adminUser.emailVerified ? 'Yes' : 'No'}`);
      // Get roles separately
      const adminUserRolesData = await db.query.userRoles.findMany({
        where: eq(users.id, adminUser.id),
      });
      console.log(`   Roles: ${adminUserRolesData.length} role(s) assigned`);

      // Check account
      const account = await db.query.accounts.findFirst({
        where: eq(accounts.userId, adminUser.id),
      });

      if (account) {
        console.log(`   Account Provider: ${account.provider}`);
        console.log(`   Has Password: ${account.password ? 'Yes' : 'No'}`);
      } else {
        console.log(`   ⚠️  No account found for this user`);
      }
    } else {
      console.log('❌ User admin@example.com not found\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Check failed:');
    console.error(error);
    process.exit(1);
  }
}

checkUser();
