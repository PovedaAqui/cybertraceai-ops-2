# CyberTrace AI - API Reference

This document provides the complete API specification for CyberTrace AI. For deployment and configuration instructions, see [README.md](README.md). For codebase architecture details, see [CODE_TOUR.md](CODE_TOUR.md).

## Table of Contents

- [Quick Reference](#quick-reference)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Core API Endpoints](#core-api-endpoints)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Chat Management](#chat-management)
  - [Chat Conversation](#chat-conversation)
- [MCP Tool Integration](#mcp-tool-integration)
- [Error Handling](#error-handling)
- [Data Models](#data-models)
- [Integration Examples](#integration-examples)
- [Security Considerations](#security-considerations)

## Quick Reference

### Endpoint Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| `GET` | `/api/auth/signin` | OAuth sign-in page | No |
| `GET` | `/api/auth/session` | Get current session | No |
| `GET` | `/api/auth/signout` | Sign out user | No |
| `GET` | `/api/chats` | List user's chats | Yes |
| `POST` | `/api/chats` | Create new chat | Yes |
| `GET` | `/api/chats/[id]` | Get chat with messages | Yes |
| `PATCH` | `/api/chats/[id]` | Update chat title | Yes |
| `DELETE` | `/api/chats/[id]` | Delete chat | Yes |
| `POST` | `/api/chat` | Send message & get AI response | Yes |

### Available MCP Tools

| Tool | Purpose |
|------|---------|
| `run_suzieq_show` | Execute SuzieQ show commands |
| `run_suzieq_summarize` | Generate network summaries |
| `humanize_timestamp` | Convert UNIX timestamps |
| `table` | Generate HTML tables |

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: Your deployed domain

## Authentication

All API endpoints (except auth endpoints) require authentication via NextAuth.js session cookies.

### Authentication Methods

- **Session Cookies**: Primary authentication method using NextAuth.js
- **Google OAuth**: OAuth provider for user authentication

### Session Management

Sessions are stored in the database and validated on each request. Session cookies are httpOnly and secure in production.

**Session Cookie Name**: `next-auth.session-token`

### Session Format

```typescript
interface Session {
  user: {
    id: string;        // Internal user ID
    name: string;      // User's display name
    email: string;     // User's email address
    image: string;     // User's profile image URL
  };
  expires: string;     // ISO 8601 expiration timestamp
}
```

### Authentication Headers

For authenticated requests, the session cookie is automatically included:

```http
Cookie: next-auth.session-token=eyJhbGciOiJIUzI1NiJ9...
```

## Core API Endpoints

### Authentication Endpoints

#### GET `/api/auth/signin`

Google OAuth sign-in page.

**Response**: HTML sign-in page

#### GET `/api/auth/callback/google`

OAuth callback handler.

**Response**: Redirect to application

#### GET `/api/auth/signout`

Sign out current user.

**Response**: Redirect to sign-in page

#### GET `/api/auth/session`

Get current session information.

**Headers**:
- `Cookie`: NextAuth session cookie (automatic)

**Response** (200 OK):

```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe", 
    "email": "john@example.com",
    "image": "https://lh3.googleusercontent.com/..."
  },
  "expires": "2025-01-01T00:00:00.000Z"
}
```

**Response** (401 Unauthorized):
```json
null
```

**cURL Example**:
```bash
curl -X GET "http://localhost:3000/api/auth/session" \
  -H "Cookie: next-auth.session-token=your-session-token"
```

### Chat Management

#### GET `/api/chats`

Get all chats for authenticated user, ordered by most recently updated.

**Headers**:
- `Cookie`: NextAuth session cookie (required)

**Response** (200 OK):

```json
{
  "chats": [
    {
      "id": "01234567-89ab-cdef-0123-456789abcdef",
      "title": "Network Analysis Discussion",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:30:00.000Z"
    },
    {
      "id": "01234567-89ab-cdef-0123-456789abcdff", 
      "title": "BGP Route Analysis",
      "createdAt": "2025-01-01T09:00:00.000Z",
      "updatedAt": "2025-01-01T09:15:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `401`: Not authenticated
- `500`: Internal server error

**cURL Example**:
```bash
curl -X GET "http://localhost:3000/api/chats" \
  -H "Cookie: next-auth.session-token=your-session-token"
```

#### POST `/api/chats`

Create a new chat with specified title.

**Headers**:
- `Cookie`: NextAuth session cookie (required)
- `Content-Type`: application/json

**Request Body**:

```json
{
  "title": "Network Performance Analysis"
}
```

**Response** (201 Created):

```json
{
  "chat": {
    "id": "01234567-89ab-cdef-0123-456789abcdef",
    "title": "Network Performance Analysis", 
    "createdAt": "2025-01-01T11:00:00.000Z",
    "updatedAt": "2025-01-01T11:00:00.000Z"
  }
}
```

**Error Responses**:
- `400`: Invalid request body or missing title
- `401`: Not authenticated
- `500`: Internal server error

**cURL Example**:
```bash
curl -X POST "http://localhost:3000/api/chats" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Network Performance Analysis"}'
```

#### GET `/api/chats/[id]`

Get specific chat with all messages and tool invocations.

**Path Parameters**:
- `id` (string): Chat UUID

**Headers**:
- `Cookie`: NextAuth session cookie (required)

**Response** (200 OK):

```json
{
  "chat": {
    "id": "01234567-89ab-cdef-0123-456789abcdef",
    "title": "Network Analysis Discussion",
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-01T10:30:00.000Z"
  },
  "messages": [
    {
      "id": "msg_01234567-89ab-cdef-0123-456789abcdef",
      "content": "Show me all devices in the network",
      "role": "user",
      "createdAt": "2025-01-01T10:00:00.000Z"
    },
    {
      "id": "msg_01234567-89ab-cdef-0123-456789abcdff",
      "content": "Here are the network devices found in your infrastructure...",
      "role": "assistant", 
      "createdAt": "2025-01-01T10:01:00.000Z",
      "toolInvocations": [
        {
          "toolCallId": "call_01234567-89ab-cdef-0123-456789abcdef",
          "toolName": "run_suzieq_show",
          "args": { "table": "device", "columns": "hostname,vendor,model" },
          "result": {
            "hostname": ["leaf01", "spine01"],
            "vendor": ["Arista", "Arista"],
            "model": ["vEOS", "vEOS"]
          },
          "state": "result"
        }
      ]
    }
  ]
}
```

**Error Responses**:
- `401`: Not authenticated
- `403`: Chat not owned by user  
- `404`: Chat not found
- `500`: Internal server error

**cURL Example**:
```bash
curl -X GET "http://localhost:3000/api/chats/01234567-89ab-cdef-0123-456789abcdef" \
  -H "Cookie: next-auth.session-token=your-session-token"
```

#### PATCH `/api/chats/[id]`

Update chat title (partial update).

**Parameters**:

- `id` (path): Chat ID

**Headers**:

- `Cookie`: NextAuth session cookie
- `Content-Type`: application/json

**Body**:

```json
{
  "title": "Updated Chat Title"
}
```

**Response**:

```json
{
  "chat": {
    "id": "chat_123",
    "title": "Updated Chat Title",
    "updatedAt": "2024-01-01T11:30:00.000Z"
  }
}
```

#### DELETE `/api/chats/[id]`

Delete a chat and all its messages.

**Parameters**:

- `id` (path): Chat ID

**Headers**:

- `Cookie`: NextAuth session cookie

**Response**:

```json
{
  "success": true
}
```

### Chat Conversation

#### POST `/api/chat`

Send message and get AI response with optional MCP tools.

**Headers**:

- `Cookie`: NextAuth session cookie
- `Content-Type`: application/json

**Body**:

```json
{
  "messages": [
    {
      "id": "msg_123",
      "content": "Show me all BGP sessions",
      "role": "user"
    }
  ],
  "id": "chat_123" // Optional: existing chat ID
}
```

**Chat Management Features**:

- **Automatic Chat Creation**: If no `id` is provided or if `id` is not a valid UUID, a new chat is automatically created
- **Title Generation**: New chats with generic titles (like "New Chat") are automatically updated with titles generated from the first user message
- **User Management**: Users are automatically created in the database if they don't exist (based on session information)

**Response**: Streaming response with Server-Sent Events

**Stream Format**:

The API uses multiple streaming strategies with automatic fallback:

1. **Primary**: Data Stream Response (AI SDK format)
2. **Fallback**: Text Stream Response  
3. **Error Recovery**: Standard HTTP response

```
data: {"type":"text","text":"Let me check the BGP sessions..."}

data: {"type":"tool-call","toolCallId":"call_123","toolName":"run_suzieq_show","args":{"table":"bgp"}}

data: {"type":"tool-result","toolCallId":"call_123","result":{"devices":[...]}}

data: {"type":"text","text":"Here are the BGP sessions..."}

data: [DONE]
```

**Message Persistence**: All messages (user and assistant) are automatically saved to the database during the streaming process, ensuring chat history is preserved even if the client disconnects.

**Error Responses**:

- `401`: Not authenticated
- `400`: Invalid message format
- `500`: Server error

## MCP Tool Integration

### Available Tools

#### `run_suzieq_show`

Execute SuzieQ show commands for network data retrieval.

**Parameters**:

```typescript
{
  table: string;     // Table name (device, interface, bgp, etc.)
  columns?: string;  // Specific columns to retrieve
  namespace?: string; // Network namespace filter
  hostname?: string; // Device hostname filter
  view?: string;     // Specific view (summary, all, etc.)
}
```

**Example Usage**:

```json
{
  "toolName": "run_suzieq_show",
  "args": {
    "table": "device",
    "columns": "hostname,vendor,model,version",
    "namespace": "dual-evpn"
  }
}
```

**Example Response**:

```json
{
  "namespace": "dual-evpn",
  "hostname": ["leaf01", "leaf02", "spine01", "spine02"],
  "vendor": ["Arista", "Arista", "Arista", "Arista"],
  "model": ["vEOS", "vEOS", "vEOS", "vEOS"],
  "version": ["4.20.1F", "4.20.1F", "4.20.1F", "4.20.1F"],
  "status": ["alive", "alive", "alive", "alive"]
}
```

#### `run_suzieq_summarize`

Generate network summaries and insights.

**Parameters**:

```typescript
{
  table: string;     // Table to summarize
  namespace?: string; // Network namespace filter
  view?: string;     // Summary view type
}
```

**Example Usage**:

```json
{
  "toolName": "run_suzieq_summarize",
  "args": {
    "table": "bgp",
    "namespace": "dual-evpn"
  }
}
```

**Example Response**:

```json
{
  "summary": {
    "totalSessions": 12,
    "establishedSessions": 10,
    "failedSessions": 2,
    "uniquePeers": 8
  },
  "details": {
    "by_device": {
      "leaf01": {"total": 3, "established": 3},
      "leaf02": {"total": 3, "established": 2}
    }
  }
}
```

#### `humanize_timestamp`

Convert UNIX timestamps to human-readable date formats.

**Parameters**:

```typescript
{
  timestamp: number; // UNIX timestamp to convert
  format?: string;   // Optional date format (defaults to ISO string)
}
```

**Example Usage**:

```json
{
  "toolName": "humanize_timestamp",
  "args": {
    "timestamp": 1672531200,
    "format": "YYYY-MM-DD HH:mm:ss"
  }
}
```

**Example Response**:

```json
{
  "humanReadable": "2023-01-01 00:00:00",
  "iso": "2023-01-01T00:00:00.000Z",
  "relative": "2 hours ago"
}
```

#### `table`

Generate structured HTML tables from data arrays for better visualization.

**Parameters**:

```typescript
{
  data: Array<Record<string, any>>; // Array of objects to display as table
  title?: string;                   // Optional table title
  columns?: string[];               // Optional column ordering/filtering
}
```

**Example Usage**:

```json
{
  "toolName": "table",
  "args": {
    "data": [
      {"hostname": "leaf01", "vendor": "Arista", "model": "7050SX3"},
      {"hostname": "leaf02", "vendor": "Arista", "model": "7050SX3"}
    ],
    "title": "Network Devices",
    "columns": ["hostname", "vendor", "model"]
  }
}
```

**Example Response**:

```html
<table>
  <caption>Network Devices</caption>
  <thead>
    <tr><th>hostname</th><th>vendor</th><th>model</th></tr>
  </thead>
  <tbody>
    <tr><td>leaf01</td><td>Arista</td><td>7050SX3</td></tr>
    <tr><td>leaf02</td><td>Arista</td><td>7050SX3</td></tr>
  </tbody>
</table>
```

### Tool Execution Flow

1. **User Message**: Contains network analysis request
2. **AI Processing**: Claude 3.7 Sonnet determines which MCP tools to use
3. **Container Spawn**: Docker container created with SuzieQ MCP tools
4. **Tool Execution**: Network query executed via SuzieQ API
5. **Data Processing**: Results formatted and analyzed
6. **Response Generation**: AI provides insights and recommendations
7. **Container Cleanup**: Temporary container automatically removed

### SuzieQ API Integration

MCP tools connect to external SuzieQ REST API:

**Endpoint**: `http://host.docker.internal:8000/api/v2`
**Authentication**: Bearer token via `SUZIEQ_API_KEY`

### MCP Tool Configuration

#### Container Lifecycle

1. **Temporary Containers**: Each tool execution spawns a fresh Docker container
2. **Automatic Cleanup**: Containers are removed immediately after execution
3. **Network Detection**: Automatically detects appropriate Docker network configuration
4. **Resource Limits**: Containers have CPU and memory limits for security

#### Network Configuration

The system automatically detects Docker network setup:

- **Docker Desktop/Podman**: Uses `host.docker.internal` for host access
- **Linux Docker**: Auto-detects host IP address
- **Docker Compose**: Uses detected compose network

#### Tool Timeout & Limits

- **Execution Timeout**: 30 seconds per tool call
- **Container Memory**: 256MB limit
- **Container CPU**: 0.5 CPU limit
- **Concurrent Tools**: Maximum 3 simultaneous executions

#### SuzieQ API Examples

**Get Devices**:

```bash
curl -H "Authorization: Bearer $SUZIEQ_API_KEY" \
  "http://host.docker.internal:8000/api/v2/device"
```

**Get BGP Sessions**:

```bash
curl -H "Authorization: Bearer $SUZIEQ_API_KEY" \
  "http://host.docker.internal:8000/api/v2/bgp?view=summary"
```

## Error Handling

### HTTP Status Codes

| Code | Status | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request format or parameters |
| `401` | Unauthorized | Authentication required or invalid |
| `403` | Forbidden | Insufficient permissions for resource |
| `404` | Not Found | Resource does not exist |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side error occurred |

### Error Response Format

All error responses follow this consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": "Additional context (optional)"
}
```

### Common Error Scenarios

#### Authentication Errors

**Missing Session (401)**:
```json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

**Invalid Session (401)**:
```json
{
  "error": "Session expired or invalid",
  "code": "INVALID_SESSION"
}
```

#### Authorization Errors

**Resource Access Denied (403)**:
```json
{
  "error": "Chat not owned by user",
  "code": "RESOURCE_ACCESS_DENIED"
}
```

#### Validation Errors

**Invalid Request Body (400)**:
```json
{
  "error": "Invalid request format",
  "code": "VALIDATION_ERROR",
  "details": "Title is required"
}
```

**Resource Not Found (404)**:
```json
{
  "error": "Chat not found",
  "code": "RESOURCE_NOT_FOUND"
}
```

#### MCP Tool Errors

**SuzieQ Connection Failed (500)**:
```json
{
  "error": "SuzieQ API connection failed", 
  "code": "MCP_CONNECTION_ERROR",
  "details": "Unable to connect to http://host.docker.internal:8000"
}
```

**Tool Execution Timeout (500)**:
```json
{
  "error": "MCP tool execution timeout",
  "code": "MCP_TIMEOUT_ERROR",
  "details": "Tool execution exceeded 30 second timeout"
}
```

#### Streaming Errors

During streaming responses, errors are sent as SSE events:

```
data: {"type": "error", "error": "Tool execution failed", "code": "TOOL_ERROR"}
```

## Technical Specifications

### Rate Limiting

- **Chat API**: No explicit rate limiting (controlled by OpenRouter limits)
- **MCP Tools**: Limited by Docker container spawning capacity
- **SuzieQ API**: Depends on external SuzieQ server configuration

### Response Formats

All API responses use JSON format unless otherwise specified. Streaming endpoints use Server-Sent Events (SSE) format.

### Request Limits

- **Maximum request body size**: 1MB
- **Chat message length**: 10,000 characters
- **Chat title length**: 100 characters
- **Concurrent chat sessions**: No limit per user

### WebSocket Support

Currently not implemented. All communication uses HTTP with streaming responses for real-time chat.

## Data Models

### Chat Model

```typescript
interface Chat {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Message Model

```typescript
interface Message {
  id: string;
  chatId: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: Date;
  toolInvocations?: ToolInvocation[];
}
```

### Tool Invocation Model

```typescript
interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
  result?: any;
  state: "call" | "result" | "error";
}
```

## Integration Examples

### JavaScript/TypeScript Client

```typescript
// Send chat message
async function sendMessage(content: string, chatId?: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ id: generateId(), content, role: "user" }],
      id: chatId,
    }),
  });

  return response.body; // ReadableStream for SSE
}

// Get chat history
async function getChatHistory() {
  const response = await fetch("/api/chats");
  return response.json();
}
```

### Python Client

```python
import requests
import json

# Authenticate first (requires handling OAuth flow)
session = requests.Session()

# Send message
def send_message(content, chat_id=None):
    data = {
        "messages": [{"id": "msg_123", "content": content, "role": "user"}]
    }
    if chat_id:
        data["id"] = chat_id

    response = session.post(
        "http://localhost:3000/api/chat",
        json=data,
        headers={"Content-Type": "application/json"}
    )
    return response.iter_lines()

# Get chats
def get_chats():
    response = session.get("http://localhost:3000/api/chats")
    return response.json()
```

## Security Considerations

### API Security

1. **Session-based Authentication**: All endpoints require valid session
2. **User Isolation**: Users can only access their own chats
3. **Input Validation**: All inputs validated before processing
4. **CSRF Protection**: NextAuth provides CSRF protection

### MCP Security

1. **Container Isolation**: Each tool execution runs in isolated container
2. **Temporary Containers**: All containers removed after execution
3. **Network Restrictions**: Containers only access necessary services
4. **API Key Protection**: SuzieQ API key managed via environment variables

### Data Privacy

1. **Database Sessions**: Session data stored securely in database
2. **Message Persistence**: Chat history encrypted at rest
3. **Log Sanitization**: Sensitive data excluded from logs
4. **GDPR Compliance**: User data deletion supported

---

**Note**: This API is designed for authenticated web application use. For programmatic access, consider implementing API key authentication for specific use cases.
