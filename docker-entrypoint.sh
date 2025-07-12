#!/bin/sh
set -e

echo "🚀 Starting CyberTrace AI Docker Container..."

# Function to wait for database to be ready
wait_for_db() {
    echo "⏳ Waiting for database to be ready..."
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if node -e "
            const { Client } = require('pg');
            const client = new Client({
                connectionString: process.env.POSTGRES_URL
            });
            client.connect()
                .then(() => {
                    console.log('Database connection successful');
                    client.end();
                    process.exit(0);
                })
                .catch(() => {
                    process.exit(1);
                });
        " 2>/dev/null; then
            echo "✅ Database is ready!"
            return 0
        fi
        
        echo "⏳ Database not ready yet (attempt $attempt/$max_attempts), waiting 2 seconds..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ Database failed to become ready after $max_attempts attempts"
    exit 1
}

# Function to run database migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    
    if [ -f "lib/db/migrate.ts" ]; then
        # Run migrations using tsx (TypeScript execution)
        if command -v tsx >/dev/null 2>&1; then
            tsx lib/db/migrate.ts
        else
            # Fallback: try to run with node if compiled
            node lib/db/migrate.js 2>/dev/null || {
                echo "⚠️  Migration file found but couldn't execute. Continuing..."
            }
        fi
        echo "✅ Database migrations completed"
    else
        echo "ℹ️  No migration file found, skipping migrations"
    fi
}

# Function to validate environment variables
validate_env() {
    echo "🔍 Validating environment variables..."
    
    missing_vars=""
    
    # Check required environment variables
    if [ -z "$POSTGRES_URL" ]; then
        missing_vars="$missing_vars POSTGRES_URL"
    fi
    
    if [ -z "$NEXTAUTH_SECRET" ]; then
        missing_vars="$missing_vars NEXTAUTH_SECRET"
    fi
    
    # Warn about optional but recommended variables
    if [ -z "$OPENROUTER_API_KEY" ]; then
        echo "⚠️  OPENROUTER_API_KEY not set - AI functionality will be limited"
    fi
    
    if [ -z "$AUTH_GOOGLE_ID" ] || [ -z "$AUTH_GOOGLE_SECRET" ]; then
        echo "⚠️  Google OAuth not configured - authentication may not work"
    fi
    
    if [ -n "$missing_vars" ]; then
        echo "❌ Missing required environment variables:$missing_vars"
        echo "Please check your .env file or environment configuration"
        exit 1
    fi
    
    echo "✅ Environment validation passed"
}

# Function to show startup info
show_startup_info() {
    echo ""
    echo "🌟 CyberTrace AI Configuration:"
    echo "   - App URL: ${NEXTAUTH_URL:-http://localhost:3000}"
    echo "   - Database: ${POSTGRES_URL}"
    echo "   - SuzieQ MCP: ${SUZIEQ_API_ENDPOINT:-Not configured}"
    echo "   - OpenRouter: ${OPENROUTER_API_KEY:+Configured}"
    echo "   - Google OAuth: ${AUTH_GOOGLE_ID:+Configured}"
    echo ""
}

# Main execution
main() {
    validate_env
    show_startup_info
    wait_for_db
    run_migrations
    
    echo "🎯 Starting Next.js application..."
    echo "📱 Access the application at: ${NEXTAUTH_URL:-http://localhost:3000}"
    echo ""
    
    # Execute the command passed to the script (default: node server.js)
    exec "$@"
}

# Run main function with all arguments
main "$@"