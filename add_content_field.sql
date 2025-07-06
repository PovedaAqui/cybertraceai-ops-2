-- Add content field to message table
ALTER TABLE "message" ADD COLUMN IF NOT EXISTS "content" text;