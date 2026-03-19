import { db } from '@/lib/db';
import { companyTags } from '@/lib/db/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string; tagId: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id: companyId, tagId } = await context.params;

    const deleted = await db
      .delete(companyTags)
      .where(
        and(
          eq(companyTags.companyId, companyId),
          eq(companyTags.tagId, tagId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Tag assignment not found' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to remove tag:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag' },
      { status: 500 }
    );
  }
}
