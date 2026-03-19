import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { taskSchema, priorities, Priority } from '@/lib/validations';
import { NextResponse } from 'next/server';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const companyId = searchParams.get('companyId');
    const dealId = searchParams.get('dealId');
    const priority = searchParams.get('priority');
    const completed = searchParams.get('completed');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const conditions = [];

    if (contactId) {
      conditions.push(eq(tasks.contactId, contactId));
    }
    if (companyId) {
      conditions.push(eq(tasks.companyId, companyId));
    }
    if (dealId) {
      conditions.push(eq(tasks.dealId, dealId));
    }
    if (priority && priorities.includes(priority as Priority)) {
      conditions.push(eq(tasks.priority, priority as Priority));
    }
    if (completed !== null && completed !== undefined) {
      if (completed === 'true') {
        conditions.push(eq(tasks.isCompleted, true));
      } else if (completed === 'false') {
        conditions.push(eq(tasks.isCompleted, false));
      }
    }
    if (fromDate) {
      conditions.push(gte(tasks.dueDate, new Date(fromDate)));
    }
    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 999);
      conditions.push(lte(tasks.dueDate, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(whereClause)
        .orderBy(sql`${tasks.dueDate} ASC NULLS LAST, ${tasks.createdAt} DESC`)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(whereClause)
    ]);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: items,
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
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = taskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      );
    }

    // Convert dueDate string to Date if provided
    const insertData = {
      ...result.data,
      dueDate: result.data.dueDate
        ? new Date(result.data.dueDate)
        : null,
    };

    const [task] = await db
      .insert(tasks)
      .values(insertData)
      .returning();

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
