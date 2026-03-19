import { AppError } from './errors';
import { ZodError } from 'zod';

/**
 * Global error handler for API routes
 */
export function handleError(error: unknown) {
  console.error('Error:', error);

  // Handle known AppError instances
  if (error instanceof AppError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: '입력값 검증에 실패했습니다',
        code: 'VALIDATION_ERROR',
        details: error.issues,
      },
      { status: 400 }
    );
  }

  // Handle unknown errors
  return Response.json(
    { error: '서버 오류가 발생했습니다', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

/**
 * Retry logic for AI API calls with exponential backoff
 */
export async function callAIWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      console.error(`AI API call failed (attempt ${i + 1}/${maxRetries}):`, {
        message: lastError.message,
        stack: lastError.stack,
        name: lastError.name,
      });

      if (i === maxRetries - 1) {
        throw lastError;
      }

      // Check if it's a rate limit error
      const waitTime = lastError.message.includes('rate limit')
        ? delay * 5
        : delay * Math.pow(2, i);

      console.log(`Retry attempt ${i + 1}/${maxRetries} after ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Max retries exceeded');
}
