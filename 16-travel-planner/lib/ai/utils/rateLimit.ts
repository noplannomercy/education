// lib/ai/utils/rateLimit.ts

/**
 * Rate Limiter - 10 requests per minute
 */
class RateLimiter {
  private requests: number[] = [];
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number = 10, windowMs: number = 60000) {
    this.limit = limit; // 최대 요청 수
    this.windowMs = windowMs; // 시간 윈도우 (밀리초)
  }

  /**
   * Rate limit 체크
   * @returns { allowed: boolean, retryAfter?: number }
   */
  check(): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();

    // 오래된 요청 제거 (시간 윈도우 밖)
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    // 요청 수 체크
    if (this.requests.length < this.limit) {
      this.requests.push(now);
      return { allowed: true };
    }

    // Rate limit 초과
    const oldestRequest = this.requests[0];
    const retryAfter = Math.ceil((oldestRequest + this.windowMs - now) / 1000); // 초 단위

    return {
      allowed: false,
      retryAfter,
    };
  }

  /**
   * 현재 사용 가능한 요청 수
   */
  getAvailableRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return this.limit - this.requests.length;
  }

  /**
   * Rate limiter 초기화
   */
  reset(): void {
    this.requests = [];
  }
}

// 전역 rate limiter 인스턴스
const globalRateLimiter = new RateLimiter(10, 60000); // 10 req/min

/**
 * AI 호출 전 Rate limit 체크
 *
 * @throws RateLimitError if rate limit exceeded
 */
export function checkAIRateLimit(): void {
  const { allowed, retryAfter } = globalRateLimiter.check();

  if (!allowed) {
    throw new RateLimitError(
      `AI 요청 한도를 초과했습니다. ${retryAfter}초 후에 다시 시도하세요.`,
      retryAfter
    );
  }
}

/**
 * 사용 가능한 AI 요청 수 조회
 */
export function getAvailableAIRequests(): number {
  return globalRateLimiter.getAvailableRequests();
}

/**
 * Rate limiter 초기화 (테스트용)
 */
export function resetAIRateLimit(): void {
  globalRateLimiter.reset();
}

/**
 * Rate Limit 에러
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number = 60
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}
