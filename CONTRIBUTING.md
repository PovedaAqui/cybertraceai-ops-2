# Contributing to CyberTraceAI-Ops

Thank you for your interest in contributing to CyberTraceAI-Ops! We're excited to work with developers who want to improve network observability through AI. Whether you're fixing bugs, adding features, or improving documentation, your contributions make a real difference.

## 🎯 Types of Contributions

We welcome all types of contributions:

- **🐛 Bug fixes** - Help us squash issues
- **✨ New features** - Add capabilities to the platform
- **📚 Documentation** - Improve guides and API docs
- **🧪 Testing** - Expand test coverage
- **🎨 UI/UX improvements** - Enhance the user experience
- **🔧 Performance optimizations** - Make the system faster

## 📖 Documentation Quick Links

Before diving in, familiarize yourself with our documentation:

- **[README.md](README.md)** - Deployment, installation, and user guide
- **[CODE_TOUR.md](CODE_TOUR.md)** - Detailed codebase architecture and patterns
- **[API.md](API.md)** - Complete API specification and examples

---

## 🚀 Quick Development Setup

### Prerequisites

- **Node.js 18+** and **pnpm**
- **Docker** and **Docker Compose**
- **Git** for version control
- **VSCode** (recommended) with TypeScript extension

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/cybertraceai-ops-2.git
cd cybertraceai-ops-2

# Add upstream remote
git remote add upstream https://github.com/luispoveda93/cybertraceai-ops-2.git
```

### 2. Development Environment Setup

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Set up minimal development environment
# Edit .env with your development values:
# - NEXTAUTH_SECRET=dev-secret-key
# - AUTH_GOOGLE_ID=your_dev_google_id
# - AUTH_GOOGLE_SECRET=your_dev_google_secret
# - OPENROUTER_API_KEY=your_openrouter_key
```

### 3. Start Development Environment

**Option A: Quick Development (Recommended)**
```bash
# Use development compose with hot reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Check everything is working
curl http://localhost:3000
```

**Option B: Local Development**
```bash
# Start database only
docker compose up -d database

# Run app locally with hot reload
pnpm dev
```

### 4. Verify Setup

```bash
# Run the test suite to verify everything works
./test-deployment.sh
```

🎉 **You're ready to contribute!** Visit http://localhost:3000 to see your development environment.

---

## 💻 Code Guidelines & Standards

### TypeScript & React Patterns

**Component Structure:**
```typescript
// Follow this pattern for new components
import { cn } from '@/lib/utils'

interface ComponentProps {
  className?: string
  // Use specific types, avoid 'any'
  data: NetworkDevice[]
  onSelect?: (device: NetworkDevice) => void
}

export function Component({ className, data, onSelect }: ComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      {/* Component content */}
    </div>
  )
}
```

**File Organization:**
- **Components**: Group by feature in `components/` subdirectories
- **API Routes**: Use RESTful patterns in `app/api/`
- **Utilities**: Place in `lib/utils/` with clear naming
- **Types**: Define in component files or `types/` for shared types

**Import Conventions:**
```typescript
// Order: External packages → Internal utilities → Components
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
```

### Styling Guidelines

**Tailwind CSS Patterns:**
- Use `cn()` utility for conditional classes
- Prefer Tailwind classes over custom CSS
- Follow responsive-first design (`mobile → tablet → desktop`)
- Use design system spacing (`space-y-4`, `gap-6`, etc.)

**Component Styling:**
```typescript
// Good: Composable, conditional classes
const buttonStyles = cn(
  "px-4 py-2 rounded-md font-medium",
  variant === "primary" && "bg-blue-600 text-white",
  variant === "secondary" && "bg-gray-100 text-gray-900",
  disabled && "opacity-50 cursor-not-allowed",
  className
)
```

### Error Handling

**API Routes:**
```typescript
try {
  // Your logic here
  return NextResponse.json({ success: true })
} catch (error) {
  console.error('Descriptive error context:', error)
  return NextResponse.json(
    { error: 'User-friendly message' },
    { status: 500 }
  )
}
```

**Client Components:**
```typescript
// Use error boundaries and proper error states
const [error, setError] = useState<string | null>(null)

// Handle errors gracefully
if (error) {
  return <ErrorMessage message={error} onRetry={() => setError(null)} />
}
```

---

## 🔄 Git Workflow & Pull Requests

### Branch Naming

Use descriptive branch names with prefixes:
```bash
git checkout -b feature/add-bgp-analysis-tool
git checkout -b fix/chat-history-loading-bug
git checkout -b docs/update-api-examples
git checkout -b refactor/improve-database-queries
```

### Commit Messages

Follow conventional commit format:
```bash
# Format: type(scope): description
git commit -m "feat(chat): add real-time message streaming"
git commit -m "fix(auth): resolve session timeout issue"
git commit -m "docs(api): add SuzieQ integration examples"
git commit -m "refactor(db): optimize chat message queries"
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process

**Before Opening a PR:**
1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```
2. **Run tests**: `./test-deployment.sh`
3. **Check formatting**: `pnpm lint`
4. **Verify builds**: `pnpm build`

**PR Requirements:**
- [ ] Clear, descriptive title
- [ ] Description explains the problem and solution
- [ ] Tests pass (`./test-deployment.sh`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Documentation updated if needed
- [ ] Screenshots for UI changes

**PR Template:**
```markdown
## Problem
Brief description of the issue or feature request

## Solution
How this PR addresses the problem

## Testing
- [ ] Tested locally with development environment
- [ ] Added/updated tests if applicable
- [ ] Verified no regressions

## Documentation
- [ ] Updated relevant documentation
- [ ] Added code comments for complex logic
```

### Handling Review Feedback

- **Address all feedback** before requesting re-review
- **Ask questions** if feedback is unclear
- **Make commits** for each round of feedback, then squash before merge
- **Be responsive** to reviewer questions

---

## 🛠️ Feature Development Guide

### Adding UI Components

**1. Create Component Structure:**
```typescript
// components/network/device-status.tsx
import { NetworkDevice } from '@/types/network'

interface DeviceStatusProps {
  devices: NetworkDevice[]
  onDeviceSelect: (device: NetworkDevice) => void
}

export function DeviceStatus({ devices, onDeviceSelect }: DeviceStatusProps) {
  // Component implementation
}
```

**2. Add to UI Library (if reusable):**
```typescript
// components/ui/status-indicator.tsx
// Export via components/ui/index.ts for easy imports
```

**3. Integration Pattern:**
Follow existing patterns in `components/` - see CODE_TOUR.md for detailed component architecture.

### Extending AI Tools

**1. Create Tool Definition:**
```typescript
// lib/ai/tools/network-analyzer.ts
import { z } from 'zod'
import { tool } from 'ai'

export const networkAnalyzerTool = tool({
  description: 'Analyze network topology and identify issues',
  parameters: z.object({
    deviceType: z.string(),
    includeMetrics: z.boolean().optional(),
  }),
  execute: async ({ deviceType, includeMetrics }) => {
    // Tool implementation
    return { analysis: '...', recommendations: '...' }
  }
})
```

**2. Register Tool:**
```typescript
// app/api/chat/route.ts
import { networkAnalyzerTool } from '@/lib/ai/tools/network-analyzer'

const tools = {
  // ... existing tools
  network_analyzer: networkAnalyzerTool,
}
```

### Database Schema Changes

**1. Update Schema:**
```typescript
// lib/db/schema.ts
export const networkDevices = pgTable('network_devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  hostname: varchar('hostname', { length: 255 }).notNull(),
  // Add your new columns
})
```

**2. Generate Migration:**
```bash
pnpm db:generate
# Review the generated migration in lib/db/migrations/
```

**3. Test Migration:**
```bash
# Test on development database
pnpm db:migrate
```

### Adding API Endpoints

**1. Create Route Handler:**
```typescript
// app/api/network/devices/route.ts
import { auth } from '@/lib/auth'
import { getNetworkDevices } from '@/lib/db/queries'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const devices = await getNetworkDevices(session.user.id)
    return Response.json({ devices })
  } catch (error) {
    console.error('Failed to fetch devices:', error)
    return Response.json({ error: 'Failed to fetch devices' }, { status: 500 })
  }
}
```

**2. Add Database Query:**
```typescript
// lib/db/queries.ts
export async function getNetworkDevices(userId: string) {
  return await db
    .select()
    .from(networkDevices)
    .where(eq(networkDevices.userId, userId))
}
```

**3. Update API Documentation:**
Add endpoint details to `API.md` following existing patterns.

---

## 🧪 Testing & Quality Assurance

### Running Tests Locally

**Full Test Suite:**
```bash
# Run complete integration test suite
./test-deployment.sh
```

**Development Tests:**
```bash
# Check linting
pnpm lint

# Type checking
pnpm type-check

# Build verification
pnpm build
```

### Test Requirements for Contributions

**New Features:**
- [ ] Integration test coverage for critical paths
- [ ] Error handling verification
- [ ] Database migration testing (if applicable)

**Bug Fixes:**
- [ ] Test that reproduces the bug
- [ ] Verification that fix resolves the issue
- [ ] Regression testing for related functionality

### Quality Standards

**Code Quality Checks:**
- **TypeScript**: No `any` types, proper type definitions
- **ESLint**: All linting rules must pass
- **Formatting**: Consistent code formatting
- **Performance**: No obvious performance regressions

**Database Guidelines:**
- **Migrations**: Always backwards compatible
- **Queries**: Use proper indexes, avoid N+1 queries
- **Transactions**: Use for multi-step operations

### Debugging Tips

**Development Environment:**
```bash
# View application logs
docker compose logs -f app

# Check database connections
docker exec cybertraceai-db psql -U postgres -d cybertraceai -c "\dt"

# Monitor MCP container activity
docker ps | grep mcp
```

**Common Issues:**
- **Auth problems**: Check Google OAuth configuration in `.env`
- **Database issues**: Verify migrations with `pnpm db:migrate`
- **MCP tools failing**: Check Docker socket permissions and SuzieQ API connectivity

---

## 📚 Documentation & Community

### Documentation Updates

**When to Update Documentation:**

- **API.md**: When adding/modifying API endpoints
- **CODE_TOUR.md**: When changing architecture or major patterns
- **README.md**: When changing deployment/setup process
- **CONTRIBUTING.md**: When modifying development workflow

**Code Documentation:**
```typescript
/**
 * Executes SuzieQ network query with proper error handling
 * @param query - SuzieQ table and parameters
 * @param timeout - Execution timeout in milliseconds
 * @returns Promise with network data or error details
 */
export async function executeSuzieQQuery(
  query: SuzieQQuery,
  timeout: number = 30000
): Promise<NetworkQueryResult> {
  // Implementation with inline comments for complex logic
}
```

### Issue Reporting

**Bug Reports:**
Include:
- Environment details (OS, Docker version, browser)
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs or screenshots
- Minimal reproduction case

**Feature Requests:**
Include:
- Problem description
- Proposed solution
- Use cases and benefits
- Alternative approaches considered

### Security Issues

**Security Vulnerabilities:**
- **Do not** open public issues for security problems
- Email security issues to: luis.poveda@cybertraceai.com
- Include detailed reproduction steps
- Allow reasonable time for fixes before disclosure

### Getting Help

**Development Questions:**
- Check existing issues and discussions
- Review CODE_TOUR.md for architecture understanding
- Ask questions in issue comments or discussions

**Community Guidelines:**
- Be respectful and constructive
- Help others when you can
- Share knowledge and best practices
- Follow the project's code of conduct

---

## 🏁 Ready to Contribute?

1. **📋 Check existing issues** for good first contributions
2. **💬 Join discussions** to understand project direction  
3. **🔧 Set up your development environment** following this guide
4. **🎯 Start with small changes** to get familiar with the workflow
5. **📝 Open your first PR** and be part of the community!

**Questions?** Open an issue or check our existing discussions. We're here to help you succeed!

---

## 📄 License

By contributing to CyberTraceAI-Ops, you agree that your contributions will be licensed under the [Apache 2.0 License](LICENSE).