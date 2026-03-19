// src/lib/services/transaction.service.ts
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, and, like, desc } from 'drizzle-orm';

export type CreateTransactionData = {
  amount: number;
  type: 'income' | 'expense';
  categoryId?: string | null;
  description?: string;
  date: string; // YYYY-MM-DD
};

export type TransactionFilters = {
  year?: string;
  month?: string;
  categoryId?: string;
  type?: 'income' | 'expense';
};

export async function getTransactions(userId: string, filters: TransactionFilters = {}) {
  const conditions = [eq(transactions.userId, userId)];

  if (filters.year && filters.month) {
    const mm = filters.month.padStart(2, '0');
    conditions.push(like(transactions.date, `${filters.year}-${mm}-%`));
  } else if (filters.year) {
    conditions.push(like(transactions.date, `${filters.year}-%`));
  }
  if (filters.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));
  if (filters.type) conditions.push(eq(transactions.type, filters.type));

  return db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      description: transactions.description,
      date: transactions.date,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date));
}

export async function createTransaction(userId: string, data: CreateTransactionData) {
  const [tx] = await db.insert(transactions).values({ ...data, userId }).returning();
  return tx;
}

export async function updateTransaction(id: string, userId: string, data: Partial<CreateTransactionData>) {
  const [tx] = await db.update(transactions)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning();
  return tx ?? null;
}

export async function deleteTransaction(id: string, userId: string) {
  const [tx] = await db.delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning();
  return tx ?? null;
}
