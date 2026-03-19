import { createOpenAI } from '@ai-sdk/openai';

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY environment variable is required');
}

// Configure Open Router with Claude Haiku 4.5
export const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Model configuration
// OpenRouter model name for Claude 3 Haiku (most cost-effective)
// Alternative models:
// - anthropic/claude-3-haiku (fast, low-cost)
// - anthropic/claude-3-sonnet (balanced)
// - anthropic/claude-3.5-sonnet (most capable)
export const model = openrouter('anthropic/claude-3-haiku');
