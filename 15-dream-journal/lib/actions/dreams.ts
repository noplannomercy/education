'use server'

import { db } from '@/lib/db'
import { dreams, insertDreamSchema, type Dream, type InsertDream } from '@/lib/db/schema'
import { ValidationError, DatabaseError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

/**
 * Create a new dream entry
 */
export async function createDream(data: InsertDream): Promise<Dream> {
  try {
    // Validate input
    const validatedData = insertDreamSchema.parse(data)

    // Insert into database
    const [newDream] = await db
      .insert(dreams)
      .values({
        ...validatedData,
        date: validatedData.date.toISOString().split('T')[0], // Convert to date string
      })
      .returning()

    logger.info('Dream created successfully', { dreamId: newDream.id })

    // Revalidate relevant paths
    revalidatePath('/')
    revalidatePath('/calendar')
    revalidatePath('/stats')

    return newDream
  } catch (error) {
    logger.error('Failed to create dream', error)
    if (error instanceof ValidationError) {
      throw error
    }
    throw new DatabaseError('꿈 기록 생성에 실패했습니다')
  }
}

/**
 * Get all dreams, ordered by date (most recent first)
 */
export async function getAllDreams(): Promise<Dream[]> {
  try {
    const allDreams = await db
      .select()
      .from(dreams)
      .orderBy(desc(dreams.date), desc(dreams.createdAt))

    return allDreams
  } catch (error) {
    logger.error('Failed to fetch dreams', error)
    throw new DatabaseError('꿈 기록을 불러오는데 실패했습니다')
  }
}

/**
 * Get a single dream by ID
 */
export async function getDreamById(id: string): Promise<Dream | null> {
  try {
    const [dream] = await db
      .select()
      .from(dreams)
      .where(eq(dreams.id, id))
      .limit(1)

    return dream || null
  } catch (error) {
    logger.error('Failed to fetch dream', { dreamId: id, error })
    throw new DatabaseError('꿈 기록을 불러오는데 실패했습니다')
  }
}

/**
 * Update an existing dream
 */
export async function updateDream(
  id: string,
  data: Partial<InsertDream>
): Promise<Dream> {
  try {
    // Validate input
    const validatedData = insertDreamSchema.partial().parse(data)

    // Update in database
    const [updatedDream] = await db
      .update(dreams)
      .set({
        ...validatedData,
        date: validatedData.date
          ? validatedData.date.toISOString().split('T')[0]
          : undefined,
        updatedAt: new Date(),
      })
      .where(eq(dreams.id, id))
      .returning()

    if (!updatedDream) {
      throw new ValidationError('꿈 기록을 찾을 수 없습니다')
    }

    logger.info('Dream updated successfully', { dreamId: id })

    // Revalidate relevant paths
    revalidatePath('/')
    revalidatePath('/calendar')
    revalidatePath('/stats')
    revalidatePath(`/dreams/${id}`)

    return updatedDream
  } catch (error) {
    logger.error('Failed to update dream', { dreamId: id, error })
    if (error instanceof ValidationError) {
      throw error
    }
    throw new DatabaseError('꿈 기록 수정에 실패했습니다')
  }
}

/**
 * Delete a dream by ID
 */
export async function deleteDream(id: string): Promise<void> {
  try {
    const result = await db.delete(dreams).where(eq(dreams.id, id)).returning()

    if (result.length === 0) {
      throw new ValidationError('꿈 기록을 찾을 수 없습니다')
    }

    logger.info('Dream deleted successfully', { dreamId: id })

    // Revalidate relevant paths
    revalidatePath('/')
    revalidatePath('/calendar')
    revalidatePath('/stats')
  } catch (error) {
    logger.error('Failed to delete dream', { dreamId: id, error })
    if (error instanceof ValidationError) {
      throw error
    }
    throw new DatabaseError('꿈 기록 삭제에 실패했습니다')
  }
}

/**
 * Get dreams by date range
 */
export async function getDreamsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Dream[]> {
  try {
    const { gte, lte } = await import('drizzle-orm')

    const dreamsInRange = await db
      .select()
      .from(dreams)
      .where(
        gte(dreams.date, startDate.toISOString().split('T')[0]) &&
          lte(dreams.date, endDate.toISOString().split('T')[0])
      )
      .orderBy(desc(dreams.date))

    return dreamsInRange
  } catch (error) {
    logger.error('Failed to fetch dreams by date range', error)
    throw new DatabaseError('꿈 기록을 불러오는데 실패했습니다')
  }
}

/**
 * Get recent dreams (limit: 10)
 */
export async function getRecentDreams(limit = 10): Promise<Dream[]> {
  try {
    const recentDreams = await db
      .select()
      .from(dreams)
      .orderBy(desc(dreams.createdAt))
      .limit(limit)

    return recentDreams
  } catch (error) {
    logger.error('Failed to fetch recent dreams', error)
    throw new DatabaseError('최근 꿈 기록을 불러오는데 실패했습니다')
  }
}
