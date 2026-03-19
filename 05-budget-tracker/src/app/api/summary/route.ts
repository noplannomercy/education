// src/app/api/summary/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, and, like, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const year = searchParams.get('year') ?? String(now.getFullYear());
    const month = (searchParams.get('month') ?? String(now.getMonth() + 1)).padStart(2, '0');
    const datePattern = `${year}-${month}-%`;
    const userId = session.user.id;

    const dateCondition = and(eq(transactions.userId, userId), like(transactions.date, datePattern));

    // 수입/지출 합계
    const totals = await db
      .select({
        type: transactions.type,
        total: sql<number>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(dateCondition)
      .groupBy(transactions.type);

    const income = totals.find(t => t.type === 'income')?.total ?? 0;
    const expense = totals.find(t => t.type === 'expense')?.total ?? 0;

    // 카테고리별 집계
    const byCategory = await db
      .select({
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        type: transactions.type,
        total: sql<number>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(dateCondition)
      .groupBy(transactions.categoryId, transactions.type);

    return NextResponse.json({
      data: { income, expense, balance: income - expense, byCategory },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
