# CyberTraceAI-Ops

CybertraceAI-Ops is an open-source AI agent designed to simplify IT network observability through natural language interactions.

## 🚀 Ultra-Quick Start (Pre-built Image)

The fastest way to get CyberTrace AI running is using our pre-built Docker image from Docker Hub. No building required!

### Prerequisites

- Docker installed
- OpenRouter API key (for AI functionality)
- Google OAuth credentials (for authentication)

### 2-Step Instant Deployment

1. **Run with Docker Hub image**

   ```bash
   docker run -d \
     --name cybertraceai-app \
     -p 3000:3000 \
     -e NEXTAUTH_SECRET=your-super-secret-jwt-secret-here \
     -e AUTH_GOOGLE_ID=your_google_client_id \
     -e AUTH_GOOGLE_SECRET=your_google_client_secret \
     -e OPENROUTER_API_KEY=your_openrouter_api_key_here \
     -e SUZIEQ_API_ENDPOINT=http://host.docker.internal:8000/api/v2 \
     -e SUZIEQ_API_KEY=your_suzieq_api_key_here \
     luispoveda93/cybertraceai:latest
   ```

2. **Access the application**
   🎉 **Visit: [http://localhost:3000](http://localhost:3000)**

> **Note**: This single-container setup is perfect for quick testing. For production with database persistence, use the full Docker Compose setup below.

## 🚀 Full Stack Deployment with Docker Compose

For production deployments with persistent database and complete infrastructure:

### Prerequisites

- Docker and Docker Compose installed
- OpenRouter API key (for AI functionality)
- Google OAuth credentials (for authentication)

### 3-Step Complete Deployment

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

   # Generate a secure secret (use a strong random string in production)
   NEXTAUTH_SECRET=your-super-secret-jwt-secret-here

   # Required for SuzieQ network observability (update endpoint and key as needed)
   SUZIEQ_API_ENDPOINT=http://host.docker.internal:8000/api/v2
   SUZIEQ_API_KEY=your_suzieq_api_key_here
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker compose up -d
   ```

🎉 **Access the application at: [http://localhost:3000](http://localhost:3000)**

✨ **Fully Automated Setup**: Database migrations, schema creation, and authentication are configured automatically!

## 🧪 Verifying Your Deployment

### Quick Verification

Check if everything is working with these simple commands:

```bash
# Check if app is running
curl -f http://localhost:3000 && echo "✅ App is accessible"

# Check if database is ready
docker exec cybertraceai-db psql -U postgres -d cybertraceai -c "\dt" | grep -q "account" && echo "✅ Database tables ready"

# Check authentication setup
curl -s http://localhost:3000/api/auth/providers | grep -q "google" && echo "✅ Authentication configured"
```

### Automated Test Suite

Run the full test suite to verify everything is working:

```bash
./test-deployment.sh
```

This will check:

- All services are running and healthy
- Database connectivity and automated migrations
- Authentication system functionality
- SuzieQ MCP integration
- Application API endpoints
- Environment configuration

## 🏷️ Versions & Updates

### Available Versions

- **Latest**: `luispoveda93/cybertraceai:latest` (currently v0.2.0)
- **Specific**: `luispoveda93/cybertraceai:0.2.0` (stable release)
- **Development**: Built from source for latest features

### Upgrading

#### Docker Hub Image

```bash
# Pull latest version
docker pull luispoveda93/cybertraceai:latest

# Stop current container
docker stop cybertraceai-app
docker rm cybertraceai-app

# Run with new image
docker run -d \
  --name cybertraceai-app \
  -p 3000:3000 \
  [your environment variables] \
  luispoveda93/cybertraceai:latest
```

#### Docker Compose

```bash
# Pull latest images
docker compose pull

# Restart services with new images
docker compose up -d
```

### Version History

- **v0.2.0** (Latest): Enhanced MCP integration, improved Docker deployment, TypeScript fixes
- **v0.1.0**: Initial release with basic chat functionality and SuzieQ integration

## 📋 Commands

### User Commands

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

## 📚 Documentation

This README file provides user-focused instructions for running the application. For more detailed technical information, please see our other documentation files:

- **[CONTRIBUTING.md](CONTRIBUTING.md)**: A comprehensive guide for developers, including local setup, architecture overview, and contribution guidelines.
- **[CODE_TOUR.md](CODE_TOUR.md)**: A narrative walkthrough of the entire codebase, explaining how all the pieces fit together.
- **[API.md](API.md)**: Detailed reference documentation for all API endpoints.

## 🚨 Troubleshooting

### Common Issues

1. **Authentication not working**

   ```bash
   # Restart the app to retry database setup
   docker compose restart app

   # Check if database tables exist
   docker exec cybertraceai-db psql -U postgres -d cybertraceai -c "\dt"
   ```

2. **Port 3000 already in use**

   ```bash
   # Change port in docker-compose.yml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```

3. **Database connection errors**

   ```bash
   # Check database is running
   docker compose ps database

   # Check database logs
   docker compose logs database
   ```

4. **Missing environment variables**

   ```bash
   # Verify .env file has all required variables
   grep -E "(NEXTAUTH_SECRET|AUTH_GOOGLE_ID|AUTH_GOOGLE_SECRET|OPENROUTER_API_KEY)" .env
   ```

5. **Build failures**

   ```bash
   # Option 1: Use pre-built image (recommended)
   docker compose down
   # Edit docker-compose.yml to use: image: luispoveda93/cybertraceai:latest
   docker compose up -d

   # Option 2: Clean rebuild from source
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

6. **SuzieQ MCP connectivity issues**

   ```bash
   # Check if SuzieQ API is accessible from container
   docker exec cybertraceai-app nc -z host.docker.internal 8000

   # Verify API key is correct
   curl -H "Authorization: Bearer ${SUZIEQ_API_KEY}" http://host.docker.internal:8000/api/v2/device
   ```

7. **MCP Docker network issues**

   ```bash
   # Check if Docker Compose network exists (when using docker compose)
   docker network ls | grep cybertraceai

   # Check MCP network detection logs
   docker compose logs app | grep -E "(🌐|MCP Docker command)"

   # Force host networking for local development
   echo "MCP_DOCKER_NETWORK=host" >> .env

   # Use specific network name if auto-detection fails
   echo "MCP_DOCKER_NETWORK=cybertraceai-ops-2_cybertraceai_network" >> .env
   ```

8. **Docker permission denied errors**

   ```bash
   # Check Docker socket permissions
   ls -la /var/run/docker.sock

   # If needed, adjust Docker group GID to match host
   # Edit Dockerfile line 49 to match your system's docker GID
   ```

9. **MCP tools not responding**

   ```bash
   # Check application logs for MCP errors and network detection
   docker compose logs app | grep -i mcp

   # Verify Docker CLI is available in container
   docker exec cybertraceai-app docker --version

   # Test MCP network connectivity manually
   docker exec cybertraceai-app docker run --rm --network host alpine:latest nc -z host.docker.internal 8000
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
- Docker socket access is restricted to nextjs user with proper group permissions
- MCP containers run in isolated, temporary instances for security
- SuzieQ API communication uses bearer token authentication

## 🤝 Contributing

We welcome contributions! Please read our [**CONTRIBUTING.md**](CONTRIBUTING.md) to get started.

## 📄 License

[Apache 2.0](LICENSE)

## 📞 Support

For issues and questions:

- Check the troubleshooting section above
- Review Docker logs: `docker compose logs`
- Run tests: `./test-deployment.sh`
- Open an issue on GitHub

## 🙏 Special Thanks

Special thanks to Dinesh G Dutt, Justin Pietschand, and the entire SuzieQ team and contributors for creating the powerful network observability engine that powers CybertraceAI-Ops. Check out the suzieq project at [github.com/netenglabs/suzieq](https://github.com/netenglabs/suzieq).
