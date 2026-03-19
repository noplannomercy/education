import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { companies } from '@/lib/db/schema';
import { companySchema } from '@/lib/validations';
import { desc } from 'drizzle-orm';

// GET /api/companies - List all companies with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const cursor = searchParams.get('cursor');

    // Cursor-based pagination
    if (cursor) {
      // Get all companies and filter out those with id <= cursor
      const allCompanies = await db
        .select()
        .from(companies)
        .orderBy(desc(companies.createdAt));

      // Find index of cursor
      const cursorIndex = allCompanies.findIndex(c => c.id === cursor);

      // Return next `limit` items after cursor
      const results = allCompanies.slice(cursorIndex + 1, cursorIndex + 1 + limit);

      return NextResponse.json({
        data: results,
      });
    }

    // Offset-based pagination
    const offset = (page - 1) * limit;

    const [results, countResult] = await Promise.all([
      db
        .select()
        .from(companies)
        .orderBy(desc(companies.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select()
        .from(companies),
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
    console.error('Failed to fetch companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = companySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      );
    }

    const [company] = await db
      .insert(companies)
      .values({
        ...result.data,
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Failed to create company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
