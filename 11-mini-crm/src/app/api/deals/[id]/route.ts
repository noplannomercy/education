import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deals, activities } from '@/lib/db/schema';
import { dealSchema } from '@/lib/validations';
import { eq } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/deals/:id - Get deal by ID
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const [deal] = await db
      .select()
      .from(deals)
      .where(eq(deals.id, id));

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error('Failed to fetch deal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    );
  }
}

// PUT /api/deals/:id - Update deal
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const result = dealSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      );
    }

    // Get current deal to check if stage changed
    const [currentDeal] = await db.select().from(deals).where(eq(deals.id, id));

    if (!currentDeal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Update deal and create activity if stage changed
    const updateData = {
      ...result.data,
      expectedCloseDate: result.data.expectedCloseDate && result.data.expectedCloseDate !== ''
        ? new Date(result.data.expectedCloseDate)
        : null,
      contactId: result.data.contactId && result.data.contactId !== '' ? result.data.contactId : null,
      companyId: result.data.companyId && result.data.companyId !== '' ? result.data.companyId : null,
      updatedAt: new Date(),
    };

    const [updatedDeal] = await db.transaction(async (tx) => {
      const [deal] = await tx
        .update(deals)
        .set(updateData)
        .where(eq(deals.id, id))
        .returning();

      // Create activity if stage changed
      if (currentDeal.stage !== result.data.stage) {
        await tx.insert(activities).values({
          type: 'note',
          title: `단계 변경: ${currentDeal.stage} → ${result.data.stage}`,
          dealId: id,
        });
      }

      return [deal];
    });

    return NextResponse.json(updatedDeal);
  } catch (error) {
    console.error('Failed to update deal:', error);
    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}

// PATCH /api/deals/:id - Partially update deal
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  return PUT(request, context);
}

// DELETE /api/deals/:id - Delete deal
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const [deleted] = await db
      .delete(deals)
      .where(eq(deals.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete deal:', error);
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}
