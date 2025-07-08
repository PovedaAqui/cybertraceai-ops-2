-- Fix expires_at field type for NextAuth.js compatibility
ALTER TABLE "account" ALTER COLUMN "expires_at" TYPE text;