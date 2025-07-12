# CyberTrace AI

CyberTrace AI is a comprehensive network observability and AI chat platform that combines advanced AI models with network analysis capabilities through SuzieQ MCP integration.

## 🚀 Quick Start with Docker

The fastest way to get CyberTrace AI up and running is using Docker Compose. This will deploy the complete stack including the application, database, and SuzieQ MCP server.

### Prerequisites

- Docker and Docker Compose installed
- OpenRouter API key (for AI functionality)
- Google OAuth credentials (for authentication)

### 3-Step Deployment

1. **Clone and setup environment**
   ```bash
   git clone <repository-url>
   cd cybertraceai-ops-2
   cp .env.example .env
   ```

2. **Configure environment variables**
   Edit `.env` and set:
   ```bash
   # Required for AI functionality
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   
   # Required for authentication
   AUTH_GOOGLE_ID=your_google_client_id
   AUTH_GOOGLE_SECRET=your_google_client_secret
   
   # Generate a secure secret
   NEXTAUTH_SECRET=your-super-secret-jwt-secret-here
   ```

3. **Deploy with Docker**
   ```bash
   docker compose up -d
   ```

🎉 **Access the application at: [http://localhost:3000](http://localhost:3000)**

## 🧪 Testing Your Deployment

Run the automated test suite to verify everything is working:

```bash
./test-deployment.sh
```

This will check:
- All services are running and healthy
- Database connectivity and migrations
- SuzieQ MCP integration
- Application API endpoints
- Environment configuration

## 🏗️ Architecture

### Services

- **🌐 CyberTrace AI App** (`app`): Next.js application with AI chat and network observability
- **🗄️ PostgreSQL Database** (`database`): Stores chat history, user data, and sessions
- **📊 SuzieQ MCP Server** (`suzieq-mcp`): Network observability and analysis tools

### Features

- **AI Chat**: Powered by Claude 3.7 Sonnet and GPT-4o via OpenRouter
- **Network Observability**: SuzieQ MCP integration for network analysis
- **Authentication**: Google OAuth with NextAuth.js
- **Real-time Chat**: Persistent chat history with automatic title generation
- **Docker-First**: Optimized for containerized deployment

## 🛠️ Development

### Local Development (with Docker)

For development with hot reload:

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
- **SuzieQ MCP**: Network observability server
- **Optional**: Tavily API for web search

### Manual Setup (Non-Docker)

If you prefer running without Docker:

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Setup database**
   ```bash
   # Setup PostgreSQL and update POSTGRES_URL in .env
   pnpm db:generate
   pnpm db:migrate
   ```

3. **Run development server**
   ```bash
   pnpm dev --port 3000
   ```

## 📋 Commands

### Core Development
- `pnpm dev` - Start development server
- `pnpm build` - Build production version
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Database Operations
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Apply database migrations
- `pnpm update-chat-titles` - Update existing chat titles

### Docker Operations
- `docker compose up -d` - Start all services
- `docker compose down` - Stop all services
- `docker compose logs -f app` - View application logs
- `./test-deployment.sh` - Run deployment tests

## 🔧 Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### OpenRouter Setup

1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Create an account and generate an API key
3. Add the key to your `.env` file

## 🐳 Docker Details

### Container Images

- **App**: Multi-stage Node.js 18 Alpine with standalone Next.js build
- **Database**: PostgreSQL 15 Alpine with initialization scripts
- **SuzieQ MCP**: Official `mcp/suzieq-mcp` image for network observability

### Volumes

- `postgres_data`: Persistent database storage
- Application logs and configs are handled by containers

### Networking

- **Internal network**: `cybertraceai_network` for service communication
- **Exposed ports**: Only port 3000 for web access
- **Security**: Services communicate via internal hostnames

### Health Checks

All services include comprehensive health checks:
- HTTP endpoint monitoring
- Database connectivity
- MCP service availability
- Environment validation

## 📊 Monitoring

### Application Health

Check health status:
```bash
# Container health
docker ps

# Application health check
docker exec cybertraceai-app node healthcheck.js

# Service logs
docker compose logs -f
```

### Database Monitoring

```bash
# Database health
docker exec cybertraceai-db pg_isready -U postgres -d cybertraceai

# Database logs
docker compose logs database
```

## 🚨 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Change port in docker-compose.yml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```

2. **Database connection errors**
   ```bash
   # Check database is running
   docker compose ps database
   
   # Check database logs
   docker compose logs database
   ```

3. **SuzieQ MCP not responding**
   ```bash
   # Check MCP service
   docker compose ps suzieq-mcp
   
   # Check MCP logs
   docker compose logs suzieq-mcp
   ```

4. **Build failures**
   ```bash
   # Clean rebuild
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

### Reset Everything

To completely reset the deployment:
```bash
docker compose down -v  # Remove volumes
docker system prune -f  # Clean up
docker compose up -d --build  # Rebuild and start
```

## 🔐 Security

- All containers run as non-root users
- Database credentials are configurable
- API keys are managed via environment variables
- Internal service communication only
- Health checks monitor security-relevant services

## 📈 Production Deployment

For production deployment:

1. **Use production environment variables**
   ```bash
   cp .env.example .env.production
   # Edit with production values
   ```

2. **Enable HTTPS**
   - Configure reverse proxy (nginx/traefik)
   - Use SSL certificates
   - Update NEXTAUTH_URL

3. **Database security**
   - Use strong passwords
   - Configure backup strategy
   - Monitor database performance

4. **Monitoring**
   - Set up log aggregation
   - Configure health check alerts
   - Monitor resource usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `./test-deployment.sh`
5. Submit a pull request

## 📄 License

[Your License Here]

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review Docker logs: `docker compose logs`
- Run tests: `./test-deployment.sh`
- Open an issue on GitHub

---

**🌟 CyberTrace AI - Where AI meets Network Observability**