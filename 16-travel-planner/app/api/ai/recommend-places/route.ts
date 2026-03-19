// app/api/ai/recommend-places/route.ts

import { NextRequest } from 'next/server';
import { recommendPlaces } from '@/lib/ai/services/recommendPlaces';
import { AIServiceError } from '@/lib/utils/errors';
import { RateLimitError } from '@/lib/ai/utils/rateLimit';
import { z } from 'zod';

const requestSchema = z.object({
  destination: z.string().min(1, '목적지는 필수입니다'),
  country: z.string().min(1, '국가는 필수입니다'),
  category: z.enum(['attraction', 'restaurant', 'accommodation', 'shopping', 'activity']).optional(),
  budget: z.number().min(0).optional(),
  preferences: z.array(z.string()).optional(),
  count: z.number().int().min(1).max(20).default(5),
});

/**
 * POST /api/ai/recommend-places
 * AI 장소 추천
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    console.log('🤖 AI 장소 추천 요청:', validated.destination, validated.category);

    const result = await recommendPlaces(validated);

    console.log('✅ AI 장소 추천 완료:', result.places.length, '곳');

    return Response.json({
      success: true,
      data: result,
      message: 'AI 장소 추천이 완료되었습니다',
    });
  } catch (error) {
    console.error('POST /api/ai/recommend-places error:', error);

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
        error: 'AI 장소 추천 중 오류가 발생했습니다',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
