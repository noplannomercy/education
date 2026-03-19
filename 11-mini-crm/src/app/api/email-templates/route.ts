import { db } from '@/lib/db';
import { emailTemplates } from '@/lib/db/schema';
import { emailTemplateSchema } from '@/lib/validations';
import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const templates = await db
      .select()
      .from(emailTemplates)
      .orderBy(desc(emailTemplates.createdAt));

    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error('Failed to fetch email templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = emailTemplateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      );
    }

    const [template] = await db
      .insert(emailTemplates)
      .values({
        ...result.data,
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Failed to create email template:', error);
    return NextResponse.json(
      { error: 'Failed to create email template' },
      { status: 500 }
    );
  }
}
