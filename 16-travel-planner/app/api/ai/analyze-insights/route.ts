// app/api/ai/analyze-insights/route.ts

import { NextRequest } from 'next/server';
import { analyzeTravelInsights } from '@/lib/ai/services/analyzeTravelInsights';
import { AIServiceError } from '@/lib/utils/errors';
import { RateLimitError } from '@/lib/ai/utils/rateLimit';
import { z } from 'zod';

const requestSchema = z.object({
  tripId: z.string().min(1, '여행 ID는 필수입니다'),
  tripName: z.string().min(1, '여행명은 필수입니다'),
  destination: z.string().min(1, '목적지는 필수입니다'),
  country: z.string().min(1, '국가는 필수입니다'),
  startDate: z.string(),
  endDate: z.string(),
  duration: z.number().int().min(1, '여행 기간은 1일 이상이어야 합니다'),
  status: z.enum(['planning', 'ongoing', 'completed']),
  budget: z.number().min(0, '예산은 0 이상이어야 합니다'),
  actualSpent: z.number().min(0, '실제 지출은 0 이상이어야 합니다'),
  travelers: z.number().int().min(1, '여행 인원은 1명 이상이어야 합니다'),
  tripType: z.string().min(1, '여행 유형은 필수입니다'),
  itinerariesCount: z.number().int().min(0),
  completedItineraries: z.number().int().min(0),
  expensesCount: z.number().int().min(0),
  topExpenseCategory: z.string().optional(),
});

/**
 * POST /api/ai/analyze-insights
 * AI 여행 인사이트 분석
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    console.log('🤖 AI 여행 인사이트 분석 요청:', validated.tripName, validated.destination);

    const result = await analyzeTravelInsights(validated);

    console.log('✅ AI 여행 인사이트 분석 완료: 점수', result.overallScore);

    return Response.json({
      success: true,
      data: result,
      message: 'AI 여행 인사이트 분석이 완료되었습니다',
    });
  } catch (error) {
    console.error('POST /api/ai/analyze-insights error:', error);

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
        error: 'AI 여행 인사이트 분석 중 오류가 발생했습니다',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
