import { z } from 'zod'

export class AIParseError extends Error {
  constructor(message: string, public readonly rawText: string) {
    super(message)
    this.name = 'AIParseError'
  }
}

/**
 * AI 응답에서 JSON을 추출하고 Zod 스키마로 검증
 */
export function cleanAIResponse<T>(text: string, schema: z.ZodType<T>): T {
  // 1. 마크다운 코드블록 제거
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '')

  // 2. JSON 객체 또는 배열 추출
  const jsonMatch = cleaned.match(/[\[{][\s\S]*[\]}]/)
  if (!jsonMatch) {
    throw new AIParseError('No JSON found in response', text)
  }
  cleaned = jsonMatch[0]

  // 3. trailing comma 제거
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1')

  // 4. 작은따옴표를 큰따옴표로 변환
  cleaned = cleaned.replace(/'/g, '"')

  // 5. JSON 파싱
  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new AIParseError('Invalid JSON format', text)
  }

  // 6. Zod 스키마 검증
  const result = schema.safeParse(parsed)
  if (!result.success) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = (result.error as any).errors
    throw new AIParseError(
      `Schema validation failed: ${errors[0].message}`,
      text
    )
  }

  return result.data
}

/**
 * 재시도 및 타임아웃 기능이 있는 함수 호출
 */
export async function callWithRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  retries: number = 3,
  baseDelay: number = 1000,
  timeout: number = 30000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const result = await fn(controller.signal)
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      lastError = error as Error

      // 마지막 시도면 에러 throw
      if (attempt === retries - 1) {
        break
      }

      // 재시도 딜레이 계산
      let delay = baseDelay * Math.pow(2, attempt)

      // Rate limit 에러면 더 긴 딜레이
      if (lastError.message?.includes('rate limit')) {
        delay = 60000
      }

      console.warn(
        `AI call attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
        lastError.message
      )
      await sleep(delay)
    }
  }

  throw lastError || new Error('All retry attempts failed')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
