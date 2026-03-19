import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'AI Journal'
  }
});

// Use Claude 3.5 Sonnet (latest available on Open Router)
export const model = openrouter('anthropic/claude-3.5-sonnet');

// AI 호출 기본 설정
export const AI_CONFIG = {
  maxTokens: 1024,
  temperature: 0.7,
  timeout: 30000, // 30초
};
