import { db } from '@/lib/db';
import { tags } from '@/lib/db/schema';
import { tagSchema } from '@/lib/validations';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allTags = await db
      .select()
      .from(tags)
      .orderBy(tags.name);

    return NextResponse.json({ data: allTags });
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = tagSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      );
    }

    // Check if tag name already exists
    const existing = await db
      .select()
      .from(tags)
      .where(eq(tags.name, result.data.name))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: '이미 존재하는 태그명입니다' },
        { status: 409 }
      );
    }

    const [tag] = await db
      .insert(tags)
      .values(result.data)
      .returning();

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Failed to create tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
