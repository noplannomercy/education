// app/api/expenses/[id]/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { expenses } from '@/lib/db/schema';
import { updateExpenseSchema } from '@/lib/validations/schemas';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/expenses/[id]
 * 특정 지출 조회
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, id),
      with: {
        trip: true,
      },
    });

    if (!expense) {
      return Response.json(
        {
          success: false,
          error: '지출을 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error(`GET /api/expenses/${(await params).id} error:`, error);
    return Response.json(
      {
        success: false,
        error: '지출 조회 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/expenses/[id]
 * 지출 정보 수정
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 입력 검증
    const validated = updateExpenseSchema.parse(body);

    // 지출 존재 확인
    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, id),
    });

    if (!expense) {
      return Response.json(
        {
          success: false,
          error: '지출을 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    // 업데이트할 필드 준비
    const updateData: Record<string, unknown> = {};

    if (validated.category !== undefined) updateData.category = validated.category;
    if (validated.amount !== undefined) updateData.amount = validated.amount.toString();
    if (validated.currency !== undefined) updateData.currency = validated.currency;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.date !== undefined) updateData.date = validated.date;

    // DB 업데이트
    const [updatedExpense] = await db
      .update(expenses)
      .set(updateData)
      .where(eq(expenses.id, id))
      .returning();

    return Response.json({
      success: true,
      data: updatedExpense,
      message: '지출이 수정되었습니다',
    });
  } catch (error) {
    console.error(`PUT /api/expenses/${(await params).id} error:`, error);

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
        error: '지출 수정 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/expenses/[id]
 * 지출 삭제
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // 지출 존재 확인
    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, id),
    });

    if (!expense) {
      return Response.json(
        {
          success: false,
          error: '지출을 찾을 수 없습니다',
          code: 'NOT_FOUND_ERROR',
        },
        { status: 404 }
      );
    }

    // DB 삭제
    await db.delete(expenses).where(eq(expenses.id, id));

    return Response.json({
      success: true,
      message: '지출이 삭제되었습니다',
    });
  } catch (error) {
    console.error(`DELETE /api/expenses/${(await params).id} error:`, error);
    return Response.json(
      {
        success: false,
        error: '지출 삭제 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}
