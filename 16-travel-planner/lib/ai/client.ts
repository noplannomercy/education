// lib/ai/client.ts

import { createOpenAI } from '@ai-sdk/openai';

// Open Router 설정
export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// 사용할 AI 모델
export const model = openrouter('anthropic/claude-haiku-4.5');

// AI 모델 설정
export const AI_CONFIG = {
  model: 'anthropic/claude-haiku-4.5',
  temperature: 0.7,
  maxTokens: 4000,
  timeout: 30000, // 30초
} as const;
