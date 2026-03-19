import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import { contactSchema } from '@/lib/validations';
import { desc, eq } from 'drizzle-orm';

// GET /api/contacts - List all contacts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = db.select().from(contacts).orderBy(desc(contacts.createdAt));

    // Filter by company
    if (companyId) {
      query = query.where(eq(contacts.companyId, companyId)) as typeof query;
    }

    const offset = (page - 1) * limit;
    const [results, countResult] = await Promise.all([
      query.limit(limit).offset(offset),
      companyId
        ? db.select().from(contacts).where(eq(contacts.companyId, companyId))
        : db.select().from(contacts),
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
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      );
    }

    const insertData = {
      ...result.data,
      companyId: result.data.companyId && result.data.companyId !== '' ? result.data.companyId : null,
      updatedAt: new Date(),
    };

    const [contact] = await db
      .insert(contacts)
      .values(insertData)
      .returning();

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Failed to create contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
