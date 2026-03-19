import { db } from '@/lib/db'
import { habits, habitLogs } from '@/lib/db/schema'
import { eq, and, gte, lte, sql, isNull } from 'drizzle-orm'

export interface HeatmapDayData {
  date: string
  completionRate: number
  habitsCompleted: number
  totalHabits: number
}

/**
 * Get monthly heatmap data
 * @param year - Year (e.g., 2026)
 * @param month - Month (1-12)
 * @param habitId - Optional: filter by specific habit
 * @returns Array of daily completion data
 */
export async function getMonthlyHeatmapData(
  year: number,
  month: number,
  habitId?: string
): Promise<HeatmapDayData[]> {
  // Get start and end dates for the month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  // Get active habits count (total habits for completion rate)
  const activeHabitsQuery = habitId
    ? db.select({ count: sql<number>`1` }).from(habits).where(eq(habits.id, habitId))
    : db.select({ count: sql<number>`count(*)` }).from(habits).where(eq(habits.isArchived, false))

  const activeHabitsResult = await activeHabitsQuery
  const totalHabits = habitId ? 1 : Number(activeHabitsResult[0]?.count || 0)

  if (totalHabits === 0) {
    return []
  }

  // Get logs for the month (grouped by date)
  const logsQuery = habitId
    ? db
        .select({
          date: habitLogs.date,
          count: sql<number>`count(distinct ${habitLogs.habitId})`,
        })
        .from(habitLogs)
        .where(
          and(
            eq(habitLogs.habitId, habitId),
            gte(habitLogs.date, startDate),
            lte(habitLogs.date, endDate)
          )
        )
        .groupBy(habitLogs.date)
    : db
        .select({
          date: habitLogs.date,
          count: sql<number>`count(distinct ${habitLogs.habitId})`,
        })
        .from(habitLogs)
        .innerJoin(habits, eq(habitLogs.habitId, habits.id))
        .where(
          and(
            eq(habits.isArchived, false),
            gte(habitLogs.date, startDate),
            lte(habitLogs.date, endDate)
          )
        )
        .groupBy(habitLogs.date)

  const logsResult = await logsQuery

  // Create a map of date -> completed count
  const logsByDate = logsResult.reduce((acc, log) => {
    acc[log.date] = Number(log.count)
    return acc
  }, {} as Record<string, number>)

  // Generate all days in the month
  const days: HeatmapDayData[] = []
  for (let day = 1; day <= lastDay; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const habitsCompleted = logsByDate[date] || 0
    const completionRate = totalHabits > 0 ? habitsCompleted / totalHabits : 0

    days.push({
      date,
      completionRate,
      habitsCompleted,
      totalHabits,
    })
  }

  return days
}

/**
 * Get overall statistics
 */
export async function getOverallStats() {
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(habits)

  const activeResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(habits)
    .where(eq(habits.isArchived, false))

  const archivedResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(habits)
    .where(eq(habits.isArchived, true))

  return {
    total: Number(totalResult[0]?.count || 0),
    active: Number(activeResult[0]?.count || 0),
    archived: Number(archivedResult[0]?.count || 0),
  }
}

/**
 * Get completion rate for a date range
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Completion rate (0-1)
 */
export async function getCompletionRate(startDate: string, endDate: string): Promise<number> {
  // Get active habits count
  const activeHabitsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(habits)
    .where(eq(habits.isArchived, false))

  const totalHabits = Number(activeHabitsResult[0]?.count || 0)

  if (totalHabits === 0) return 0

  // Count days in range
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // Get logs count in range
  const logsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(habitLogs)
    .innerJoin(habits, eq(habitLogs.habitId, habits.id))
    .where(
      and(
        eq(habits.isArchived, false),
        gte(habitLogs.date, startDate),
        lte(habitLogs.date, endDate)
      )
    )

  const logsCount = Number(logsResult[0]?.count || 0)
  const expectedLogs = totalHabits * dayCount

  return expectedLogs > 0 ? logsCount / expectedLogs : 0
}

/**
 * Get category-wise statistics
 * @param startDate - Start date
 * @param endDate - End date
 */
export async function getCategoryStats(startDate: string, endDate: string) {
  const result = await db
    .select({
      category: habits.category,
      habitCount: sql<number>`count(distinct ${habits.id})`,
      logsCount: sql<number>`count(${habitLogs.id})`,
    })
    .from(habits)
    .leftJoin(
      habitLogs,
      and(
        eq(habitLogs.habitId, habits.id),
        gte(habitLogs.date, startDate),
        lte(habitLogs.date, endDate)
      )
    )
    .where(eq(habits.isArchived, false))
    .groupBy(habits.category)

  // Calculate days in range
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  return result.map((row) => {
    const habitCount = Number(row.habitCount)
    const logsCount = Number(row.logsCount)
    const expectedLogs = habitCount * dayCount
    const completionRate = expectedLogs > 0 ? logsCount / expectedLogs : 0

    return {
      category: row.category,
      habitCount,
      logsCount,
      completionRate,
    }
  })
}

/**
 * Get weekly trend (last N weeks)
 * @param weeks - Number of weeks
 */
export async function getWeeklyTrend(weeks: number = 4) {
  const today = new Date()
  const trends = []

  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = new Date(today)
    weekEnd.setDate(today.getDate() - (i * 7))

    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekEnd.getDate() - 6)

    const startDate = weekStart.toLocaleDateString('en-CA')
    const endDate = weekEnd.toLocaleDateString('en-CA')

    const completionRate = await getCompletionRate(startDate, endDate)

    trends.push({
      week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
      completionRate,
    })
  }

  return trends
}

/**
 * Get weekly report (best and worst habits)
 */
export async function getWeeklyReport() {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 6)

  const startDate = weekStart.toLocaleDateString('en-CA')
  const endDate = today.toLocaleDateString('en-CA')

  // Get all active habits with their log counts
  const result = await db
    .select({
      habitId: habits.id,
      habitName: habits.name,
      targetFrequency: habits.targetFrequency,
      logsCount: sql<number>`count(${habitLogs.id})`,
    })
    .from(habits)
    .leftJoin(
      habitLogs,
      and(
        eq(habitLogs.habitId, habits.id),
        gte(habitLogs.date, startDate),
        lte(habitLogs.date, endDate)
      )
    )
    .where(eq(habits.isArchived, false))
    .groupBy(habits.id, habits.name, habits.targetFrequency)

  const habitsWithRates = result.map((row) => {
    const logsCount = Number(row.logsCount)
    const targetFrequency = row.targetFrequency
    const achievementRate = targetFrequency > 0 ? (logsCount / targetFrequency) * 100 : 0

    return {
      habitId: row.habitId,
      habitName: row.habitName,
      logsCount,
      targetFrequency,
      achievementRate,
    }
  })

  // Sort by achievement rate
  habitsWithRates.sort((a, b) => b.achievementRate - a.achievementRate)

  const best = habitsWithRates[0] || null
  const worst = habitsWithRates[habitsWithRates.length - 1] || null

  return { best, worst }
}
