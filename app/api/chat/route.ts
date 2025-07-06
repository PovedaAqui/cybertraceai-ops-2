import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, experimental_createMCPClient as createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import { auth0 } from '@/lib/auth0';
import path from 'path';
import { humanizeTimestampTool } from '@/lib/ai/tools/humanize-timestamp';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { getOrCreateUser, saveMessage, getChatById, createChat } from '@/lib/db/queries';

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    extraBody: {
        provider: {
            order: ['Amazon Bedrock', 'Azure'],
            sort: 'latency',
        },
        models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o'],
        data_collection: {
            enabled: false,
        },
        temperature: 0.0,
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    },
});  

const model = openrouter('anthropic/claude-3-7-sonnet');

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  console.log('Chat API request body:', body);
  const { messages, id: chatId } = body;

  try {
    // Temporary: Skip authentication for development
    // TODO: Fix Auth0 compatibility with Next.js 15
    const userId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const userEmail = 'temp@example.com';
    
    // Ensure user exists in database
    await getOrCreateUser(userId, userEmail);

    // Handle chat creation or retrieval
    let currentChatId = chatId;
    if (!currentChatId) {
      // Create new chat if none provided
      const newChat = await createChat(userId, 'New Chat');
      currentChatId = newChat.id;
    } else {
      // Check if chatId is a valid UUID (database format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(currentChatId)) {
        // It's a UUID, verify chat ownership
        const chat = await getChatById(currentChatId, userId);
        if (!chat || chat.userId !== userId) {
          return new Response('Chat not found', { status: 404 });
        }
      } else {
        // It's a non-UUID ID (from AI SDK), create new chat
        const newChat = await createChat(userId, 'New Chat');
        currentChatId = newChat.id;
      }
    }

    // Save user message immediately
    const userMessage = messages[messages.length - 1];
    if (userMessage && userMessage.role === 'user') {
      await saveMessage({
        ...userMessage,
        chatId: currentChatId,
        id: userMessage.id || crypto.randomUUID(),
        createdAt: userMessage.createdAt || new Date(),
      });
    }

    let tools = { humanize_timestamp_tool: humanizeTimestampTool };
    let mcpClient: any = null;

    // Try to initialize MCP client, but don't fail if it's not available
    try {
      const serverPath = process.env.SUZIEQ_MCP_SERVER_PATH;
      if (serverPath) {
        const serverDir = path.dirname(serverPath);
        mcpClient = await createMCPClient({
          transport: new StdioMCPTransport({
            command: 'uv',
            args: ['run', 'python', serverPath],
            cwd: serverDir,
          }),
        });
        
        // Get tools from MCP server
        const mcpTools = await mcpClient.tools();
        tools = { ...mcpTools, ...tools };
      }
    } catch (mcpError) {
      console.warn('MCP client initialization failed:', mcpError);
      // Continue without MCP tools
    }

    const result = streamText({
      model,
      messages,
      system: SYSTEM_PROMPT,
      tools,
      maxSteps: 5,
      onFinish: async (event) => {
        try {
          // Close the MCP client if it was initialized
          if (mcpClient) {
            await mcpClient.close().catch(console.error);
          }
          
          // Save assistant message
          if (event.finishReason === 'stop' || event.finishReason === 'length') {
            // Build the assistant message from the response
            const assistantMessage = {
              id: crypto.randomUUID(),
              role: 'assistant' as const,
              content: event.text || '',
              parts: event.toolCalls?.length ? [
                ...(event.text ? [{ type: 'text', text: event.text }] : []),
                ...event.toolCalls.map(call => ({
                  type: 'tool-invocation',
                  toolInvocation: {
                    state: 'result',
                    toolName: call.toolName,
                    toolCallId: call.toolCallId,
                    args: call.args,
                    result: event.toolResults?.find(r => r.toolCallId === call.toolCallId)?.result
                  }
                }))
              ] : undefined,
              createdAt: new Date(),
              chatId: currentChatId,
            };

            await saveMessage(assistantMessage).catch(console.error);
          }
        } catch (error) {
          console.error('Error in onFinish:', error);
        }
      },
    });

    // Try different streaming response methods in order of preference
    try {
      return result.toDataStreamResponse();
    } catch (error1) {
      try {
        return result.toTextStreamResponse();
      } catch (error2) {
        try {
          return new Response(result.toDataStream(), {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        } catch (error3) {
          return new Response(result.textStream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('Internal server error', { status: 500 });
  }
}