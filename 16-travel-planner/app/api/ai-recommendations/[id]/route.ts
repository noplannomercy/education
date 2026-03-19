// app/api/ai-recommendations/[id]/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { aiRecommendations } from '@/lib/db/schema';
import { updateAIRecommendationSchema } from '@/lib/validations/schemas';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/ai-recommendations/[id]
 * 특정 AI 추천 조회
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const recommendation = await db.query.aiRecommendations.findFirst({
      where: eq(aiRecommendations.id, id),
      with: {
        trip: true,
      },
    });

    if (!recommendation) {
      return Response.json(
        {
          success: false,
          error: 'AI 추천을 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error(`GET /api/ai-recommendations/${(await params).id} error:`, error);
    return Response.json(
      {
        success: false,
        error: 'AI 추천 조회 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ai-recommendations/[id]
 * AI 추천 정보 수정
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 입력 검증
    const validated = updateAIRecommendationSchema.parse(body);

    // AI 추천 존재 확인
    const recommendation = await db.query.aiRecommendations.findFirst({
      where: eq(aiRecommendations.id, id),
    });

    if (!recommendation) {
      return Response.json(
        {
          success: false,
          error: 'AI 추천을 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    // 업데이트할 필드 준비
    const updateData: Record<string, unknown> = {};

    if (validated.type !== undefined) updateData.type = validated.type;
    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.content !== undefined) updateData.content = validated.content;
    if (validated.metadata !== undefined) updateData.metadata = validated.metadata || null;
    if (validated.applied !== undefined) updateData.applied = validated.applied;

    // DB 업데이트
    const [updatedRecommendation] = await db
      .update(aiRecommendations)
      .set(updateData)
      .where(eq(aiRecommendations.id, id))
      .returning();

    return Response.json({
      success: true,
      data: updatedRecommendation,
      message: 'AI 추천이 수정되었습니다',
    });
  } catch (error) {
    console.error(`PUT /api/ai-recommendations/${(await params).id} error:`, error);

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
        error: 'AI 추천 수정 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai-recommendations/[id]
 * AI 추천 삭제
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // AI 추천 존재 확인
    const recommendation = await db.query.aiRecommendations.findFirst({
      where: eq(aiRecommendations.id, id),
    });

    if (!recommendation) {
      return Response.json(
        {
          success: false,
          error: 'AI 추천을 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    // DB 삭제
    await db.delete(aiRecommendations).where(eq(aiRecommendations.id, id));

    return Response.json({
      success: true,
      message: 'AI 추천이 삭제되었습니다',
    });
  } catch (error) {
    console.error(`DELETE /api/ai-recommendations/${(await params).id} error:`, error);
    return Response.json(
      {
        success: false,
        error: 'AI 추천 삭제 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}
