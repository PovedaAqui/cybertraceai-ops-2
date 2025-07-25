# Docker Configuration Guide

This document provides comprehensive information about the Docker setup for CyberTrace AI, including architecture details, security considerations, and troubleshooting.

**📚 Related Documentation:**
- [README.md](README.md) - Quick start deployment and basic troubleshooting
- [CODE_TOUR.md](CODE_TOUR.md) - Codebase architecture and development patterns
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development setup and contribution guidelines  
- [API.md](API.md) - Complete API reference documentation

## Overview

CyberTrace AI uses a multi-container Docker architecture with the following key components:

- **Application Container**: Next.js app with Docker CLI for MCP integration
- **Database Container**: PostgreSQL with automated migrations
- **Dynamic MCP Containers**: Temporary containers for SuzieQ network observability

## Container Architecture

### Application Container (`cybertraceai-app`)

**Base Image**: `node:18-alpine`
**Build Strategy**: Multi-stage build for optimized production image

#### Build Stages

1. **Dependencies Stage** (`deps`)
   - Installs pnpm and project dependencies
   - Uses `--frozen-lockfile` for reproducible builds

2. **Builder Stage** (`builder`)
   - Copies source code and builds Next.js application
   - Uses standalone output for minimal runtime footprint
   - Sets dummy POSTGRES_URL for build-time compatibility

3. **Runtime Stage** (`runner`)
   - Alpine Linux with essential tools: `netcat-openbsd`, `postgresql-client`, `docker-cli`
   - Non-root security with `nextjs:nodejs` user/group
   - Docker integration with proper group permissions

#### Security Features

- **Non-root Execution**: Runs as `nextjs` user (UID 1001)
- **Docker Group Access**: Added to docker group (GID 1001) for socket access
- **Minimal Surface**: Only includes necessary runtime dependencies
- **Health Checks**: Built-in application and database connectivity monitoring

#### Docker-in-Docker Integration

```dockerfile
# Install Docker CLI for MCP container management
RUN apk add --no-cache docker-cli

# Create docker group with matching host GID
RUN addgroup --gid 1001 docker && adduser nextjs docker
```

**Socket Mounting**:
```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

### Database Container (`cybertraceai-db`)

**Base Image**: `postgres:15-alpine`

#### Features

- **Health Checks**: PostgreSQL readiness monitoring
- **Persistent Storage**: Volume-mounted data directory
- **Migration Support**: Schema migrations via application container

#### Volume Configuration

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

## Environment Configuration

### Core Variables

```bash
# Database (auto-configured)
POSTGRES_URL=postgresql://postgres:cybertraceai2024@database:5432/cybertraceai

# Application
NODE_ENV=production
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-secret

# Authentication
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# AI Integration
OPENROUTER_API_KEY=your_openrouter_key

# SuzieQ Network Observability
SUZIEQ_API_ENDPOINT=http://host.docker.internal:8000/api/v2
SUZIEQ_API_KEY=your_suzieq_api_key
```

### Docker Compose Variables

Variables automatically configured by compose:

- `POSTGRES_URL`: Constructed using internal container hostnames
- `NEXTAUTH_URL`: Set for container environment
- Service discovery via internal DNS

## Networking

### Internal Network

**Network Name**: `cybertraceai_network`
**Driver**: Bridge

#### Service Communication

- **App ↔ Database**: Internal hostname `database:5432`
- **App ↔ Host Services**: `host.docker.internal` for SuzieQ API
- **External Access**: Only port 3000 exposed to host

### Security Considerations

- **Isolated Network**: Services communicate via internal network only
- **Minimal Exposure**: Only web port (3000) accessible from host
- **Host Communication**: Secure access to host services via `host.docker.internal`

## MCP Container Management

### Dynamic Container Spawning

The application spawns temporary Docker containers for MCP tools:

```typescript
// Example MCP container execution
const args = [
  'run', '--rm', '--network', 'host',
  '--env', `SUZIEQ_API_ENDPOINT=${process.env.SUZIEQ_API_ENDPOINT}`,
  '--env', `SUZIEQ_API_KEY=${process.env.SUZIEQ_API_KEY}`,
  'mcp/suzieq-mcp:latest'
];
```

#### Container Lifecycle

1. **Creation**: Spawned on-demand for tool execution
2. **Execution**: Runs specific network analysis task
3. **Cleanup**: Automatically removed with `--rm` flag
4. **Security**: Isolated execution environment

### Docker Socket Security

#### Permission Model

```dockerfile
# Create docker group matching host GID
RUN addgroup --gid 1001 docker && adduser nextjs docker
```

#### Best Practices

- **Least Privilege**: Only `nextjs` user has docker access
- **Group Matching**: Container docker GID matches host for permission alignment
- **Temporary Containers**: All MCP containers are ephemeral (`--rm`)
- **Network Isolation**: MCP containers use `--network host` for API access

## Health Checks

### Application Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1
```

**Checks**:
- HTTP server responsiveness
- Database connectivity
- Essential environment variables

### Database Health Check

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d cybertraceai"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

### Composite Health Check

The application container includes a comprehensive health check:

```yaml
test: ["CMD", "sh", "-c", "node healthcheck.js && psql -h database -U postgres -d cybertraceai -c 'SELECT 1 FROM account LIMIT 1' >/dev/null 2>&1"]
```

## Database Migrations

### Automated Migration System

Migrations run automatically via `docker-entrypoint.sh`:

1. **Connectivity Check**: Waits for database availability using `netcat`
2. **Table Verification**: Checks if essential tables exist
3. **Migration Execution**: Applies the initial schema SQL file directly via PostgreSQL
4. **Verification**: Confirms successful table creation with NextAuth.js and application tables

#### Migration Files

```bash
lib/db/migrations/
└── 0001_initial_nextauth_schema.sql
```

#### Manual Migration Override

For development:
```bash
# Skip automated migrations
docker exec cybertraceai-app pnpm db:migrate
```

## Build Optimization

### Multi-Stage Benefits

1. **Reduced Image Size**: Only runtime dependencies in final image
2. **Security**: Build tools not present in production container
3. **Performance**: Optimized for container startup time

### Layer Caching

Optimized for Docker layer caching:

```dockerfile
# Dependencies cached separately from source
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Source code in separate layer
COPY . .
RUN pnpm build
```

## Development vs Production

### Development Overrides

Use `docker-compose.dev.yml` for development:

```yaml
# Development-specific overrides
services:
  app:
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

### Production Optimizations

- **Standalone Build**: Next.js standalone output for minimal footprint
- **Health Monitoring**: Comprehensive health checks for reliability
- **Resource Limits**: Can be configured for production deployment

## Troubleshooting

### Common Issues

#### Docker Permission Denied

**Symptom**: `permission denied while trying to connect to the Docker daemon socket`

**Solution**:
```bash
# Check host docker group GID
getent group docker

# Update Dockerfile if needed
RUN addgroup --gid YOUR_HOST_DOCKER_GID docker
```

#### MCP Tools Not Working

**Symptom**: SuzieQ tools fail to execute

**Diagnosis**:
```bash
# Check Docker CLI availability
docker exec cybertraceai-app docker --version

# Check Docker socket access
docker exec cybertraceai-app docker ps

# Check SuzieQ API connectivity
docker exec cybertraceai-app nc -z host.docker.internal 8000
```

#### Advanced Database Troubleshooting

For basic database connectivity issues, see [README.md Troubleshooting](README.md#-troubleshooting).

**Advanced Diagnosis**:
```bash
# Check PostgreSQL internal metrics
docker exec cybertraceai-db psql -U postgres -d cybertraceai -c "SELECT * FROM pg_stat_activity;"

# Analyze database performance
docker exec cybertraceai-db psql -U postgres -d cybertraceai -c "SELECT query, state, query_start FROM pg_stat_activity WHERE state != 'idle';"
```

### Log Analysis

For basic log viewing and troubleshooting commands, see the [Troubleshooting section in README.md](README.md#-troubleshooting).

#### Advanced Log Analysis

```bash
# Advanced log filtering for production debugging
docker compose logs app | grep -E "(ERROR|FATAL|MCP.*failed)"

# Performance profiling logs
docker compose logs app | grep -E "(Performance|slow|timeout)"
```

### Performance Monitoring

#### Resource Usage

```bash
# Container resource usage
docker stats cybertraceai-app cybertraceai-db

# Disk usage
docker system df
```

#### Advanced Health Monitoring

```bash
# Detailed health check results and history
docker inspect cybertraceai-app | grep -A 10 Health

# Health check exit codes and timing
docker inspect cybertraceai-app | jq '.State.Health'
```

## Security Best Practices

### Container Security

1. **Non-root Execution**: All processes run as non-privileged users
2. **Minimal Images**: Alpine Linux base for reduced attack surface
3. **Read-only Filesystems**: Where possible, mount as read-only
4. **Secret Management**: Environment variables for sensitive data

### Docker Socket Security

1. **Group-based Access**: Docker group membership for controlled access
2. **Temporary Containers**: All MCP containers are ephemeral
3. **Network Isolation**: Container network isolation with selective host access

### Network Security

1. **Internal Communication**: Services communicate via internal network
2. **Minimal Exposure**: Only necessary ports exposed to host
3. **Host Service Access**: Controlled access via `host.docker.internal`

## Production Deployment

### Production Considerations

1. **Resource Limits**: Configure CPU/memory limits
2. **Restart Policies**: Use `unless-stopped` for reliability
3. **Log Management**: Configure log rotation and aggregation
4. **Backup Strategy**: Regular database backups
5. **Monitoring**: Health check alerts and metrics collection

### Scaling

For production scaling:

1. **Database**: Consider managed PostgreSQL services
2. **Application**: Multiple app container instances behind load balancer
3. **Storage**: External volume management for persistence
4. **MCP**: Consider dedicated MCP service pools for high load

---

**Note**: This configuration is optimized for development and small-scale production deployments. For enterprise deployments, consider additional security hardening, monitoring, and scaling strategies.