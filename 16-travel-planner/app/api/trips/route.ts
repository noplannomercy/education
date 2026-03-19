// app/api/trips/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { trips } from '@/lib/db/schema';
import { createTripSchema } from '@/lib/validations/schemas';
import { ValidationError, DatabaseError } from '@/lib/utils/errors';
import { eq, and, desc } from 'drizzle-orm';

/**
 * GET /api/trips
 * 여행 목록 조회 (필터링 지원)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const tripType = searchParams.get('tripType');

    // 필터 조건 구성
    const conditions = [];
    if (userId) conditions.push(eq(trips.userId, userId));
    if (status) conditions.push(eq(trips.status, status as 'planning' | 'ongoing' | 'completed'));
    if (tripType) conditions.push(eq(trips.tripType, tripType as 'vacation' | 'business' | 'adventure' | 'backpacking'));

    // 쿼리 실행
    const result = await db
      .select()
      .from(trips)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(trips.createdAt));

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('GET /api/trips error:', error);
    return Response.json(
      {
        success: false,
        error: '여행 목록 조회 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trips
 * 새 여행 생성
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 입력 검증
    const validated = createTripSchema.parse(body);

    // DB 삽입
    const [newTrip] = await db
      .insert(trips)
      .values({
        userId: validated.userId,
        name: validated.name,
        destination: validated.destination,
        country: validated.country,
        startDate: validated.startDate,
        endDate: validated.endDate,
        budget: validated.budget.toString(),
        actualSpent: (validated.actualSpent || 0).toString(),
        travelers: validated.travelers,
        tripType: validated.tripType,
        status: validated.status || 'planning',
      })
      .returning();

    return Response.json(
      {
        success: true,
        data: newTrip,
        message: '여행이 생성되었습니다',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/trips error:', error);

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

    // DB 에러
    return Response.json(
      {
        success: false,
        error: '여행 생성 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}
