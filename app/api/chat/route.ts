import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, experimental_createMCPClient as createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import path from 'path';

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
  const tools = await mcpClient.tools();

  const result = streamText({
    model,
    messages,
    system: `You are a network analysis assistant powered by Suzieq. You help users analyze, monitor, and troubleshoot their network infrastructure.

Your capabilities include:
- Network device discovery and inventory
- Interface status and configuration analysis
- Routing table analysis and path tracing
- BGP session monitoring and route analysis
- Network topology mapping
- Performance monitoring and alerts
- Configuration compliance checking
- Network troubleshooting and diagnostics

When responding:
- Provide clear, actionable insights
- Use the available tools to gather real-time network data
- Explain technical concepts in an accessible way
- Offer specific recommendations for network optimization or issue resolution
- Ask clarifying questions when needed to better understand the network environment

Always prioritize accuracy and safety when providing network configuration advice.`,
    tools,
    maxSteps: 5,
    onFinish: async () => {
      // Close the MCP client when streaming is finished
      await mcpClient.close();
    },
  });

  return result.toDataStreamResponse();
}