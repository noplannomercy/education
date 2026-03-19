// lib/utils/errors.ts

/**
 * 커스텀 에러 클래스
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 입력 검증 에러
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * AI 서비스 에러
 */
export class AIServiceError extends AppError {
  constructor(message: string) {
    super(500, message, 'AI_SERVICE_ERROR');
    this.name = 'AIServiceError';
  }
}

/**
 * 데이터베이스 에러
 */
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(500, message, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

/**
 * 인증 에러
 */
export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * 권한 에러
 */
export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * 리소스를 찾을 수 없음
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

/**
 * Rate Limit 에러
 */
export class RateLimitError extends AppError {
  constructor(message: string, public retryAfter?: number) {
    super(429, message, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}
