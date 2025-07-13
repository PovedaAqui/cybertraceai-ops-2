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

## 🏗️ Architecture

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

## 🛠️ Development

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
MCP_DOCKER_NETWORK=auto  # Options: auto, host, or specific network name
```

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

   _Note: Docker deployment handles database setup automatically_

3. **Run development server**
   ```bash
   pnpm dev --port 3000
   ```

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

### Core Development

- `pnpm dev` - Start development server
- `pnpm build` - Build production version
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Database Operations

- `pnpm db:generate` - Generate database migrations (for development)
- `pnpm db:migrate` - Apply database migrations (for development)
- `pnpm update-chat-titles` - Update existing chat titles
- **Note**: Docker deployment handles migrations automatically

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

Apache 2.0

## 📞 Support

For issues and questions:

- Check the troubleshooting section above
- Review Docker logs: `docker compose logs`
- Run tests: `./test-deployment.sh`
- Open an issue on GitHub

## 🙏 Special Thanks

Special thanks to Dinesh G Dutt, Justin Pietschand, and the entire SuzieQ team and contributors for creating the powerful network observability engine that powers CybertraceAI-Ops. Check out the suzieq project at [github.com/netenglabs/suzieq](https://github.com/netenglabs/suzieq).

# CyberTraceAI-Ops – Codebase Reference Guide

This document is a self-contained tour of the whole repository.  
Read it top-down to understand how the pieces fit, or jump to any
section when you need details on a particular file.

---

1. Big-picture overview

---

• Purpose – CyberTraceAI-Ops is a Next.js 14 (App-Router) application that lets operators
chat in natural language about the state of their network.  
 – It authenticates users with Google OAuth via NextAuth.  
 – Messages are streamed to Claude 3.5 Sonnet or GPT-4o through OpenRouter.  
 – Optional SuzieQ MCP containers are launched on-demand so the AI can run
network queries (via run*suzieq*\* tools).  
 – Chat history and user accounts live in a PostgreSQL database accessed with
Drizzle ORM.  
 – The whole stack ships in Docker / Docker-Compose for a “run and forget”
deployment.

• Runtime flow

1. Browser loads `/` ( `app/page.tsx` ).
2. React client establishes a NextAuth session (cookie‐based, db-stored).
3. When the user sends a message, `useChat` POSTs to `app/api/chat/route.ts`.
4. The route:  
   • ensures the user exists (`getOrCreateUser`)  
   • creates or retrieves a chat row  
   • streams AI completion (`streamText`) with the internal tool-set  
   • saves the assistant/user messages in `message` table
5. Results stream back to the browser; the sidebar is refreshed.

---

2. Technology stack at a glance

---

• UI – React 18, Next.js App Router, Tailwind CSS  
• State/UX – React Server Components, AI-SDK `useChat` hook  
• Auth – NextAuth + Drizzle adapter + Google OAuth  
• DB / ORM – PostgreSQL 15, Drizzle ORM, SQL migrations in `/lib/db/migrations`  
• AI providers – OpenRouter (Claude & GPT-4o), optional SuzieQ MCP docker  
• Tooling – pnpm, ESLint, PostCSS, Tailwind, Sonner toasts, Lucide icons  
• Deployment – Multi-stage Dockerfile + `docker-compose*.yml`

---

3. Directory & file map

---

```
<code_block_to_apply_from>
```

---

4. Detailed component reference

---

4.1 `app/` – routes & pages
–––––––––––––––––––––––––––
• `layout.tsx`  
 Global HTML wrapper. Loads `SessionProvider`, `ThemeProvider`
and the Sonner `<Toaster>` for notifications.

• `page.tsx`  
 Client-side chat screen. Uses `useChat` (from `@ai-sdk/react`) to
stream messages, toggles sidebar, and renders:  
 – `<SidebarToggle>` header button  
 – `<Sidebar>` (drawer) containing chat history  
 – `<MessagesList>` (scrolling message pane)  
 – `<ChatInput>` (stick-to-bottom textarea)

• `auth/signin/page.tsx` & `auth/error/page.tsx`  
 Branded sign-in UI and error fallback, populated with dynamic
NextAuth providers.

• API routes  
 – `api/auth/[...nextauth]/route.ts` – Thin wrapper exporting `authOptions`.  
 – `api/chat/route.ts` – Core chat endpoint (≈ 260 LOC):  
 • Validates session, creates chat row if needed  
 • Spawns optional SuzieQ MCP docker client  
 • Streams AI completion with tools (`humanize_timestamp_tool`, `table_tool`, plus MCP tools)  
 • Persists each message with `saveMessage`  
 – `api/chats/route.ts` – List & create chats for the signed-in user.  
 – `api/chats/[id]/route.ts` – GET/PATCH/DELETE single chat.

4.2 UI & domain components (`/components`)
–––––––––––––––––––––––––––––––––––––––––
• Chat flow  
 – `ChatInput.tsx` Resizable textarea, Shift+Enter newline, Enter send.  
 – `MessagesList.tsx` Iterates over AI-SDK messages array and delegates:  
 • Renders `<IndividualMessage>` for plain text.  
 • Renders `<TableDisplay>` for `table_tool` results.  
 • Wraps any other tool invocation in `<Accordion>` for collapsible
JSON inspection.  
 – `IndividualMessage.tsx` User vs assistant bubble with markdown &
“copy to clipboard” button (hook below).  
 – `ThinkingMessage.tsx` Animated “assistant is typing…” placeholder.

• Sidebar drawer (`components/sidebar/`)  
 – `sidebar.tsx` Sheet + internal scroll area.  
 – `sidebar-header.tsx` Title + “new chat” button.  
 – `chat-history.tsx` Grouped chat list (last 7 days, 30 days, older).  
 – `chat-item.tsx` Single row with dropdown menu (delete).  
 – `profile-section.tsx` Avatar, sign-in/out buttons (not expanded above).  
 – `sidebar-toggle.tsx` Hamburger used in mobile header.

• Generic widgets (`components/ui/`)  
 All exported via barrel for re-use (Button, DropdownMenu, Card, Table…).
Particularly:  
 – `table.tsx` – low-level semantic table skeleton (Tailwind).  
 – `table-display.tsx` – convenience renderer for `TableData`
generated by `lib/ai/tools/table.ts`.

• Providers  
 – `providers/session-provider.tsx` – Thin wrapper around
`<SessionProvider>` from NextAuth.  
 – `providers/theme-provider.tsx` – Simple light/dark toggle saved to
localStorage + HTML class.

• Hooks  
 – `useCopyMessageHandler.ts` – Handles the copy-to-clipboard toast logic.

4.3 `lib/`
––––––––––
• `auth.ts` – `createAuthOptions()` generates NextAuth config with:  
 – Google OAuth provider (IDs pulled from env)  
 – DrizzleAdapter → PostgreSQL session store  
 – `session` callback adds `user.id` to the JWT payload  
 – Custom sign-in / error pages mapping.

• `db/`  
 – `schema.ts` – Drizzle schema for `user`, `account`, `session`,
`verificationToken`, plus domain-specific `chat` & `message`.  
 – `queries.ts` – Safe wrapper functions (≈ 250 LOC) for common DB ops:  
 `getOrCreateUser`, `createChat`, `saveMessage`, `getChatMessages`, etc.  
 – `migrations/*` – raw SQL migration snippets.  
 – `index.ts` – Connection helper; lazily creates a shared Drizzle instance.

• `ai/`  
 – `prompts.ts` – Large SYSTEM prompt guiding the assistant how to
query SuzieQ and format results.  
 – `tools/table.ts` – Zod-validated AI tool that converts JSON arrays
into strongly-typed `TableData` used by the React renderer.  
 – `tools/humanize-timestamp.ts` – AI tool that converts epoch ms
to readable date strings.  
 – `tools/*` imported in the chat route; combined with MCP tools when
SuzieQ docker is available.

• `utils/chat-title.ts`  
 Heuristic that turns the first user message into a concise chat title,
plus `shouldUpdateTitle()` guard.

• `utils.ts`  
 `cn()` – Tailwind class-name merger (clsx + tailwind-merge).

4.4 `scripts/`
––––––––––––––
Small Node.js utilities run with `pnpm tsx`:  
 • `setup-db.ts` Initialises schema locally.  
 • `update-chat-titles.ts` Back-fills titles for existing rows.  
 • `fix-user-id.ts` Data-migration helper.

4.5 `tests/`
––––––––––––
`test-suite.js` spins up the full Docker stack and asserts:  
 – containers are healthy,  
 – NextAuth endpoints respond,  
 – DB tables exist,  
 – SuzieQ MCP commands succeed.  
Run via `./test-deployment.sh`.

---

5. Environment variables (superset)

---

| Variable                        | Purpose                                       |
| ------------------------------- | --------------------------------------------- |
| `NEXTAUTH_SECRET`               | Signed-cookie & JWT secret                    |
| `AUTH_GOOGLE_ID / SECRET`       | Google OAuth credentials                      |
| `POSTGRES_URL`                  | Drizzle/PostgreSQL connection string          |
| `OPENROUTER_API_KEY`            | Token to access Claude / GPT-4o               |
| `SUZIEQ_API_ENDPOINT`           | Base URL of SuzieQ REST API                   |
| `SUZIEQ_API_KEY`                | API key for the observability backend         |
| `MCP_DOCKER_NETWORK` (optional) | `auto` (default), `host`, or explicit network |

---

6. Build & deployment artefacts

---

• `Dockerfile` – multi-stage (builder → 90 MB alpine runtime).  
• `docker-compose.yml` – app + db + optional MCP.  
• `docker-compose.dev.yml` – mounts source, enables hot-reload.  
• `healthcheck.js` – node script invoked by container health-check.

---

7. Extending / modifying

---

• Add a new UI component → drop `.tsx` file under `components/` and import.  
• Add a new AI tool → create in `lib/ai/tools/`, export in the chat route’s
`tools` map.  
• Change DB schema → edit `lib/db/schema.ts`, run `pnpm db:generate` and
commit the new migration under `lib/db/migrations/`.

---

8. Glossary of key React components

---

| Component               | Responsibility (1-liner)                         |
| ----------------------- | ------------------------------------------------ |
| `ChatInput`             | Collects user text, auto-grows, sends on Enter   |
| `MessagesList`          | Scroll container rendering all message items     |
| `IndividualMessage`     | Markdown bubble + copy button                    |
| `ThinkingMessage`       | Animated “assistant is typing” placeholder       |
| `Sidebar`               | Drawer containing history + profile              |
| `ChatHistory`           | Groups chats by age, fetches via `/api/chats`    |
| `ChatItem`              | Single chat row with contextual delete menu      |
| `SidebarToggle`         | Mobile hamburger button                          |
| `TableDisplay`          | Turns `TableData` into a styled HTML table       |
| `ThemeProvider`         | Light/Dark mode toggle persisted to localStorage |
| `SessionProvider`       | NextAuth session context wrapper                 |
| `useCopyMessageHandler` | Clipboard helper with Sonner toast feedback      |

---

You now have a complete map of every directory and component in
CyberTraceAI-Ops. Happy hacking!

**🌟 CyberTraceAI-Ops - Asnwer wether simple or complex questions about your network using AI**
