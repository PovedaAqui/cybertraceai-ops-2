import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, experimental_createMCPClient as createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { humanizeTimestampTool } from '@/lib/ai/tools/humanize-timestamp';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { getOrCreateUser, saveMessage, getChatById, createChat } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

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
  console.log('🚀 POST /api/chat called');
  const body = await req.json();
  console.log('📥 Chat API request body:', JSON.stringify(body, null, 2));
  const { messages, id: chatId } = body;
  console.log('💬 Messages count:', messages?.length, 'ChatId:', chatId);

  try {
    const session = await getServerSession(authOptions);
    console.log('🔐 Session status:', session ? 'authenticated' : 'not authenticated');
    
    if (!session?.user) {
      console.log('❌ Unauthorized - no session or user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id!;
    const userEmail = session.user.email!;

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
    let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null;

    // Try to initialize MCP client, but don't fail if it's not available
    try {
      const apiEndpoint = process.env.SUZIEQ_API_ENDPOINT;
      const apiKey = process.env.SUZIEQ_API_KEY;
      if (apiEndpoint && apiKey) {
        mcpClient = await createMCPClient({
          transport: new StdioMCPTransport({
            command: 'docker',
            args: [
              'run', '-i', '--rm',
              '-e', 'SUZIEQ_API_ENDPOINT',
              '-e', 'SUZIEQ_API_KEY',
              'mcp/suzieq-mcp'
            ],
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

    console.log('🤖 Starting streamText with model:', model);
    console.log('🛠️ Available tools:', Object.keys(tools));
    
    const result = streamText({
      model,
      messages,
      system: SYSTEM_PROMPT,
      tools,
      maxSteps: 5,
      onFinish: async (event) => {
        console.log('🏁 onFinish called with reason:', event.finishReason);
        try {
          // Close the MCP client if it was initialized
          if (mcpClient) {
            await mcpClient.close().catch(console.error);
          }

          // Save assistant message
          if (event.finishReason === 'stop' || event.finishReason === 'length') {
            console.log('💾 Saving assistant message...');
            // Build the assistant message from the response
            const assistantMessage = {
              id: crypto.randomUUID(),
              role: 'assistant' as const,
              content: event.text || '',
              parts: event.toolCalls?.length ? [
                ...(event.text ? [{ type: 'text' as const, text: event.text }] : []),
                ...event.toolCalls.map(call => ({
                  type: 'tool-invocation' as const,
                  toolInvocation: {
                    state: 'result' as const,
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
            console.log('✅ Assistant message saved successfully');
          }
        } catch (error) {
          console.error('❌ Error in onFinish:', error);
        }
      },
    });

    // Try different streaming response methods in order of preference
    console.log('📤 Attempting to return streaming response...');
    try {
      console.log('✅ Using toDataStreamResponse');
      return result.toDataStreamResponse();
    } catch (e) {
      console.log('❌ toDataStreamResponse failed:', e);
      try {
        console.log('✅ Using toTextStreamResponse');
        return result.toTextStreamResponse();
      } catch (e2) {
        console.log('❌ toTextStreamResponse failed:', e2);
        try {
          console.log('✅ Using toDataStream with Response');
          return new Response(result.toDataStream(), {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        } catch (e3) {
          console.log('❌ toDataStream failed:', e3);
          console.log('✅ Using textStream fallback');
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