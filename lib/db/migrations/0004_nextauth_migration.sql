-- Migration for NextAuth.js schema changes

-- Add new columns to user table
ALTER TABLE "user" ADD COLUMN "name" varchar(255);
ALTER TABLE "user" ADD COLUMN "emailVerified" timestamp;
ALTER TABLE "user" ADD COLUMN "image" varchar(255);

-- Change user id from UUID to varchar
ALTER TABLE "user" ALTER COLUMN "id" TYPE varchar(255);

-- Drop password column as it's not needed for NextAuth.js
ALTER TABLE "user" DROP COLUMN "password";

-- Create NextAuth.js required tables
CREATE TABLE "account" (
    "userId" varchar(255) NOT NULL,
    "type" varchar(255) NOT NULL,
    "provider" varchar(255) NOT NULL,
    "providerAccountId" varchar(255) NOT NULL,
    "refresh_token" text,
    "access_token" text,
    "expires_at" timestamp,
    "token_type" varchar(255),
    "scope" varchar(255),
    "id_token" text,
    "session_state" varchar(255),
    CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE "session" (
    "sessionToken" varchar(255) PRIMARY KEY,
    "userId" varchar(255) NOT NULL,
    "expires" timestamp NOT NULL,
    CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE "verificationToken" (
    "identifier" varchar(255) NOT NULL,
    "token" varchar(255) NOT NULL,
    "expires" timestamp NOT NULL
);

-- Update chat table to use varchar for userId
ALTER TABLE "chat" ALTER COLUMN "userId" TYPE varchar(255);