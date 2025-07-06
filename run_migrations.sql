-- Run these SQL commands manually in your PostgreSQL database

-- Add content field to message table
ALTER TABLE "message" ADD COLUMN IF NOT EXISTS "content" text;

-- Update user table to use Auth0 user IDs (if you want to support Auth0 later)
-- Note: This is commented out since it would require data migration
-- ALTER TABLE "user" ALTER COLUMN "id" TYPE varchar(255);
-- ALTER TABLE "chat" ALTER COLUMN "userId" TYPE varchar(255);

-- Set default timestamps
ALTER TABLE "chat" ALTER COLUMN "createdAt" SET DEFAULT now();
ALTER TABLE "message" ALTER COLUMN "createdAt" SET DEFAULT now();

-- Update message ID to support AI SDK message IDs (optional for now)
-- ALTER TABLE "message" ALTER COLUMN "id" TYPE varchar(255);
-- ALTER TABLE "message" ALTER COLUMN "id" DROP DEFAULT;