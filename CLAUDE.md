# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `pnpm dev` - Start development server with Turbopack (preferred for development)
- `pnpm build` - Build production version
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Database Operations

- `pnpm db:generate` - Generate database migrations from schema changes
- `pnpm db:migrate` - Apply database migrations
- `pnpm update-chat-titles` - Update existing generic chat titles with meaningful names

### Package Management

Always use `pnpm` for package management. When adding shadcn/ui components: `pnpm dlx shadcn@latest add [component-name]`

## Architecture Overview

### Core Technology Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v4 with Google provider and database sessions
- **AI Integration**: Vercel AI SDK with OpenRouter (Claude 3.7 Sonnet primary model)
- **UI Components**: shadcn/ui with Radix UI primitives and Tailwind CSS
- **MCP Integration**: SuzieQ MCP server for network observability via Docker

### Database Schema

The application uses a chat-based structure with NextAuth.js integration:

- **Users**: Standard NextAuth tables (User, Account, Session, VerificationToken)
- **Chats**: Conversation metadata with automatic title generation
- **Messages**: Individual messages with support for tool calls and attachments

### Authentication Flow

- Google OAuth with database sessions (not JWT)
- Custom session callback adds user ID to session object
- Middleware allows all routes but auth is checked per API route
- Custom auth pages: `/auth/signin` and `/auth/error`

### AI Chat System

- **Chat API** (`/api/chat/route.ts`): Handles conversation flow with automatic chat creation and title generation
- **OpenRouter Integration**: Uses Claude 3.5 Sonnet as primary model with fallback to GPT-4o
- **MCP Tools**: Optional SuzieQ network observability tools via Docker
- **Chat Management**: Full CRUD operations via `/api/chats` endpoints

### UI Architecture

- **Main Chat Interface** (`app/page.tsx`): Central conversation view with useChat hook
- **Collapsible Sidebar**: Time-grouped chat history with profile management
- **Responsive Design**: Mobile-first with proper touch interactions
- **Component Structure**:
  - `components/sidebar/` - Chat history and navigation
  - `components/auth/` - Authentication components
  - `components/ui/` - shadcn/ui base components

## Key Implementation Details

### Chat Title Generation

New chats start as "New Chat" and automatically update to meaningful titles based on the first user message. The logic is in `lib/utils/chat-title.ts` with smart truncation at natural breaking points.

### State Management

- Chat state managed via useChat hook with custom extensions
- Current chat ID tracking for conversation switching
- Sidebar state for mobile responsiveness
- Automatic refresh triggers for real-time updates

### MCP Integration

Optional SuzieQ MCP server runs in Docker container when `SUZIEQ_API_ENDPOINT` and `SUZIEQ_API_KEY` are configured. The system gracefully degrades if MCP is unavailable.

### Error Handling

- Comprehensive try-catch blocks in API routes
- Graceful degradation for missing environment variables
- Detailed logging with emoji prefixes for easy identification

## Environment Setup

### Required Environment Variables

```bash
# Database
POSTGRES_URL=postgresql://...

# Authentication
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret

# AI Integration
OPENROUTER_API_KEY=your_openrouter_key

# Optional MCP Integration
SUZIEQ_API_ENDPOINT=your_suzieq_endpoint
SUZIEQ_API_KEY=your_suzieq_key
```

### Database Setup

1. Set up PostgreSQL database
2. Configure `POSTGRES_URL` in `.env.local`
3. Run `pnpm db:generate` to create initial migrations
4. Run `pnpm db:migrate` to apply migrations

## Development Patterns

### API Route Structure

All API routes require authentication checking via `getServerSession(authOptions)`. Chat-related routes include user ownership verification for security.

### Component Patterns

- Use `"use client"` directive for interactive components
- Implement proper loading and error states
- Follow shadcn/ui patterns for consistent styling
- Use TypeScript interfaces for all props

### Database Operations

All database operations go through `lib/db/queries.ts` with proper error handling and type safety. Use Drizzle ORM patterns with prepared statements where appropriate.

## Common Gotchas

### NextAuth Configuration

- Database sessions require the DrizzleAdapter
- Session callback must include user ID for database session strategy
- Custom pages override default NextAuth UI

### Chat State Management

- New chats start with null ID until first message is sent
- Title updates happen after user message is saved, not on chat creation
- Sidebar refresh triggers are essential for real-time updates

### MCP Integration

- MCP client initialization can fail and should be handled gracefully
- Docker containers for MCP tools require proper environment variable passing
- Always close MCP clients in the onFinish callback to prevent memory leaks
