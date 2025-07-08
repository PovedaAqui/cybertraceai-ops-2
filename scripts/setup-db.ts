import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('POSTGRES_URL environment variable is not set.');
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function setupDatabase() {
  try {
    console.log('Setting up NextAuth.js database tables...');
    
    // Create the tables directly with SQL
    await sql`
      CREATE TABLE IF NOT EXISTS "account" (
        "userId" varchar(255) NOT NULL,
        "type" varchar(255) NOT NULL,
        "provider" varchar(255) NOT NULL,
        "providerAccountId" varchar(255) NOT NULL,
        "refresh_token" text,
        "access_token" text,
        "expires_at" text,
        "token_type" varchar(255),
        "scope" varchar(255),
        "id_token" text,
        "session_state" varchar(255),
        PRIMARY KEY ("provider", "providerAccountId")
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "sessionToken" varchar(255) PRIMARY KEY,
        "userId" varchar(255) NOT NULL,
        "expires" timestamp NOT NULL
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS "verificationToken" (
        "identifier" varchar(255) NOT NULL,
        "token" varchar(255) NOT NULL,
        "expires" timestamp NOT NULL,
        PRIMARY KEY ("identifier", "token")
      );
    `;
    
    // Update user table structure
    await sql`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS "name" varchar(255),
      ADD COLUMN IF NOT EXISTS "emailVerified" timestamp,
      ADD COLUMN IF NOT EXISTS "image" varchar(255);
    `;
    
    // Drop password column if it exists
    await sql`
      ALTER TABLE "user" DROP COLUMN IF EXISTS "password";
    `;
    
    // Add foreign key constraints
    await sql`
      ALTER TABLE "account" 
      DROP CONSTRAINT IF EXISTS "account_userId_fkey";
    `;
    
    await sql`
      ALTER TABLE "account" 
      ADD CONSTRAINT "account_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;
    `;
    
    await sql`
      ALTER TABLE "session" 
      DROP CONSTRAINT IF EXISTS "session_userId_fkey";
    `;
    
    await sql`
      ALTER TABLE "session" 
      ADD CONSTRAINT "session_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;
    `;
    
    // Check tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user', 'account', 'session', 'verificationToken');
    `;
    
    console.log('Tables found:', tables.map(t => t.table_name));
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await sql.end();
  }
}

setupDatabase();