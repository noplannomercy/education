'use server'

import { db } from '@/lib/db'
import { categories, transactions } from '@/lib/db/schema'
import { categorySchema, type CategoryInput } from '@/lib/validations/category'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

type ActionResult<T> = { success: boolean; data?: T; error?: string }

// ========== CREATE ==========
export async function createCategory(
  input: CategoryInput
): Promise<ActionResult<typeof categories.$inferSelect>> {
  try {
    const validated = categorySchema.parse(input)

    const [result] = await db
      .insert(categories)
      .values({
        name: validated.name,
        color: validated.color,
        icon: validated.icon,
        monthlyBudget: validated.monthlyBudget ? String(validated.monthlyBudget) : null,
      })
      .returning()

    revalidatePath('/categories')
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { success: false, error: (error as any).errors[0].message }
    }
    // Unique constraint violation
    if ((error as Error).message?.includes('unique')) {
      return { success: false, error: '이미 존재하는 카테고리입니다' }
    }
    return { success: false, error: '카테고리 생성에 실패했습니다' }
  }
}

// ========== UPDATE ==========
export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<ActionResult<typeof categories.$inferSelect>> {
  try {
    const validated = categorySchema.parse(input)

    const [result] = await db
      .update(categories)
      .set({
        name: validated.name,
        color: validated.color,
        icon: validated.icon,
        monthlyBudget: validated.monthlyBudget ? String(validated.monthlyBudget) : null,
      })
      .where(eq(categories.id, id))
      .returning()

    if (!result) {
      return { success: false, error: '카테고리를 찾을 수 없습니다' }
    }

    revalidatePath('/categories')
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { success: false, error: (error as any).errors[0].message }
    }
    return { success: false, error: '카테고리 수정에 실패했습니다' }
  }
}

// ========== DELETE ==========
export async function deleteCategory(id: string): Promise<ActionResult<void>> {
  try {
    // 1. 카테고리 이름 조회
    const [category] = await db.select().from(categories).where(eq(categories.id, id))
    if (!category) {
      return { success: false, error: '카테고리를 찾을 수 없습니다' }
    }

    // 2. 해당 카테고리를 사용하는 거래가 있는지 확인
    const usedTx = await db
      .select()
      .from(transactions)
      .where(eq(transactions.category, category.name))
      .limit(1)

    if (usedTx.length > 0) {
      return { success: false, error: '사용 중인 카테고리는 삭제할 수 없습니다' }
    }

    // 3. 삭제 진행
    await db.delete(categories).where(eq(categories.id, id))
    revalidatePath('/categories')
    return { success: true }
  } catch (error) {
    return { success: false, error: '카테고리 삭제에 실패했습니다' }
  }
}

// ========== GET ALL ==========
export async function getCategories() {
  return db.select().from(categories).orderBy(categories.name)
}

// ========== GET BY NAME ==========
export async function getCategoryByName(name: string) {
  const [result] = await db.select().from(categories).where(eq(categories.name, name))
  return result ?? null
}
