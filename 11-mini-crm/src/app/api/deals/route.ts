import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deals } from '@/lib/db/schema';
import { dealSchema, dealStages, DealStage } from '@/lib/validations';
import { desc, eq } from 'drizzle-orm';

// GET /api/deals - List all deals
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const stage = searchParams.get('stage');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = db.select().from(deals).orderBy(desc(deals.createdAt));

    // Filter by stage
    if (stage && dealStages.includes(stage as DealStage)) {
      query = query.where(eq(deals.stage, stage as DealStage)) as typeof query;
    }

    const offset = (page - 1) * limit;
    const [results, countResult] = await Promise.all([
      query.limit(limit).offset(offset),
      stage && dealStages.includes(stage as DealStage)
        ? db.select().from(deals).where(eq(deals.stage, stage as DealStage))
        : db.select().from(deals),
    ]);

    const total = countResult.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Failed to fetch deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

// POST /api/deals - Create a new deal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = dealSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      );
    }

    const insertData = {
      ...result.data,
      expectedCloseDate: result.data.expectedCloseDate && result.data.expectedCloseDate !== ''
        ? new Date(result.data.expectedCloseDate)
        : null,
      contactId: result.data.contactId && result.data.contactId !== '' ? result.data.contactId : null,
      companyId: result.data.companyId && result.data.companyId !== '' ? result.data.companyId : null,
      updatedAt: new Date(),
    };

    const [deal] = await db
      .insert(deals)
      .values(insertData)
      .returning();

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error('Failed to create deal:', error);
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}
