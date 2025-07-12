# Test runner Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks and testing
RUN apk add --no-cache curl postgresql-client

# Install pnpm
RUN npm install -g pnpm

# Copy package files for test dependencies
COPY package.json ./
COPY package-lock.json* ./
COPY pnpm-lock.yaml* ./

# Install dependencies (including dev dependencies for testing)
RUN pnpm install --frozen-lockfile

# Copy test files
COPY . .

# Create test results directory
RUN mkdir -p /app/test-results

# Set environment
ENV NODE_ENV=test

# Default command
CMD ["npm", "test"]