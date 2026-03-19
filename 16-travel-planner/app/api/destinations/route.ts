// app/api/destinations/route.ts

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { destinations } from '@/lib/db/schema';
import { createDestinationSchema } from '@/lib/validations/schemas';
import { eq, and, desc } from 'drizzle-orm';

/**
 * GET /api/destinations
 * 목적지 목록 조회 (필터링 지원)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const category = searchParams.get('category');

    // 필터 조건 구성
    const conditions = [];
    if (city) conditions.push(eq(destinations.city, city));
    if (country) conditions.push(eq(destinations.country, country));
    if (category) conditions.push(eq(destinations.category, category as 'attraction' | 'restaurant' | 'accommodation' | 'shopping' | 'activity'));

    // 쿼리 실행
    const result = await db
      .select()
      .from(destinations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(destinations.createdAt));

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('GET /api/destinations error:', error);
    return Response.json(
      {
        success: false,
        error: '목적지 목록 조회 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/destinations
 * 새 목적지 생성
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 입력 검증
    const validated = createDestinationSchema.parse(body);

    // DB 삽입
    const [newDestination] = await db
      .insert(destinations)
      .values({
        name: validated.name,
        city: validated.city,
        country: validated.country,
        category: validated.category,
        averageCost: validated.averageCost.toString(),
        recommendedDuration: validated.recommendedDuration,
        description: validated.description || null,
        notes: validated.notes || null,
      })
      .returning();

    return Response.json(
      {
        success: true,
        data: newDestination,
        message: '목적지가 생성되었습니다',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/destinations error:', error);

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
        error: '목적지 생성 중 오류가 발생했습니다',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}
