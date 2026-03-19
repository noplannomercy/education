/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * AI service error (503)
 */
export class AIServiceError extends AppError {
  constructor(message: string) {
    super(503, message, 'AI_SERVICE_ERROR');
    this.name = 'AIServiceError';
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(500, message, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = '리소스를 찾을 수 없습니다') {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}
