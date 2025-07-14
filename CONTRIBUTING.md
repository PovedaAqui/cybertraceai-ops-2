# Contributing to CyberTraceAI-Ops

First off, thank you for considering contributing to CyberTraceAI-Ops! It's people like you that make open source such a great community. We welcome any and all contributions.

## How to Contribute

The contribution workflow is straightforward:

1.  **Fork the repository** on GitHub.
2.  **Create a feature branch** for your changes (`git checkout -b feature/my-new-feature`).
3.  **Make your changes**.
4.  **Test your changes** to ensure they don't break anything (`./test-deployment.sh`).
5.  **Commit your changes** (`git commit -am 'Add some feature'`).
6.  **Push to the branch** (`git push origin feature/my-new-feature`).
7.  **Submit a pull request**.

## Technical Documentation

To help you get started, we've prepared a suite of technical documents:

- **[Code Tour (`CODE_TOUR.md`)](CODE_TOUR.md)**: A detailed, narrative-style guide to the entire codebase. A great place to start to understand how all the pieces fit together.
- **[API Reference (`API.md`)](API.md)**: Comprehensive documentation for all API endpoints.

---

## Architecture

### Services

- **🌐 CyberTraceAI-Ops App** (`app`): Next.js application with AI chat and network observability
  - Includes Docker CLI for MCP container management
  - Direct integration with SuzieQ REST API
  - Real-time network device monitoring and analysis
- **🗄️ PostgreSQL Database** (`database`): Stores chat history, user data, and sessions
  - Automatic schema migrations and table creation
  - NextAuth.js session management with database strategy
- **📊 SuzieQ MCP Integration**: Dynamic MCP containers for network observability
  - **Auto-Detection**: Automatically detects Docker Compose networks or falls back to host networking
  - **Environment Adaptive**: Works seamlessly in both Docker deployment and local development
  - Connects to external SuzieQ REST API at `host.docker.internal:8000`
  - Provides network device discovery, interface monitoring, and BGP analysis
  - Temporary container approach for secure, isolated tool execution

### Features

- **AI Chat**: Powered by Claude 3.7 Sonnet and GPT-4o via OpenRouter (Optional)
- **Network Observability**: SuzieQ MCP integration for network analysis
- **Authentication**: Google OAuth with NextAuth.js (fully automated setup) (Easy to add more providers)
- **Real-time Chat**: Persistent chat history with automatic title generation
- **Docker-First**: Optimized for containerized deployment with zero-config database setup
- **Self-Healing**: Automatic database migrations and schema validation

## Development

### Development Options

#### Option 1: Pre-built Image Development

```bash
# Quick development setup with pre-built image
docker run -d \
  --name cybertraceai-dev \
  -p 3000:3000 \
  -e NODE_ENV=development \
  -e NEXTAUTH_SECRET=dev-secret \
  -e AUTH_GOOGLE_ID=your_google_client_id \
  -e AUTH_GOOGLE_SECRET=your_google_client_secret \
  -e OPENROUTER_API_KEY=your_openrouter_api_key \
  luispoveda93/cybertraceai:latest
```

#### Option 2: Local Development (Build from Source)

For development with hot reload and source code changes:

```bash
# Use development compose file
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Or for traditional development
pnpm install
pnpm dev
```

### Environment Variables

See `.env.example` for all available configuration options:

- **Database**: Auto-configured for Docker deployment
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: OpenRouter API for Claude/GPT models
- **SuzieQ MCP**: Network observability server with auto-detecting Docker network configuration
- **Docker Integration**: Docker CLI mounted for MCP container management with intelligent network detection

#### Required Environment Variables

```bash
# Core Application
NEXTAUTH_SECRET=your-secure-random-secret
POSTGRES_URL=postgresql://postgres:password@database:5432/cybertraceai

# Authentication
AUTH_GOOGLE_ID=your_google_oauth_client_id
AUTH_GOOGLE_SECRET=your_google_oauth_client_secret

# AI Integration
OPENROUTER_API_KEY=your_openrouter_api_key

# SuzieQ Network Observability
SUZIEQ_API_ENDPOINT=http://host.docker.internal:8000/api/v2
SUZIEQ_API_KEY=your_suzieq_api_key

# MCP Docker Network (Optional - auto-detects by default)
MCP_DOCKER_NETWORK=auto # Options: auto, host, or specific network name
```

### Manual Setup (Non-Docker)

If you prefer running without Docker:

1.  **Install dependencies**

    ```bash
    pnpm install
    ```

2.  **Setup database**

    ```bash
    # Setup PostgreSQL and update POSTGRES_URL in .env
    pnpm db:generate
    pnpm db:migrate
    ```

    _Note: Docker deployment handles database setup automatically_

3.  **Run development server**
    ```bash
    pnpm dev --port 3000
    ```

## Docker Details

### Container Images

- **App**: `luispoveda93/cybertraceai:latest` (or `luispoveda93/cybertraceai:0.2.0` for specific version)
  - Multi-stage Node.js 18 Alpine with standalone Next.js build
  - Available on Docker Hub for instant deployment
- **Database**: PostgreSQL 15 Alpine with initialization scripts
- **SuzieQ MCP**: Official `mcp/suzieq-mcp` image for network observability

### Volumes

- `postgres_data`: Persistent database storage
- Application logs and configs are handled by containers

### Networking

- **Internal network**: `cybertraceai_network` for service communication
- **MCP Network Detection**: Automatically detects Docker Compose networks or uses host networking
- **Adaptive Configuration**: Works in both Docker and local development environments
- **Exposed ports**: Only port 3000 for web access
- **Security**: Services communicate via internal hostnames

### Health Checks

All services include comprehensive health checks:

- HTTP endpoint monitoring
- Database connectivity
- MCP service availability
- Environment validation

## Production Deployment

For production deployment:

1.  **Use production environment variables**

    ```bash
    cp .env.example .env.production
    # Edit with production values
    ```

2.  **Enable HTTPS**

    - Configure reverse proxy (nginx/traefik)
    - Use SSL certificates
    - Update NEXTAUTH_URL

3.  **Database security**

    - Use strong passwords
    - Configure backup strategy
    - Monitor database performance

4.  **Monitoring**
    - Set up log aggregation
    - Configure health check alerts
    - Monitor resource usage
