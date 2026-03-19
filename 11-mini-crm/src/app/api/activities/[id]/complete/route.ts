import { db } from '@/lib/db';
import { activities } from '@/lib/db/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const completeSchema = z.object({
  completedAt: z.string().datetime().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = completeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      );
    }

    const completedAt = result.data.completedAt
      ? new Date(result.data.completedAt)
      : new Date();

    const [activity] = await db
      .update(activities)
      .set({
        completedAt,
        updatedAt: new Date(),
      })
      .where(eq(activities.id, id))
      .returning();

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Failed to complete activity:', error);
    return NextResponse.json(
      { error: 'Failed to complete activity' },
      { status: 500 }
    );
  }
}
