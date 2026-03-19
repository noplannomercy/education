'use server'

import { db } from '@/lib/db'
import { habits } from '@/lib/db/schema'
import { habitSchema, type HabitInput } from '@/lib/types'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a new habit
 */
export async function createHabit(input: HabitInput): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate input
    const validatedData = habitSchema.parse(input)

    // Insert into database
    const result = await db
      .insert(habits)
      .values({
        name: validatedData.name,
        description: validatedData.description || null,
        category: validatedData.category,
        color: validatedData.color,
        icon: null, // Explicitly set to null for Vercel compatibility
        targetFrequency: validatedData.targetFrequency,
      })
      .returning({ id: habits.id })

    revalidatePath('/habits')
    
    return {
      success: true,
      data: { id: result[0].id },
    }
  } catch (error) {
    console.error('Failed to create habit:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '습관 생성에 실패했습니다',
    }
  }
}

/**
 * Update an existing habit
 */
export async function updateHabit(
  id: string,
  input: Partial<HabitInput>
): Promise<ActionResult> {
  try {
    // Validate input (partial)
    const validatedData = habitSchema.partial().parse(input)

    // Update database
    await db
      .update(habits)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(habits.id, id))

    revalidatePath('/habits')
    
    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to update habit:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '습관 수정에 실패했습니다',
    }
  }
}

/**
 * Archive a habit (soft delete)
 */
export async function archiveHabit(id: string): Promise<ActionResult> {
  try {
    await db
      .update(habits)
      .set({
        isArchived: true,
        updatedAt: new Date(),
      })
      .where(eq(habits.id, id))

    revalidatePath('/habits')
    
    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to archive habit:', error)
    return {
      success: false,
      error: '습관 보관에 실패했습니다',
    }
  }
}

/**
 * Restore an archived habit
 */
export async function restoreHabit(id: string): Promise<ActionResult> {
  try {
    await db
      .update(habits)
      .set({
        isArchived: false,
        updatedAt: new Date(),
      })
      .where(eq(habits.id, id))

    revalidatePath('/habits')
    revalidatePath('/habits/archived')
    
    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to restore habit:', error)
    return {
      success: false,
      error: '습관 복원에 실패했습니다',
    }
  }
}

/**
 * Delete a habit permanently (hard delete)
 * This will CASCADE delete all related habit_logs
 */
export async function deleteHabit(id: string): Promise<ActionResult> {
  try {
    await db
      .delete(habits)
      .where(eq(habits.id, id))

    revalidatePath('/habits')
    revalidatePath('/habits/archived')
    
    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to delete habit:', error)
    return {
      success: false,
      error: '습관 삭제에 실패했습니다',
    }
  }
}
