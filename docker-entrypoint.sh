#!/bin/sh
set -e

echo "🚀 Starting CyberTrace AI Docker Container..."

# Function to wait for database to be ready
wait_for_db() {
    echo "⏳ Waiting for database to be ready..."
    max_attempts=15
    attempt=1
    
    # Extract database host and port from POSTGRES_URL
    db_host=$(echo "$POSTGRES_URL" | sed -n 's|.*@\([^:]*\):\([0-9]*\)/.*|\1|p')
    db_port=$(echo "$POSTGRES_URL" | sed -n 's|.*@\([^:]*\):\([0-9]*\)/.*|\2|p')
    
    while [ $attempt -le $max_attempts ]; do
        # Use nc (netcat) to test database connectivity
        if nc -z "$db_host" "$db_port" 2>/dev/null; then
            echo "✅ Database is ready!"
            return 0
        fi
        
        echo "⏳ Database not ready yet (attempt $attempt/$max_attempts), waiting 2 seconds..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "⚠️ Database connectivity check timed out after $max_attempts attempts"
    echo "ℹ️ Continuing anyway - the application will handle database connections"
    return 0
}

# Function to run database migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    
    # Check if tables exist first
    echo "🔍 Checking if database tables exist..."
    tables_exist=$(PGPASSWORD="${POSTGRES_PASSWORD:-cybertraceai2024}" psql -h database -U postgres -d cybertraceai -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user', 'account', 'session');" 2>/dev/null | tr -d ' ')
    
    if [ "$tables_exist" = "3" ]; then
        echo "✅ Database tables already exist, skipping migrations"
        return 0
    fi
    
    echo "📋 Database tables missing, running migrations..."
    
    # Run SQL migrations directly in order
    for migration_file in lib/db/migrations/*.sql; do
        if [ -f "$migration_file" ]; then
            migration_name=$(basename "$migration_file")
            echo "▶ Applying migration: $migration_name"
            
            # Execute SQL migration
            if PGPASSWORD="${POSTGRES_PASSWORD:-cybertraceai2024}" psql -h database -U postgres -d cybertraceai -f "$migration_file" >/dev/null 2>&1; then
                echo "  ✅ $migration_name applied successfully"
            else
                echo "  ⚠️  $migration_name failed, continuing..."
            fi
        fi
    done
    
    # Verify essential tables exist after migration
    final_check=$(PGPASSWORD="${POSTGRES_PASSWORD:-cybertraceai2024}" psql -h database -U postgres -d cybertraceai -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user', 'account', 'session');" 2>/dev/null | tr -d ' ')
    
    if [ "$final_check" = "3" ]; then
        echo "✅ Database migrations completed successfully"
        echo "✅ Essential tables verified: user, account, session"
    else
        echo "⚠️  Migration verification failed, but continuing..."
        echo "ℹ️  Application will attempt to handle missing tables"
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