import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, experimental_createMCPClient as createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import path from 'path';
import { humanizeTimestampTool } from '@/lib/ai/tools/humanize-timestamp';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';

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
  const { messages } = await req.json();

  // Resolve Suzieq MCP server path and working directory
  const serverPath = process.env.SUZIEQ_MCP_SERVER_PATH;
  if (!serverPath) {
    throw new Error('SUZIEQ_MCP_SERVER_PATH env variable is not set');
  }

  // The cwd must be a directory, not the script itself
  const serverDir = path.dirname(serverPath);

  // Initialize MCP client with stdio transport for suzieq server
  const mcpClient = await createMCPClient({
    transport: new StdioMCPTransport({
      command: 'uv',
      args: ['run', 'python', serverPath],
      cwd: serverDir,
    }),
  });

  // Get all tools available from the suzieq server
  const tools = {
    ...(await mcpClient.tools()),
    humanize_timestamp_tool: humanizeTimestampTool,
  };

  const result = streamText({
    model,
    messages,
    system: SYSTEM_PROMPT,
    tools,
    maxSteps: 5,
    onFinish: async () => {
      // Close the MCP client when streaming is finished
      await mcpClient.close();
    },
  });

  return result.toDataStreamResponse();
}