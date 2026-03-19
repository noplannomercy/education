import { createOpenAI } from '@ai-sdk/openai'

// OpenRouter 설정
export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

// AI 모델
export const model = openrouter('anthropic/claude-haiku-4.5')

// AI 설정 상수
export const AI_CONFIG = {
  maxOutputTokens: 1500,
  retries: 3,
  timeout: 30000,
  retryDelay: 1000,
} as const
