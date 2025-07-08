import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('POSTGRES_URL environment variable is not set.');
}

const sql = postgres(connectionString);

async function fixUserIdType() {
  try {
    console.log('Fixing user ID type compatibility...');
    
    // First, drop foreign key constraints that depend on user.id
    await sql`ALTER TABLE "chat" DROP CONSTRAINT IF EXISTS "chat_userId_user_id_fk";`;
    await sql`ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_userId_fkey";`;
    await sql`ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_userId_fkey";`;
    
    console.log('Dropped existing foreign key constraints');
    
    // Convert user.id from UUID to VARCHAR(255)
    await sql`ALTER TABLE "user" ALTER COLUMN "id" TYPE varchar(255);`;
    console.log('Converted user.id to varchar(255)');
    
    // Convert chat.userId to VARCHAR(255) 
    await sql`ALTER TABLE "chat" ALTER COLUMN "userId" TYPE varchar(255);`;
    console.log('Converted chat.userId to varchar(255)');
    
    // Now recreate the foreign key constraints
    await sql`
      ALTER TABLE "chat" 
      ADD CONSTRAINT "chat_userId_user_id_fk" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL;
    `;
    console.log('Recreated chat foreign key constraint');
    
    await sql`
      ALTER TABLE "account" 
      ADD CONSTRAINT "account_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;
    `;
    console.log('Created account foreign key constraint');
    
    await sql`
      ALTER TABLE "session" 
      ADD CONSTRAINT "session_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;
    `;
    console.log('Created session foreign key constraint');
    
    // Verify the changes
    const userColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user' AND column_name = 'id';
    `;
    
    console.log('User ID column type:', userColumns[0]);
    console.log('Database type fixes completed successfully!');
    
  } catch (error) {
    console.error('Error fixing database types:', error);
  } finally {
    await sql.end();
  }
}

fixUserIdType();