// app/api/destinations/[id]/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { destinations } from '@/lib/db/schema';
import { updateDestinationSchema } from '@/lib/validations/schemas';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/destinations/[id]
 * 특정 목적지 조회
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const destination = await db.query.destinations.findFirst({
      where: eq(destinations.id, id),
    });

    if (!destination) {
      return Response.json(
        {
          success: false,
          error: '목적지를 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: destination,
    });
  } catch (error) {
    console.error(`GET /api/destinations/${(await params).id} error:`, error);
    return Response.json(
      {
        success: false,
        error: '목적지 조회 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/destinations/[id]
 * 목적지 정보 수정
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 입력 검증
    const validated = updateDestinationSchema.parse(body);

    // 목적지 존재 확인
    const destination = await db.query.destinations.findFirst({
      where: eq(destinations.id, id),
    });

    if (!destination) {
      return Response.json(
        {
          success: false,
          error: '목적지를 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    // 업데이트할 필드 준비
    const updateData: Record<string, unknown> = {};

    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.city !== undefined) updateData.city = validated.city;
    if (validated.country !== undefined) updateData.country = validated.country;
    if (validated.category !== undefined) updateData.category = validated.category;
    if (validated.averageCost !== undefined) updateData.averageCost = validated.averageCost.toString();
    if (validated.recommendedDuration !== undefined) updateData.recommendedDuration = validated.recommendedDuration;
    if (validated.description !== undefined) updateData.description = validated.description || null;
    if (validated.notes !== undefined) updateData.notes = validated.notes || null;

    // DB 업데이트
    const [updatedDestination] = await db
      .update(destinations)
      .set(updateData)
      .where(eq(destinations.id, id))
      .returning();

    return Response.json({
      success: true,
      data: updatedDestination,
      message: '목적지가 수정되었습니다',
    });
  } catch (error) {
    console.error(`PUT /api/destinations/${(await params).id} error:`, error);

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
        error: '목적지 수정 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/destinations/[id]
 * 목적지 삭제
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // 목적지 존재 확인
    const destination = await db.query.destinations.findFirst({
      where: eq(destinations.id, id),
    });

    if (!destination) {
      return Response.json(
        {
          success: false,
          error: '목적지를 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    // DB 삭제
    await db.delete(destinations).where(eq(destinations.id, id));

    return Response.json({
      success: true,
      message: '목적지가 삭제되었습니다',
    });
  } catch (error) {
    console.error(`DELETE /api/destinations/${(await params).id} error:`, error);
    return Response.json(
      {
        success: false,
        error: '목적지 삭제 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}
