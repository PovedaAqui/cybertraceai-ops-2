# API Reference

This document provides comprehensive API documentation for CyberTrace AI, including authentication, chat management, and MCP integration endpoints.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: Your deployed domain

## Authentication

All API endpoints (except auth endpoints) require authentication via NextAuth.js session cookies.

### Authentication Flow

1. User visits `/auth/signin` 
2. Redirected to Google OAuth
3. Session created with database strategy
4. Subsequent API calls include session cookie

### Session Format

```typescript
interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
  expires: string;
}
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

**Response**:
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe", 
    "email": "john@example.com",
    "image": "https://..."
  },
  "expires": "2024-01-01T00:00:00.000Z"
}
```

### Chat Management

#### GET `/api/chats`
Get all chats for authenticated user.

**Headers**:
- `Cookie`: NextAuth session cookie

**Response**:
```json
{
  "chats": [
    {
      "id": "chat_123",
      "title": "Network Analysis Discussion",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:30:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `401`: Not authenticated
- `500`: Server error

#### POST `/api/chats`
Create a new chat.

**Headers**:
- `Cookie`: NextAuth session cookie
- `Content-Type`: application/json

**Body**:
```json
{
  "title": "New Chat Title"
}
```

**Response**:
```json
{
  "chat": {
    "id": "chat_456",
    "title": "New Chat Title",
    "createdAt": "2024-01-01T11:00:00.000Z",
    "updatedAt": "2024-01-01T11:00:00.000Z"
  }
}
```

#### GET `/api/chats/[id]`
Get specific chat with messages.

**Parameters**:
- `id` (path): Chat ID

**Headers**:
- `Cookie`: NextAuth session cookie

**Response**:
```json
{
  "chat": {
    "id": "chat_123",
    "title": "Network Analysis Discussion",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:30:00.000Z"
  },
  "messages": [
    {
      "id": "msg_123",
      "content": "Show me all devices in the network",
      "role": "user",
      "createdAt": "2024-01-01T10:00:00.000Z"
    },
    {
      "id": "msg_124", 
      "content": "Here are the network devices...",
      "role": "assistant",
      "createdAt": "2024-01-01T10:01:00.000Z",
      "toolInvocations": [
        {
          "toolCallId": "call_123",
          "toolName": "run_suzieq_show",
          "args": { "table": "device" },
          "result": { ... }
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
- `500`: Server error

#### PUT `/api/chats/[id]`
Update chat title.

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
  "id": "chat_123"  // Optional: existing chat ID
}
```

**Response**: Streaming response with Server-Sent Events

**Stream Format**:
```
data: {"type":"text","text":"Let me check the BGP sessions..."}

data: {"type":"tool-call","toolCallId":"call_123","toolName":"run_suzieq_show","args":{"table":"bgp"}}

data: {"type":"tool-result","toolCallId":"call_123","result":{"devices":[...]}}

data: {"type":"text","text":"Here are the BGP sessions..."}

data: [DONE]
```

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

### Tool Execution Flow

1. **User Message**: Contains network analysis request
2. **AI Processing**: Claude determines which MCP tools to use
3. **Container Spawn**: Docker container created with SuzieQ MCP tools
4. **Tool Execution**: Network query executed via SuzieQ API
5. **Data Processing**: Results formatted and analyzed
6. **Response Generation**: AI provides insights and recommendations
7. **Container Cleanup**: Temporary container automatically removed

### SuzieQ API Integration

MCP tools connect to external SuzieQ REST API:

**Endpoint**: `http://host.docker.internal:8000/api/v2`
**Authentication**: Bearer token via `SUZIEQ_API_KEY`

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

### Standard Error Responses

All endpoints follow consistent error response format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not authorized for resource)
- `404`: Not Found
- `500`: Internal Server Error

### Authentication Errors

```json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

### MCP Tool Errors

```json
{
  "error": "SuzieQ API connection failed",
  "code": "MCP_CONNECTION_ERROR",
  "details": "Unable to connect to http://host.docker.internal:8000"
}
```

## Rate Limiting

- **Chat API**: No explicit rate limiting (controlled by OpenRouter limits)
- **MCP Tools**: Limited by Docker container spawning capacity
- **SuzieQ API**: Depends on external SuzieQ server configuration

## WebSocket Support

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
  role: 'user' | 'assistant' | 'system';
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
  state: 'call' | 'result' | 'error';
}
```

## Integration Examples

### JavaScript/TypeScript Client

```typescript
// Send chat message
async function sendMessage(content: string, chatId?: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ id: generateId(), content, role: 'user' }],
      id: chatId
    })
  });
  
  return response.body; // ReadableStream for SSE
}

// Get chat history
async function getChatHistory() {
  const response = await fetch('/api/chats');
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