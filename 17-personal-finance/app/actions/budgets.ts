'use server'

import { db } from '@/lib/db'
import { budgets, transactions } from '@/lib/db/schema'
import { budgetSchema, type BudgetInput } from '@/lib/validations/budget'
import { eq, and, gte, lte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

type ActionResult<T> = { success: boolean; data?: T; error?: string }

// ========== SAVE (UPSERT) ==========
export async function saveBudget(
  input: BudgetInput
): Promise<ActionResult<typeof budgets.$inferSelect>> {
  try {
    const validated = budgetSchema.parse(input)

    // 카테고리별 예산 합계가 총 예산을 초과하는지 검증
    const categorySum = Object.values(validated.categoryBudgets).reduce<number>(
      (sum, amount) => sum + (amount as number),
      0
    )
    if (categorySum > validated.totalBudget) {
      return {
        success: false,
        error: `카테고리별 예산 합계(${categorySum.toLocaleString()}원)가 총 예산(${validated.totalBudget.toLocaleString()}원)을 초과합니다`,
      }
    }

    // 기존 예산 확인
    const [existing] = await db
      .select()
      .from(budgets)
      .where(eq(budgets.month, validated.month))

    let result
    if (existing) {
      // UPDATE
      ;[result] = await db
        .update(budgets)
        .set({
          totalBudget: String(validated.totalBudget),
          categoryBudgets: validated.categoryBudgets as Record<string, number>,
          updatedAt: new Date(),
        })
        .where(eq(budgets.id, existing.id))
        .returning()
    } else {
      // INSERT
      ;[result] = await db
        .insert(budgets)
        .values({
          month: validated.month,
          totalBudget: String(validated.totalBudget),
          categoryBudgets: validated.categoryBudgets as Record<string, number>,
        })
        .returning()
    }

    revalidatePath('/budgets')
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { success: false, error: (error as any).errors[0].message }
    }
    console.error('saveBudget error:', error)
    return { success: false, error: '예산 저장에 실패했습니다' }
  }
}

// ========== GET BY MONTH ==========
export async function getBudget(month: string) {
  const [result] = await db
    .select()
    .from(budgets)
    .where(eq(budgets.month, month))
  return result ?? null
}

// ========== GET BUDGET USAGE ==========
export async function getBudgetUsage(month: string) {
  // 1. 해당 월 예산 조회
  const budget = await getBudget(month)

  // 2. 해당 월 지출 내역 조회
  const startDate = `${month}-01`
  const endDate = `${month}-31`

  const txList = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.type, 'expense'),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    )

  // 3. 카테고리별 지출 합계
  const spentByCategory = txList.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
    return acc
  }, {} as Record<string, number>)

  // 4. 총 지출
  const totalSpent = Object.values(spentByCategory).reduce(
    (sum, amount) => sum + amount,
    0
  )

  // 5. 예산 대비 사용률 계산
  const totalBudget = budget ? Number(budget.totalBudget) : 0
  const categoryBudgets = budget?.categoryBudgets ?? {}

  const categoryUsage = Object.entries(categoryBudgets).map(
    ([category, budgetAmount]) => {
      const spent = spentByCategory[category] || 0
      return {
        category,
        budget: budgetAmount,
        spent,
        remaining: budgetAmount - spent,
        percentage: budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0,
      }
    }
  )

  return {
    month,
    totalBudget,
    totalSpent,
    totalRemaining: totalBudget - totalSpent,
    totalPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    categoryUsage,
    spentByCategory,
  }
}

// ========== DELETE ==========
export async function deleteBudget(month: string): Promise<ActionResult<void>> {
  try {
    await db.delete(budgets).where(eq(budgets.month, month))
    revalidatePath('/budgets')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return { success: false, error: '예산 삭제에 실패했습니다' }
  }
}
