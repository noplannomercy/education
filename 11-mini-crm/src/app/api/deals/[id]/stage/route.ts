import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deals, activities } from '@/lib/db/schema';
import { dealStageUpdateSchema } from '@/lib/validations';
import { eq } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/deals/:id/stage - Update deal stage with optimistic locking
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const result = dealStageUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      );
    }

    // Get current deal
    const [currentDeal] = await db.select().from(deals).where(eq(deals.id, id));

    if (!currentDeal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Check optimistic lock
    const clientUpdatedAt = new Date(result.data.updatedAt);
    const serverUpdatedAt = new Date(currentDeal.updatedAt);

    if (Math.abs(clientUpdatedAt.getTime() - serverUpdatedAt.getTime()) > 1000) {
      return NextResponse.json(
        { error: 'Deal has been modified by another user. Please refresh and try again.' },
        { status: 409 }
      );
    }

    // Update stage and create activity
    await db.transaction(async (tx) => {
      await tx
        .update(deals)
        .set({
          stage: result.data.stage,
          updatedAt: new Date(),
        })
        .where(eq(deals.id, id));

      // Create activity
      await tx.insert(activities).values({
        type: 'note',
        title: `단계 변경: ${currentDeal.stage} → ${result.data.stage}`,
        dealId: id,
      });
    });

    // Fetch updated deal
    const [updatedDeal] = await db.select().from(deals).where(eq(deals.id, id));

    return NextResponse.json(updatedDeal);
  } catch (error) {
    console.error('Failed to update deal stage:', error);
    return NextResponse.json(
      { error: 'Failed to update deal stage' },
      { status: 500 }
    );
  }
}
