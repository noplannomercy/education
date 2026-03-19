// app/api/ai-recommendations/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { aiRecommendations } from '@/lib/db/schema';
import { createAIRecommendationSchema } from '@/lib/validations/schemas';
import { eq, and, desc } from 'drizzle-orm';

/**
 * GET /api/ai-recommendations
 * AI 추천 목록 조회 (여행별 필터링 지원)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get('tripId');
    const type = searchParams.get('type');
    const applied = searchParams.get('applied');

    // 필터 조건 구성
    const conditions = [];
    if (tripId) conditions.push(eq(aiRecommendations.tripId, tripId));
    if (type) conditions.push(eq(aiRecommendations.type, type as 'itinerary' | 'place' | 'budget' | 'optimization' | 'insight'));
    if (applied !== null && applied !== undefined) {
      conditions.push(eq(aiRecommendations.applied, applied === 'true'));
    }

    // 쿼리 실행
    const result = await db.query.aiRecommendations.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        trip: true,
      },
      orderBy: [desc(aiRecommendations.createdAt)],
    });

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('GET /api/ai-recommendations error:', error);
    return Response.json(
      {
        success: false,
        error: 'AI 추천 목록 조회 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-recommendations
 * 새 AI 추천 생성
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 입력 검증
    const validated = createAIRecommendationSchema.parse(body);

    // DB 삽입
    const [newRecommendation] = await db
      .insert(aiRecommendations)
      .values({
        tripId: validated.tripId,
        type: validated.type,
        title: validated.title,
        content: validated.content,
        metadata: validated.metadata || null,
        applied: validated.applied,
      })
      .returning();

    return Response.json(
      {
        success: true,
        data: newRecommendation,
        message: 'AI 추천이 생성되었습니다',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/ai-recommendations error:', error);

    // Zod 검증 에러
    if (error instanceof Error && error.name === 'ZodError') {
      return Response.json(
        {
          success: false,
          error: '입력 데이터가 올바르지 않습니다',
          code: 'VALIDATION_ERROR',
          details: error,
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: false,
        error: 'AI 추천 생성 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}
