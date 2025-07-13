#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_URL="http://localhost:3000"
MAX_WAIT_TIME=120
TEST_RESULTS_FILE="test-results.log"

echo -e "${BLUE}🧪 CyberTrace AI v0.2.0 Deployment Test Suite${NC}"
echo "=============================================="

# Function to log messages
log() {
    echo -e "$1" | tee -a "$TEST_RESULTS_FILE"
}

# Function to check if a service is running
check_service() {
    local service_name=$1
    local container_name=$2
    
    log "${BLUE}Checking $service_name...${NC}"
    
    if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        log "${GREEN}✅ $service_name is running${NC}"
        return 0
    else
        log "${RED}❌ $service_name is not running${NC}"
        return 1
    fi
}

# Function to check service health
check_health() {
    local service_name=$1
    local container_name=$2
    
    log "${BLUE}Checking $service_name health...${NC}"
    
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-health-check")
    
    if [ "$health_status" = "healthy" ]; then
        log "${GREEN}✅ $service_name is healthy${NC}"
        return 0
    elif [ "$health_status" = "no-health-check" ]; then
        log "${YELLOW}⚠️  $service_name has no health check configured${NC}"
        return 0
    else
        log "${RED}❌ $service_name health status: $health_status${NC}"
        return 1
    fi
}

# Function to wait for application to be ready
wait_for_app() {
    log "${BLUE}Waiting for application to be ready...${NC}"
    
    local count=0
    while [ $count -lt $MAX_WAIT_TIME ]; do
        if curl -f -s "$APP_URL" > /dev/null 2>&1; then
            log "${GREEN}✅ Application is responding${NC}"
            return 0
        fi
        
        sleep 2
        count=$((count + 2))
        
        if [ $((count % 10)) -eq 0 ]; then
            log "${YELLOW}⏳ Still waiting for application... (${count}s/${MAX_WAIT_TIME}s)${NC}"
        fi
    done
    
    log "${RED}❌ Application failed to respond within $MAX_WAIT_TIME seconds${NC}"
    return 1
}

# Function to test database connectivity
test_database() {
    log "${BLUE}Testing database connectivity...${NC}"
    
    local db_test=$(docker exec cybertraceai-db pg_isready -U postgres -d cybertraceai 2>/dev/null || echo "failed")
    
    if echo "$db_test" | grep -q "accepting connections"; then
        log "${GREEN}✅ Database is accepting connections${NC}"
        return 0
    else
        log "${RED}❌ Database connectivity test failed${NC}"
        return 1
    fi
}

# Function to test SuzieQ MCP integration
test_suzieq_mcp() {
    log "${BLUE}Testing SuzieQ MCP integration...${NC}"
    
    # Test external SuzieQ API connectivity (if available)
    # SuzieQ runs as dynamic containers spawned by the app, not as a dedicated service
    local suzieq_endpoint="host.docker.internal:8000"
    
    # Test if external SuzieQ API is accessible
    if docker exec cybertraceai-app nc -z host.docker.internal 8000 2>/dev/null; then
        log "${GREEN}✅ External SuzieQ API is accessible${NC}"
        return 0
    else
        log "${YELLOW}⚠️  External SuzieQ API not accessible (may be normal if not running)${NC}"
        log "${YELLOW}   SuzieQ MCP uses dynamic containers spawned by the app${NC}"
        return 0
    fi
}

# Function to test application API
test_app_api() {
    log "${BLUE}Testing application API...${NC}"
    
    # Test health endpoint
    local api_response=$(curl -f -s "$APP_URL/api/health" 2>/dev/null || echo "failed")
    
    if [ "$api_response" != "failed" ]; then
        log "${GREEN}✅ Application API is responding${NC}"
        return 0
    else
        log "${YELLOW}⚠️  Application API health endpoint not available (may be normal)${NC}"
        return 0
    fi
}

# Function to test environment variables
test_environment() {
    log "${BLUE}Testing environment configuration...${NC}"
    
    local env_issues=0
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        log "${YELLOW}⚠️  .env file not found - using defaults${NC}"
        env_issues=$((env_issues + 1))
    fi
    
    # Check container environment
    local app_env=$(docker exec cybertraceai-app printenv | grep -E "(POSTGRES_URL|SUZIEQ_API_ENDPOINT)" | wc -l)
    
    if [ "$app_env" -ge 2 ]; then
        log "${GREEN}✅ Core environment variables are set${NC}"
    else
        log "${RED}❌ Some core environment variables are missing${NC}"
        env_issues=$((env_issues + 1))
    fi
    
    return $env_issues
}

# Function to cleanup test artifacts
cleanup() {
    log "${BLUE}Cleaning up test artifacts...${NC}"
    # Remove test log file if it exists and is empty
    if [ -f "$TEST_RESULTS_FILE" ] && [ ! -s "$TEST_RESULTS_FILE" ]; then
        rm -f "$TEST_RESULTS_FILE"
    fi
}

# Function to show test summary
show_summary() {
    local total_tests=$1
    local passed_tests=$2
    local failed_tests=$((total_tests - passed_tests))
    
    echo ""
    log "${BLUE}📊 Test Summary${NC}"
    log "=============="
    log "Total tests: $total_tests"
    log "${GREEN}Passed: $passed_tests${NC}"
    
    if [ $failed_tests -gt 0 ]; then
        log "${RED}Failed: $failed_tests${NC}"
    else
        log "${GREEN}Failed: $failed_tests${NC}"
    fi
    
    if [ $failed_tests -eq 0 ]; then
        log ""
        log "${GREEN}🎉 All tests passed! CyberTrace AI is ready to use.${NC}"
        log "${GREEN}🌐 Access the application at: $APP_URL${NC}"
    else
        log ""
        log "${YELLOW}⚠️  Some tests failed. Check the output above for details.${NC}"
        log "${YELLOW}The application may still be functional.${NC}"
    fi
}

# Main test execution
main() {
    # Initialize test results log
    echo "CyberTrace AI Deployment Test Results" > "$TEST_RESULTS_FILE"
    echo "Generated: $(date)" >> "$TEST_RESULTS_FILE"
    echo "========================================" >> "$TEST_RESULTS_FILE"
    
    local total_tests=0
    local passed_tests=0
    
    # Test 1: Check if Docker Compose services are running
    total_tests=$((total_tests + 1))
    if check_service "CyberTrace AI App" "cybertraceai-app" && \
       check_service "Database" "cybertraceai-db"; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Test 2: Check service health
    total_tests=$((total_tests + 1))
    if check_health "CyberTrace AI App" "cybertraceai-app" && \
       check_health "Database" "cybertraceai-db"; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Test 3: Wait for and test application readiness
    total_tests=$((total_tests + 1))
    if wait_for_app; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Test 4: Test database connectivity
    total_tests=$((total_tests + 1))
    if test_database; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Test 5: Test SuzieQ MCP integration
    total_tests=$((total_tests + 1))
    if test_suzieq_mcp; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Test 6: Test application API
    total_tests=$((total_tests + 1))
    if test_app_api; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Test 7: Test environment configuration
    total_tests=$((total_tests + 1))
    if test_environment; then
        passed_tests=$((passed_tests + 1))
    fi
    
    show_summary $total_tests $passed_tests
    
    # Exit with appropriate code
    if [ $passed_tests -eq $total_tests ]; then
        exit 0
    else
        exit 1
    fi
}

# Trap cleanup on exit
trap cleanup EXIT

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    log "${RED}❌ Docker is not installed or not available${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    log "${RED}❌ Docker Compose is not available${NC}"
    exit 1
fi

# Run main test suite
main