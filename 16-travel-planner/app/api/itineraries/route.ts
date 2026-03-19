// app/api/itineraries/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { itineraries } from '@/lib/db/schema';
import { createItinerarySchema } from '@/lib/validations/schemas';
import { eq, and, desc } from 'drizzle-orm';

/**
 * GET /api/itineraries
 * 일정 목록 조회 (여행별 필터링 지원)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get('tripId');
    const date = searchParams.get('date');

    // 필터 조건 구성
    const conditions = [];
    if (tripId) conditions.push(eq(itineraries.tripId, tripId));
    if (date) conditions.push(eq(itineraries.date, date));

    // 쿼리 실행
    const result = await db.query.itineraries.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        trip: true,
        destination: true,
      },
      orderBy: [desc(itineraries.date), desc(itineraries.order)],
    });

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('GET /api/itineraries error:', error);
    return Response.json(
      {
        success: false,
        error: '일정 목록 조회 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/itineraries
 * 새 일정 생성
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 입력 검증
    const validated = createItinerarySchema.parse(body);

    // DB 삽입
    const [newItinerary] = await db
      .insert(itineraries)
      .values({
        tripId: validated.tripId,
        date: validated.date,
        startTime: validated.startTime,
        endTime: validated.endTime,
        destinationId: validated.destinationId || null,
        activity: validated.activity,
        notes: validated.notes || null,
        priority: validated.priority,
        completed: validated.completed,
        order: validated.order,
      })
      .returning();

    return Response.json(
      {
        success: true,
        data: newItinerary,
        message: '일정이 생성되었습니다',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/itineraries error:', error);

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
        error: '일정 생성 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}
