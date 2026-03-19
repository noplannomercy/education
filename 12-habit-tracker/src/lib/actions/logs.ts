'use server'

import { db } from '@/lib/db'
import { habitLogs } from '@/lib/db/schema'
import { validateCheckDate } from '@/lib/utils/date'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Check a habit (create a log entry)
 * Validates date and prevents duplicate checks via unique constraint
 */
export async function checkHabit(
  habitId: string,
  date: string,
  memo?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Validate date
    const validation = validateCheckDate(date)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // 2. Insert log
    const result = await db
      .insert(habitLogs)
      .values({
        habitId,
        date,
        memo: memo || null,
      })
      .returning({ id: habitLogs.id })

    revalidatePath('/today')
    revalidatePath('/habits')
    
    return {
      success: true,
      data: { id: result[0].id },
    }
  } catch (error: any) {
    console.error('Failed to check habit:', error)
    
    // Handle unique constraint violation (23505 = duplicate key)
    if (error.code === '23505') {
      return {
        success: false,
        error: '이미 체크한 날짜입니다',
      }
    }

    // Handle CHECK constraint violation (23514)
    if (error.code === '23514') {
      return {
        success: false,
        error: '유효하지 않은 날짜입니다',
      }
    }

    return {
      success: false,
      error: '체크에 실패했습니다',
    }
  }
}

/**
 * Uncheck a habit (delete a log entry)
 */
export async function uncheckHabit(
  habitId: string,
  date: string
): Promise<ActionResult> {
  try {
    await db
      .delete(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, habitId),
          eq(habitLogs.date, date)
        )
      )

    revalidatePath('/today')
    revalidatePath('/habits')
    
    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to uncheck habit:', error)
    return {
      success: false,
      error: '체크 해제에 실패했습니다',
    }
  }
}
