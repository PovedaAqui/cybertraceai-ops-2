-- Initial Schema: Complete NextAuth.js Integration
-- File: 0001_initial_nextauth_schema.sql
-- Purpose: Create all tables with NextAuth.js user-based varchar IDs from start
-- No UUIDs - all identity flows through NextAuth.js user identification

-- =============================================================================
-- NEXTAUTH.JS REQUIRED TABLES
-- =============================================================================

-- Users table - NextAuth.js manages user identity
CREATE TABLE "user" (
    id varchar(255) PRIMARY KEY,
    name varchar(255),
    email varchar(255) NOT NULL,
    "emailVerified" timestamp without time zone,
    image varchar(255)
);

-- OAuth accounts linked to users
CREATE TABLE account (
    "userId" varchar(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    type varchar(255) NOT NULL,
    provider varchar(255) NOT NULL,
    "providerAccountId" varchar(255) NOT NULL,
    refresh_token text,
    access_token text,
    expires_at text,
    token_type varchar(255),
    scope varchar(255),
    id_token text,
    session_state varchar(255),
    PRIMARY KEY (provider, "providerAccountId")
);

-- User sessions
CREATE TABLE session (
    "sessionToken" varchar(255) PRIMARY KEY,
    "userId" varchar(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    expires timestamp without time zone NOT NULL
);

-- Email verification tokens
CREATE TABLE "verificationToken" (
    identifier varchar(255) NOT NULL,
    token varchar(255) NOT NULL,
    expires timestamp without time zone NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- =============================================================================
-- APPLICATION TABLES - NextAuth.js User-Based IDs
-- =============================================================================

-- Chat conversations linked to NextAuth.js users
-- ID format: ${userId}_${timestamp}
CREATE TABLE chat (
    id varchar(255) PRIMARY KEY,
    "createdAt" timestamp without time zone DEFAULT now(),
    title text,
    "userId" varchar(255) REFERENCES "user"(id) ON DELETE CASCADE,
    visibility varchar DEFAULT 'private'
);

-- Messages within chats
-- ID format: ${chatId}_${sequenceNumber}
CREATE TABLE message (
    id varchar(255) PRIMARY KEY,
    "chatId" varchar(255) REFERENCES chat(id) ON DELETE CASCADE,
    role varchar,
    content text,
    parts json,
    attachments json,
    "createdAt" timestamp without time zone DEFAULT now()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- NextAuth.js performance indexes
CREATE INDEX user_email_idx ON "user"(email);
CREATE INDEX account_user_id_idx ON account("userId");
CREATE INDEX session_user_id_idx ON session("userId");

-- Application performance indexes
CREATE INDEX chat_user_id_idx ON chat("userId");
CREATE INDEX chat_created_at_idx ON chat("createdAt");
CREATE INDEX message_chat_id_idx ON message("chatId");
CREATE INDEX message_created_at_idx ON message("createdAt");

-- =============================================================================
-- VERIFICATION AND COMPLETION
-- =============================================================================

-- Verify schema is correct
DO $$
BEGIN
    -- Verify no UUID columns exist anywhere
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE data_type = 'uuid'
    ) THEN
        RAISE EXCEPTION 'FAILED: UUID columns detected - schema should be pure varchar';
    END IF;

    -- Verify all required tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user') THEN
        RAISE EXCEPTION 'FAILED: user table missing';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat') THEN
        RAISE EXCEPTION 'FAILED: chat table missing';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message') THEN
        RAISE EXCEPTION 'FAILED: message table missing';
    END IF;

    -- Verify chat.id is varchar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat' 
        AND column_name = 'id' 
        AND data_type = 'character varying'
    ) THEN
        RAISE EXCEPTION 'FAILED: chat.id is not varchar';
    END IF;

    -- Verify message.chatId is varchar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'message' 
        AND column_name = 'chatId' 
        AND data_type = 'character varying'
    ) THEN
        RAISE EXCEPTION 'FAILED: message.chatId is not varchar';
    END IF;

    RAISE NOTICE 'SUCCESS: NextAuth.js schema initialized perfectly';
    RAISE NOTICE 'All identity flows through NextAuth.js user IDs';
    RAISE NOTICE 'Chat IDs format: ${userId}_${timestamp}';
    RAISE NOTICE 'Message IDs format: ${chatId}_${sequence}';
    RAISE NOTICE 'No UUIDs anywhere in the schema';
    RAISE NOTICE 'Database ready for immediate use';
END $$;