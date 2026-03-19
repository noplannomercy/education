// lib/ai/utils/retry.ts

/**
 * 지수 백오프로 AI 호출을 재시도합니다.
 *
 * @param fn - 재시도할 비동기 함수
 * @param maxRetries - 최대 재시도 횟수 (기본: 3)
 * @param baseDelay - 기본 지연 시간 (ms, 기본: 1000)
 * @returns 함수 결과
 */
export async function retryAICall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 마지막 시도면 에러를 던짐
      if (attempt === maxRetries) {
        break;
      }

      // 지수 백오프 계산 (1초, 2초, 4초, ...)
      const delay = baseDelay * Math.pow(2, attempt);

      console.warn(`AI 호출 실패 (시도 ${attempt + 1}/${maxRetries + 1}). ${delay}ms 후 재시도...`);
      console.warn('에러:', error instanceof Error ? error.message : error);

      // 지연 후 재시도
      await sleep(delay);
    }
  }

  // 모든 재시도 실패
  throw lastError;
}

/**
 * 지정된 시간만큼 대기합니다.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 타임아웃과 함께 AI 호출을 실행합니다.
 *
 * @param fn - 실행할 비동기 함수
 * @param timeoutMs - 타임아웃 (ms, 기본: 30초)
 * @returns 함수 결과
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI 호출 타임아웃 (${timeoutMs}ms)`)), timeoutMs)
    )
  ]);
}
