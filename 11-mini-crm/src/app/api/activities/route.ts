import { db } from '@/lib/db';
import { activities, contacts, companies, deals } from '@/lib/db/schema';
import { activitySchema, activityTypes, ActivityType } from '@/lib/validations';
import { NextResponse } from 'next/server';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const companyId = searchParams.get('companyId');
    const dealId = searchParams.get('dealId');
    const type = searchParams.get('type');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const conditions = [];

    if (contactId) {
      conditions.push(eq(activities.contactId, contactId));
    }
    if (companyId) {
      conditions.push(eq(activities.companyId, companyId));
    }
    if (dealId) {
      conditions.push(eq(activities.dealId, dealId));
    }
    if (type && activityTypes.includes(type as ActivityType)) {
      conditions.push(eq(activities.type, type as ActivityType));
    }
    if (fromDate) {
      conditions.push(gte(activities.scheduledAt, new Date(fromDate)));
    }
    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(activities.scheduledAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: activities.id,
          type: activities.type,
          title: activities.title,
          description: activities.description,
          scheduledAt: activities.scheduledAt,
          completedAt: activities.completedAt,
          contactId: activities.contactId,
          companyId: activities.companyId,
          dealId: activities.dealId,
          createdAt: activities.createdAt,
          updatedAt: activities.updatedAt,
          contact: {
            id: contacts.id,
            name: contacts.name,
          },
          company: {
            id: companies.id,
            name: companies.name,
          },
          deal: {
            id: deals.id,
            title: deals.title,
          },
        })
        .from(activities)
        .leftJoin(contacts, eq(activities.contactId, contacts.id))
        .leftJoin(companies, eq(activities.companyId, companies.id))
        .leftJoin(deals, eq(activities.dealId, deals.id))
        .where(whereClause)
        .orderBy(sql`${activities.scheduledAt} DESC NULLS LAST, ${activities.createdAt} DESC`)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(activities)
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
    console.error('Failed to fetch activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = activitySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      );
    }

    // Validate at least one parent is provided
    const { contactId, companyId, dealId } = result.data;
    if (!contactId && !companyId && !dealId) {
      return NextResponse.json(
        { error: '연락처, 회사, 거래 중 최소 하나는 연결해야 합니다' },
        { status: 400 }
      );
    }

    // Convert scheduledAt string to Date if provided
    const insertData = {
      ...result.data,
      scheduledAt: result.data.scheduledAt
        ? new Date(result.data.scheduledAt)
        : null,
    };

    const [activity] = await db
      .insert(activities)
      .values(insertData)
      .returning();

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Failed to create activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
