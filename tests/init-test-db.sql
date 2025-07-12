-- Test database initialization script
-- This script prepares the test database for CyberTrace AI testing

-- Set timezone
SET timezone = 'UTC';

-- Create test-specific extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Initializing CyberTrace AI test database...';
END $$;

-- Create a test user if it doesn't exist (for testing purposes)
DO $$
BEGIN
    -- This will be handled by the application migrations
    RAISE NOTICE 'Test database initialization completed';
END $$;