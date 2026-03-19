// app/api/trips/[id]/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { trips } from '@/lib/db/schema';
import { updateTripSchema } from '@/lib/validations/schemas';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/trips/[id]
 * 특정 여행 조회
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, id),
      with: {
        itineraries: true,
        expenses: true,
        aiRecommendations: true,
      },
    });

    if (!trip) {
      return Response.json(
        {
          success: false,
          error: '여행을 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error(`GET /api/trips/${(await params).id} error:`, error);
    return Response.json(
      {
        success: false,
        error: '여행 조회 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/trips/[id]
 * 여행 정보 수정 (Optimistic Locking)
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 입력 검증
    const validated = updateTripSchema.parse(body);

    // 현재 버전 확인 (Optimistic Locking)
    const currentTrip = await db.query.trips.findFirst({
      where: eq(trips.id, id),
    });

    if (!currentTrip) {
      return Response.json(
        {
          success: false,
          error: '여행을 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    if (validated.version && currentTrip.version !== validated.version) {
      return Response.json(
        {
          success: false,
          error: '다른 사용자가 이미 수정했습니다. 새로고침 후 다시 시도하세요',
          code: 'CONFLICT_ERROR',
        },
        { status: 409 }
      );
    }

    // 업데이트할 필드 준비
    const updateData: Record<string, unknown> = {
      version: currentTrip.version + 1,
    };

    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.destination !== undefined) updateData.destination = validated.destination;
    if (validated.country !== undefined) updateData.country = validated.country;
    if (validated.startDate !== undefined) updateData.startDate = validated.startDate;
    if (validated.endDate !== undefined) updateData.endDate = validated.endDate;
    if (validated.budget !== undefined) updateData.budget = validated.budget.toString();
    if (validated.actualSpent !== undefined) updateData.actualSpent = validated.actualSpent.toString();
    if (validated.travelers !== undefined) updateData.travelers = validated.travelers;
    if (validated.tripType !== undefined) updateData.tripType = validated.tripType;
    if (validated.status !== undefined) updateData.status = validated.status;

    // DB 업데이트
    const [updatedTrip] = await db
      .update(trips)
      .set(updateData)
      .where(eq(trips.id, id))
      .returning();

    return Response.json({
      success: true,
      data: updatedTrip,
      message: '여행이 수정되었습니다',
    });
  } catch (error) {
    console.error(`PUT /api/trips/${(await params).id} error:`, error);

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
        error: '여행 수정 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trips/[id]
 * 여행 삭제 (CASCADE로 관련 데이터 자동 삭제)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // 여행 존재 확인
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, id),
    });

    if (!trip) {
      return Response.json(
        {
          success: false,
          error: '여행을 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    // DB 삭제 (CASCADE로 itineraries, expenses, ai_recommendations도 자동 삭제)
    await db.delete(trips).where(eq(trips.id, id));

    return Response.json({
      success: true,
      message: '여행이 삭제되었습니다',
    });
  } catch (error) {
    console.error(`DELETE /api/trips/${(await params).id} error:`, error);
    return Response.json(
      {
        success: false,
        error: '여행 삭제 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}
