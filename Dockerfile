# Multi-stage Dockerfile for Next.js CyberTrace AI application
# Optimized for production deployment with standalone output

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat netcat-openbsd
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
# Set dummy database URL for build time (will be overridden at runtime)
ENV POSTGRES_URL postgresql://dummy:dummy@dummy:5432/dummy

# Build the application with standalone output
RUN pnpm build

# Stage 3: Runtime
FROM node:18-alpine AS runner
RUN apk add --no-cache netcat-openbsd postgresql-client docker-cli
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1002 nodejs
RUN adduser --system --uid 1001 nextjs
# Add nextjs user to docker group for Docker socket access (match host docker GID)
RUN addgroup --gid 1001 docker && adduser nextjs docker

# Set environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy database migration scripts
COPY --from=builder --chown=nextjs:nodejs /app/lib/db/migrations ./lib/db/migrations
COPY --from=builder --chown=nextjs:nodejs /app/lib/db/migrate.ts ./lib/db/migrate.ts
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Use entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Default command
CMD ["node", "server.js"]