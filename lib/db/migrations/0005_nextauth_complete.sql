-- Complete NextAuth.js schema migration

-- First, let's drop existing constraints and recreate the user table properly
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "verificationToken" CASCADE;

-- Update user table structure for NextAuth.js
ALTER TABLE "user" DROP COLUMN IF EXISTS "password";
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "name" varchar(255);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "emailVerified" timestamp;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "image" varchar(255);

-- Modify user ID to be varchar if it's still UUID
DO $$
BEGIN
    -- Change user id type from UUID to varchar(255)
    ALTER TABLE "user" ALTER COLUMN "id" TYPE varchar(255);
    
    -- Update chat table foreign key
    ALTER TABLE "chat" ALTER COLUMN "userId" TYPE varchar(255);
EXCEPTION
    WHEN others THEN
        -- If the columns are already varchar, do nothing
        NULL;
END $$;

-- Create NextAuth.js tables
CREATE TABLE IF NOT EXISTS "account" (
    "userId" varchar(255) NOT NULL,
    "type" varchar(255) NOT NULL,
    "provider" varchar(255) NOT NULL,
    "providerAccountId" varchar(255) NOT NULL,
    "refresh_token" text,
    "access_token" text,
    "expires_at" bigint,
    "token_type" varchar(255),
    "scope" varchar(255),
    "id_token" text,
    "session_state" varchar(255),
    PRIMARY KEY ("provider", "providerAccountId"),
    CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "session" (
    "sessionToken" varchar(255) PRIMARY KEY,
    "userId" varchar(255) NOT NULL,
    "expires" timestamp NOT NULL,
    CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "verificationToken" (
    "identifier" varchar(255) NOT NULL,
    "token" varchar(255) NOT NULL,
    "expires" timestamp NOT NULL,
    PRIMARY KEY ("identifier", "token")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("userId");
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("userId");