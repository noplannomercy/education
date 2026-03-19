// app/api/expenses/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { expenses } from '@/lib/db/schema';
import { createExpenseSchema } from '@/lib/validations/schemas';
import { eq, and, desc } from 'drizzle-orm';

/**
 * GET /api/expenses
 * 지출 목록 조회 (여행별 필터링 지원)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get('tripId');
    const category = searchParams.get('category');

    // 필터 조건 구성
    const conditions = [];
    if (tripId) conditions.push(eq(expenses.tripId, tripId));
    if (category) conditions.push(eq(expenses.category, category as 'transport' | 'accommodation' | 'food' | 'activity' | 'shopping' | 'other'));

    // 쿼리 실행
    const result = await db.query.expenses.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        trip: true,
      },
      orderBy: [desc(expenses.date), desc(expenses.createdAt)],
    });

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return Response.json(
      {
        success: false,
        error: '지출 목록 조회 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/expenses
 * 새 지출 생성
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 입력 검증
    const validated = createExpenseSchema.parse(body);

    // DB 삽입
    const [newExpense] = await db
      .insert(expenses)
      .values({
        tripId: validated.tripId,
        category: validated.category,
        amount: validated.amount.toString(),
        currency: validated.currency,
        description: validated.description,
        date: validated.date,
      })
      .returning();

    return Response.json(
      {
        success: true,
        data: newExpense,
        message: '지출이 생성되었습니다',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/expenses error:', error);

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
        error: '지출 생성 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}
