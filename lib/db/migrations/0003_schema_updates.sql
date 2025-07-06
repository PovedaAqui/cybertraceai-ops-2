-- Update user table to use Auth0 user IDs
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_id_key";
ALTER TABLE "user" ALTER COLUMN "id" TYPE varchar(255);
ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;

-- Update chat table to reference the new user ID type
ALTER TABLE "chat" DROP CONSTRAINT IF EXISTS "chat_userId_user_id_fk";
ALTER TABLE "chat" ALTER COLUMN "userId" TYPE varchar(255);
ALTER TABLE "chat" ALTER COLUMN "createdAt" SET DEFAULT now();
ALTER TABLE "chat" ADD CONSTRAINT "chat_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;

-- Update message table to use AI SDK message IDs
ALTER TABLE "message" ALTER COLUMN "id" TYPE varchar(255);
ALTER TABLE "message" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "message" ALTER COLUMN "createdAt" SET DEFAULT now();