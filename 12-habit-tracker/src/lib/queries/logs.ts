import { db } from '@/lib/db'
import { habitLogs } from '@/lib/db/schema'
import { eq, and, gte, lte, desc, inArray, sql } from 'drizzle-orm'

/**
 * Get logs for a single habit (last 30 days for performance)
 */
export async function getHabitLogs(habitId: string, limit = 30) {
  return await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.habitId, habitId),
        gte(habitLogs.date, sql`CURRENT_DATE - INTERVAL '30 days'`)
      )
    )
    .orderBy(desc(habitLogs.date))
    .limit(limit)
}

/**
 * Get logs for multiple habits (N+1 prevention)
 * Used in Today view to fetch all logs in one query
 */
export async function getLogsForMultipleHabits(habitIds: string[]) {
  if (habitIds.length === 0) return []
  
  return await db
    .select()
    .from(habitLogs)
    .where(
      and(
        inArray(habitLogs.habitId, habitIds),
        gte(habitLogs.date, sql`CURRENT_DATE - INTERVAL '30 days'`)
      )
    )
    .orderBy(desc(habitLogs.date))
}

/**
 * Get today's log for a habit (check if already checked)
 */
export async function getTodayLog(habitId: string, date: string) {
  const result = await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.habitId, habitId),
        eq(habitLogs.date, date)
      )
    )
    .limit(1)
  
  return result[0] || null
}

/**
 * Get logs for a date range
 */
export async function getLogsForDateRange(
  habitId: string,
  startDate: string,
  endDate: string
) {
  return await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.habitId, habitId),
        gte(habitLogs.date, startDate),
        lte(habitLogs.date, endDate)
      )
    )
    .orderBy(desc(habitLogs.date))
}

/**
 * Get all logs for a habit (no date limit)
 * WARNING: Use sparingly, can be slow for habits with many logs
 */
export async function getAllHabitLogs(habitId: string) {
  return await db
    .select()
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
    .orderBy(desc(habitLogs.date))
}
