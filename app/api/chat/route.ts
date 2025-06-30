import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

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

  const result = streamText({
    model,
    messages,
  });

  return result.toDataStreamResponse();
}