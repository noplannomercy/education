import { z } from 'zod';

// JSON 파싱 + 재시도 로직
export async function parseAIResponseWithRetry<T>(
  fetchFn: () => Promise<string>,
  schema: z.ZodSchema<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetchFn();

      // JSON 추출 시도
      let jsonStr = response.trim();

      // 1. 마크다운 코드 블록 제거
      const jsonMatch = jsonStr.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      } else if (jsonStr.startsWith('```') && jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(3, -3).trim();
      }

      // 2. JSON 객체만 추출 (시작 { 부터 끝 } 까지)
      const firstBrace = jsonStr.indexOf('{');
      if (firstBrace !== -1) {
        let braceCount = 0;
        let lastBrace = firstBrace;

        for (let j = firstBrace; j < jsonStr.length; j++) {
          if (jsonStr[j] === '{') braceCount++;
          if (jsonStr[j] === '}') {
            braceCount--;
            if (braceCount === 0) {
              lastBrace = j;
              break;
            }
          }
        }

        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }

      // JSON 파싱
      const parsed = JSON.parse(jsonStr);

      // Zod 스키마로 검증
      const validated = schema.parse(parsed);

      return validated;
    } catch (error) {
      lastError = error as Error;

      // Rate limit 에러면 대기 후 재시도
      if (isRateLimitError(error)) {
        const waitTime = Math.min(1000 * Math.pow(2, i), 10000); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // 마지막 시도가 아니면 재시도
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
    }
  }

  throw new Error(`AI 응답 파싱 실패 (${maxRetries}회 시도): ${lastError?.message}`);
}

// Rate limit 감지 및 백오프
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('rate limit') ||
           message.includes('429') ||
           message.includes('too many requests');
  }
  return false;
}

// 콘텐츠 길이 검증
export function validateContentLength(content: string): {
  valid: boolean;
  error?: string;
  truncated?: string;
} {
  const trimmed = content.trim();

  if (trimmed.length < 10) {
    return {
      valid: false,
      error: '일기 내용이 너무 짧습니다 (최소 10자)'
    };
  }

  if (content.length > 4000) {
    return {
      valid: true,
      truncated: content.slice(0, 4000)
    };
  }

  return { valid: true };
}
