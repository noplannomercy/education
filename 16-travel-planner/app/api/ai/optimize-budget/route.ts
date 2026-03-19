// app/api/ai/optimize-budget/route.ts

import { NextRequest } from 'next/server';
import { optimizeBudget } from '@/lib/ai/services/optimizeBudget';
import { AIServiceError } from '@/lib/utils/errors';
import { RateLimitError } from '@/lib/ai/utils/rateLimit';
import { z } from 'zod';

const expenseSchema = z.object({
  category: z.string(),
  amount: z.number(),
  description: z.string(),
  date: z.string(),
});

const requestSchema = z.object({
  tripId: z.string().min(1, '여행 ID는 필수입니다'),
  destination: z.string().min(1, '목적지는 필수입니다'),
  country: z.string().min(1, '국가는 필수입니다'),
  duration: z.number().int().min(1, '여행 기간은 1일 이상이어야 합니다'),
  totalBudget: z.number().min(0, '총 예산은 0 이상이어야 합니다'),
  actualSpent: z.number().min(0, '실제 지출은 0 이상이어야 합니다'),
  travelers: z.number().int().min(1, '여행 인원은 1명 이상이어야 합니다'),
  expenses: z.array(expenseSchema),
});

/**
 * POST /api/ai/optimize-budget
 * AI 예산 최적화
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    console.log('🤖 AI 예산 최적화 요청:', validated.destination, validated.totalBudget);

    const result = await optimizeBudget(validated);

    console.log('✅ AI 예산 최적화 완료:', result.recommendations.length, '개 추천');

    return Response.json({
      success: true,
      data: result,
      message: 'AI 예산 최적화가 완료되었습니다',
    });
  } catch (error) {
    console.error('POST /api/ai/optimize-budget error:', error);

    if (error instanceof RateLimitError) {
      return Response.json(
        {
          success: false,
          error: error.message,
          code: 'RATE_LIMIT_ERROR',
          retryAfter: error.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': error.retryAfter.toString(),
          },
        }
      );
    }

    if (error instanceof z.ZodError) {
      return Response.json(
        {
          success: false,
          error: '입력 데이터가 올바르지 않습니다',
          code: 'VALIDATION_ERROR',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof AIServiceError) {
      return Response.json(
        {
          success: false,
          error: error.message,
          code: 'AI_SERVICE_ERROR',
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: false,
        error: 'AI 예산 최적화 중 오류가 발생했습니다',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
