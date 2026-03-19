import { db } from '@/lib/db';
import { companyTags, tags } from '@/lib/db/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const addTagSchema = z.object({
  tagId: z.string().uuid(),
});

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: companyId } = await context.params;
    const body = await request.json();
    const result = addTagSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      );
    }

    // Check if tag exists
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, result.data.tagId))
      .limit(1);

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Check if already assigned
    const existing = await db
      .select()
      .from(companyTags)
      .where(
        and(
          eq(companyTags.companyId, companyId),
          eq(companyTags.tagId, result.data.tagId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: '이미 할당된 태그입니다' },
        { status: 409 }
      );
    }

    await db.insert(companyTags).values({
      companyId,
      tagId: result.data.tagId,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to add tag:', error);
    return NextResponse.json(
      { error: 'Failed to add tag' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id: companyId } = await context.params;

    const companyTagsList = await db
      .select({
        id: tags.id,
        name: tags.name,
        color: tags.color,
      })
      .from(companyTags)
      .innerJoin(tags, eq(companyTags.tagId, tags.id))
      .where(eq(companyTags.companyId, companyId));

    return NextResponse.json({ data: companyTagsList });
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
