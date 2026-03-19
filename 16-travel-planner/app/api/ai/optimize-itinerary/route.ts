// app/api/ai/optimize-itinerary/route.ts

import { NextRequest } from 'next/server';
import { optimizeItinerary } from '@/lib/ai/services/optimizeItinerary';
import { AIServiceError } from '@/lib/utils/errors';
import { RateLimitError } from '@/lib/ai/utils/rateLimit';
import { z } from 'zod';

const itineraryItemSchema = z.object({
  id: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  activity: z.string(),
  location: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  completed: z.boolean(),
});

const constraintsSchema = z.object({
  budget: z.number().optional(),
  interests: z.array(z.string()).optional(),
  mobility: z.enum(['high', 'medium', 'low']).optional(),
});

const requestSchema = z.object({
  tripId: z.string().min(1, '여행 ID는 필수입니다'),
  destination: z.string().min(1, '목적지는 필수입니다'),
  itineraries: z.array(itineraryItemSchema),
  constraints: constraintsSchema.optional(),
});

/**
 * POST /api/ai/optimize-itinerary
 * AI 일정 최적화
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    console.log('🤖 AI 일정 최적화 요청:', validated.destination, validated.itineraries.length, '개 일정');

    const result = await optimizeItinerary(validated);

    console.log('✅ AI 일정 최적화 완료:', result.optimizedSchedule.length, '개 제안');

    return Response.json({
      success: true,
      data: result,
      message: 'AI 일정 최적화가 완료되었습니다',
    });
  } catch (error) {
    console.error('POST /api/ai/optimize-itinerary error:', error);

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
        error: 'AI 일정 최적화 중 오류가 발생했습니다',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
