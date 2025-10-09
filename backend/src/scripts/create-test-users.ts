import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, accounts, userRoles, roles } from '../db/schema';
import { hashPassword } from '../utils/password';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

interface TestUser {
  email: string;
  password: string;
  name: string;
  roleName: string;
}

const testUsers: TestUser[] = [
  // 10 user accounts
  ...Array.from({ length: 10 }, (_, i) => ({
    email: i === 0 ? 'user@willydreams.com' : `user${i}@willydreams.com`,
    password: 'Password123',
    name: `User ${i === 0 ? '' : i}`,
    roleName: 'user',
  })),

  // 10 premium accounts
  ...Array.from({ length: 10 }, (_, i) => ({
    email: i === 0 ? 'premium@willydreams.com' : `premium${i}@willydreams.com`,
    password: 'Password123',
    name: `Premium User ${i === 0 ? '' : i}`,
    roleName: 'premium',
  })),

  // 10 admin accounts
  ...Array.from({ length: 10 }, (_, i) => ({
    email: i === 0 ? 'admin@willydreams.com' : `admin${i}@willydreams.com`,
    password: 'Password123',
    name: `Admin ${i === 0 ? '' : i}`,
    roleName: 'admin',
  })),

  // 10 superadmin accounts
  ...Array.from({ length: 10 }, (_, i) => ({
    email: i === 0 ? 'superadmin@willydreams.com' : `superadmin${i}@willydreams.com`,
    password: 'Password123',
    name: `Super Admin ${i === 0 ? '' : i}`,
    roleName: 'superadmin',
  })),
];

async function createTestUsers() {
  console.log('🚀 Creating test users...');

  let createdCount = 0;
  let skippedCount = 0;

  for (const testUser of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, testUser.email),
      });

      if (existingUser) {
        console.log(`⏭️  Skipping ${testUser.email} - already exists`);
        skippedCount++;
        continue;
      }

      // Hash password
      const hashedPassword = await hashPassword(testUser.password);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email: testUser.email,
          name: testUser.name,
          emailVerified: new Date(),
        })
        .returning();

      // Create account
      await db.insert(accounts).values({
        userId: newUser.id,
        type: 'credentials',
        provider: 'email',
        providerAccountId: testUser.email,
        password: hashedPassword,
      });

      // Assign role
      const role = await db.query.roles.findFirst({
        where: eq(roles.name, testUser.roleName),
      });

      if (role) {
        await db.insert(userRoles).values({
          userId: newUser.id,
          roleId: role.id,
        });
      }

      console.log(`✅ Created ${testUser.email} with role ${testUser.roleName}`);
      createdCount++;
    } catch (error) {
      console.error(`❌ Failed to create ${testUser.email}:`, error);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${createdCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Total: ${testUsers.length}`);
}

createTestUsers()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
