// app/api/itineraries/[id]/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { itineraries } from '@/lib/db/schema';
import { updateItinerarySchema } from '@/lib/validations/schemas';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/itineraries/[id]
 * 특정 일정 조회
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const itinerary = await db.query.itineraries.findFirst({
      where: eq(itineraries.id, id),
      with: {
        trip: true,
        destination: true,
      },
    });

    if (!itinerary) {
      return Response.json(
        {
          success: false,
          error: '일정을 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    console.error(`GET /api/itineraries/${(await params).id} error:`, error);
    return Response.json(
      {
        success: false,
        error: '일정 조회 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/itineraries/[id]
 * 일정 정보 수정
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 입력 검증
    const validated = updateItinerarySchema.parse(body);

    // 일정 존재 확인
    const itinerary = await db.query.itineraries.findFirst({
      where: eq(itineraries.id, id),
    });

    if (!itinerary) {
      return Response.json(
        {
          success: false,
          error: '일정을 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    // 업데이트할 필드 준비
    const updateData: Record<string, unknown> = {};

    if (validated.date !== undefined) updateData.date = validated.date;
    if (validated.startTime !== undefined) updateData.startTime = validated.startTime;
    if (validated.endTime !== undefined) updateData.endTime = validated.endTime;
    if (validated.destinationId !== undefined) updateData.destinationId = validated.destinationId || null;
    if (validated.activity !== undefined) updateData.activity = validated.activity;
    if (validated.notes !== undefined) updateData.notes = validated.notes || null;
    if (validated.priority !== undefined) updateData.priority = validated.priority;
    if (validated.completed !== undefined) updateData.completed = validated.completed;
    if (validated.order !== undefined) updateData.order = validated.order;

    // DB 업데이트
    const [updatedItinerary] = await db
      .update(itineraries)
      .set(updateData)
      .where(eq(itineraries.id, id))
      .returning();

    return Response.json({
      success: true,
      data: updatedItinerary,
      message: '일정이 수정되었습니다',
    });
  } catch (error) {
    console.error(`PUT /api/itineraries/${(await params).id} error:`, error);

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
        error: '일정 수정 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/itineraries/[id]
 * 일정 삭제
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // 일정 존재 확인
    const itinerary = await db.query.itineraries.findFirst({
      where: eq(itineraries.id, id),
    });

    if (!itinerary) {
      return Response.json(
        {
          success: false,
          error: '일정을 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    // DB 삭제
    await db.delete(itineraries).where(eq(itineraries.id, id));

    return Response.json({
      success: true,
      message: '일정이 삭제되었습니다',
    });
  } catch (error) {
    console.error(`DELETE /api/itineraries/${(await params).id} error:`, error);
    return Response.json(
      {
        success: false,
        error: '일정 삭제 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}
