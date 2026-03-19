// app/api/ai/generate-itinerary/route.ts

import { NextRequest } from 'next/server';
import { generateItinerary } from '@/lib/ai/services/generateItinerary';
import { AIServiceError } from '@/lib/utils/errors';
import { RateLimitError } from '@/lib/ai/utils/rateLimit';
import { z } from 'zod';

const requestSchema = z.object({
  destination: z.string().min(1, '목적지는 필수입니다'),
  country: z.string().min(1, '국가는 필수입니다'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD'),
  budget: z.number().min(0, '예산은 0 이상이어야 합니다'),
  travelers: z.number().int().min(1, '여행 인원은 1명 이상이어야 합니다'),
  tripType: z.enum(['vacation', 'business', 'adventure', 'backpacking']),
  preferences: z.array(z.string()).optional(),
});

/**
 * POST /api/ai/generate-itinerary
 * AI 일정 자동 생성
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 입력 검증
    const validated = requestSchema.parse(body);

    console.log('🤖 AI 일정 생성 요청:', validated.destination);

    // AI 서비스 호출
    const result = await generateItinerary(validated);

    console.log('✅ AI 일정 생성 완료:', result.dailyPlans.length, '일');

    return Response.json({
      success: true,
      data: result,
      message: 'AI 일정이 생성되었습니다',
    });
  } catch (error) {
    console.error('POST /api/ai/generate-itinerary error:', error);

    // Rate Limit 에러
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

    // Zod 검증 에러
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

    // AI 서비스 에러
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

    // 기타 에러
    return Response.json(
      {
        success: false,
        error: 'AI 일정 생성 중 오류가 발생했습니다',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
