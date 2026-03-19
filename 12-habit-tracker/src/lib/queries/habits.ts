import { db } from '@/lib/db'
import { habits, habitLogs } from '@/lib/db/schema'
import { eq, desc, and, inArray, gte, sql } from 'drizzle-orm'
import { calculateStreak } from '@/lib/utils/streak'

/**
 * Get all active habits (is_archived = false)
 * Ordered by created_at DESC (newest first)
 */
export async function getActiveHabits() {
  return await db
    .select()
    .from(habits)
    .where(eq(habits.isArchived, false))
    .orderBy(desc(habits.createdAt))
}

/**
 * Get habit by ID
 */
export async function getHabitById(id: string) {
  const result = await db
    .select()
    .from(habits)
    .where(eq(habits.id, id))
    .limit(1)
  
  return result[0] || null
}

/**
 * Get all archived habits (is_archived = true)
 * Ordered by updated_at DESC (recently archived first)
 */
export async function getArchivedHabits() {
  return await db
    .select()
    .from(habits)
    .where(eq(habits.isArchived, true))
    .orderBy(desc(habits.updatedAt))
}

/**
 * Get habits for today view with streak/goal info
 * Uses N+1 query prevention (2 queries total, not N+1)
 *
 * Performance: Batch query + JavaScript grouping (50x faster than N+1)
 */
export async function getHabitsForToday(date: string) {
  // 1. Get all active habits
  const allHabits = await db
    .select()
    .from(habits)
    .where(eq(habits.isArchived, false))
    .orderBy(desc(habits.createdAt))

  if (allHabits.length === 0) return []

  const habitIds = allHabits.map(h => h.id)

  // 2. Get all logs for all habits in ONE query (N+1 prevention)
  const allLogs = await db
    .select()
    .from(habitLogs)
    .where(
      and(
        inArray(habitLogs.habitId, habitIds),
        gte(habitLogs.date, sql`CURRENT_DATE - INTERVAL '30 days'`)
      )
    )
    .orderBy(desc(habitLogs.date))

  // 3. Group logs by habitId in JavaScript (fast)
  const logsByHabit = allLogs.reduce((acc, log) => {
    if (!acc[log.habitId]) acc[log.habitId] = []
    acc[log.habitId].push(log)
    return acc
  }, {} as Record<string, typeof allLogs>)

  // 4. Calculate streak/goal for each habit
  return allHabits.map(habit => {
    const logs = logsByHabit[habit.id] || []
    const todayLog = logs.find(log => log.date === date)
    const streakOrGoal = calculateStreak(logs, habit.targetFrequency)

    return {
      ...habit,
      isChecked: !!todayLog,
      completedAt: todayLog?.completedAt || null,
      ...streakOrGoal,
    }
  })
}
