import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY environment variable is not set');
}

// Configure Open Router as OpenAI-compatible provider
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Model to use for all AI requests
const MODEL = 'anthropic/claude-haiku-4.5';

/**
 * Generate text using Claude Haiku via Open Router
 */
export async function generateAIText(prompt: string) {
  try {
    const result = await generateText({
      model: openrouter(MODEL),
      prompt,
      temperature: 0.7,
    });

    return result.text;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Generate text with retry logic for rate limiting
 */
export async function generateAITextWithRetry(
  prompt: string,
  maxRetries = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateAIText(prompt);
    } catch (error) {
      lastError = error as Error;

      // If rate limited (429), wait and retry with exponential backoff
      if (error instanceof Error && error.message.includes('429')) {
        const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited, retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // For other errors, throw immediately
      throw error;
    }
  }

  throw lastError || new Error('Failed after retries');
}
