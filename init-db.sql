-- CyberTrace AI Database Initialization Script
-- This script prepares the PostgreSQL database for the application

-- Set timezone to UTC for consistency
SET timezone = 'UTC';

-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Initializing CyberTrace AI database...';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'User: %', current_user;
    RAISE NOTICE 'Timestamp: %', now();
END $$;

-- Create application user if not exists (for production use)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cybertraceai') THEN
        CREATE ROLE cybertraceai WITH LOGIN PASSWORD 'cybertraceai2024';
        RAISE NOTICE 'Created application user: cybertraceai';
    ELSE
        RAISE NOTICE 'Application user already exists: cybertraceai';
    END IF;
END $$;

-- Grant necessary permissions to application user
GRANT CONNECT ON DATABASE cybertraceai TO cybertraceai;
GRANT USAGE ON SCHEMA public TO cybertraceai;
GRANT CREATE ON SCHEMA public TO cybertraceai;

-- Grant permissions on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cybertraceai;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cybertraceai;

-- Create a function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
    RAISE NOTICE 'Extensions created: uuid-ossp, pg_trgm';
    RAISE NOTICE 'Application migrations will be handled by the Next.js application';
END $$;