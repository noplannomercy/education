import { db } from '@/lib/db';
import { categories, transactions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export type CreateCategoryData = {
  name: string;
  type: 'income' | 'expense';
  color: string;
};

export async function getCategories(userId: string, type?: 'income' | 'expense') {
  const conditions = type
    ? and(eq(categories.userId, userId), eq(categories.type, type))
    : eq(categories.userId, userId);
  return db.select().from(categories).where(conditions);
}

export async function createCategory(userId: string, data: CreateCategoryData) {
  const [cat] = await db.insert(categories).values({ ...data, userId }).returning();
  return cat;
}

export async function updateCategory(id: string, userId: string, data: Partial<CreateCategoryData>) {
  const [cat] = await db.update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();
  return cat ?? null;
}

export async function deleteCategory(id: string, userId: string) {
  await db.update(transactions).set({ categoryId: null }).where(eq(transactions.categoryId, id));
  const [cat] = await db.delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();
  return cat ?? null;
}
