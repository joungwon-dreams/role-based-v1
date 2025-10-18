import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { users } from '../db/schema/core/users';
import { connections } from '../db/schema/features/connections';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

async function seedFriends() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('🔄 Starting friends seeding...');

  try {
    // First, ensure the connections table exists by running the migration SQL
    console.log('📋 Creating connections table...');

    await sql`
      DO $$ BEGIN
        CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'blocked', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "connections" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "requester_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "addressee_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "status" connection_status NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS "idx_connections_requester_id" ON "connections"("requester_id");`;
    await sql`CREATE INDEX IF NOT EXISTS "idx_connections_addressee_id" ON "connections"("addressee_id");`;
    await sql`CREATE INDEX IF NOT EXISTS "idx_connections_status" ON "connections"("status");`;
    await sql`CREATE INDEX IF NOT EXISTS "idx_connections_requester_status" ON "connections"("requester_id", "status");`;
    await sql`CREATE INDEX IF NOT EXISTS "idx_connections_addressee_status" ON "connections"("addressee_id", "status");`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS "idx_connections_unique_pair" ON "connections"(LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));`;

    console.log('✅ Connections table created');

    // Get first 11 users (superadmin + 10 friends)
    const allUsers = await db.select().from(users).limit(11);

    if (allUsers.length < 2) {
      console.log('❌ Not enough users in database. Need at least 2 users.');
      process.exit(1);
    }

    console.log(`📊 Found ${allUsers.length} users`);

    // Use first user as the main user (superadmin)
    const mainUser = allUsers[0];
    const friendUsers = allUsers.slice(1, 11); // Next 10 users

    console.log(`👤 Main user: ${mainUser.email}`);
    console.log(`👥 Creating ${friendUsers.length} friend connections...`);

    // Delete existing connections for clean slate
    await db.delete(connections).where(
      eq(connections.requesterId, mainUser.id)
    );
    await db.delete(connections).where(
      eq(connections.addresseeId, mainUser.id)
    );

    // Create friend connections (accepted status)
    let created = 0;
    for (const friend of friendUsers) {
      try {
        await db.insert(connections).values({
          requesterId: mainUser.id,
          addresseeId: friend.id,
          status: 'accepted',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✓ Added friend: ${friend.name || friend.email}`);
        created++;
      } catch (error: any) {
        if (error.message?.includes('duplicate')) {
          console.log(`⊘ Already friends: ${friend.name || friend.email}`);
        } else {
          console.error(`✗ Failed to add friend: ${friend.name || friend.email}`, error.message);
        }
      }
    }

    console.log(`\n✅ Successfully created ${created} friend connections!`);
    console.log(`👤 Main user (${mainUser.email}) now has ${created} friends`);

  } catch (error) {
    console.error('❌ Seeding failed:');
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

seedFriends();
