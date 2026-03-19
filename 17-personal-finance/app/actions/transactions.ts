'use server'

import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schema'
import { transactionSchema, type TransactionInput } from '@/lib/validations/transaction'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

type ActionResult<T> = { success: boolean; data?: T; error?: string }

// ========== CREATE ==========
export async function createTransaction(
  input: TransactionInput
): Promise<ActionResult<typeof transactions.$inferSelect>> {
  try {
    const validated = transactionSchema.parse(input)

    const [result] = await db
      .insert(transactions)
      .values({
        amount: String(validated.amount),
        category: validated.category,
        description: validated.description,
        date: validated.date,
        type: validated.type,
        paymentMethod: validated.paymentMethod,
      })
      .returning()

    revalidatePath('/transactions')
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { success: false, error: (error as any).errors[0].message }
    }
    console.error('createTransaction error:', error)
    return { success: false, error: '거래 생성에 실패했습니다' }
  }
}

// ========== UPDATE ==========
export async function updateTransaction(
  id: string,
  input: TransactionInput
): Promise<ActionResult<typeof transactions.$inferSelect>> {
  try {
    const validated = transactionSchema.parse(input)

    const [result] = await db
      .update(transactions)
      .set({
        amount: String(validated.amount),
        category: validated.category,
        description: validated.description,
        date: validated.date,
        type: validated.type,
        paymentMethod: validated.paymentMethod,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning()

    if (!result) {
      return { success: false, error: '거래를 찾을 수 없습니다' }
    }

    revalidatePath('/transactions')
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { success: false, error: (error as any).errors[0].message }
    }
    return { success: false, error: '거래 수정에 실패했습니다' }
  }
}

// ========== DELETE ==========
export async function deleteTransaction(id: string): Promise<ActionResult<void>> {
  try {
    await db.delete(transactions).where(eq(transactions.id, id))
    revalidatePath('/transactions')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return { success: false, error: '거래 삭제에 실패했습니다' }
  }
}

// ========== GET ALL ==========
export async function getTransactions(filters?: {
  startDate?: string
  endDate?: string
  category?: string
  type?: 'income' | 'expense'
}) {
  const conditions = []

  if (filters?.startDate) {
    conditions.push(gte(transactions.date, filters.startDate))
  }
  if (filters?.endDate) {
    conditions.push(lte(transactions.date, filters.endDate))
  }
  if (filters?.category) {
    conditions.push(eq(transactions.category, filters.category))
  }
  if (filters?.type) {
    conditions.push(eq(transactions.type, filters.type))
  }

  return db
    .select()
    .from(transactions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(transactions.date))
}

// ========== GET BY ID ==========
export async function getTransactionById(id: string) {
  const [result] = await db.select().from(transactions).where(eq(transactions.id, id))
  return result ?? null
}

// ========== GET MONTHLY STATS ==========
export async function getMonthlyStats(month: string) {
  const [year, monthNum] = month.split('-').map(Number)
  const startDate = `${month}-01`
  // Get the last day of the month
  const lastDay = new Date(year, monthNum, 0).getDate()
  const endDate = `${month}-${String(lastDay).padStart(2, '0')}`

  const txList = await db
    .select()
    .from(transactions)
    .where(and(gte(transactions.date, startDate), lte(transactions.date, endDate)))

  const income = txList
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expense = txList
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const byCategory = txList
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
      return acc
    }, {} as Record<string, number>)

  return {
    income,
    expense,
    savings: income - expense,
    savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
    byCategory,
  }
}
