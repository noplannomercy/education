import type { HabitLog } from '@/lib/db/schema'
import { getYesterdayDate, getWeekStart } from './date'

/**
 * Streak info for daily habits (targetFrequency = 7)
 */
export interface StreakInfo {
  type: 'streak'
  currentStreak: number
  longestStreak: number
  lastCompletedDate: string | null
}

/**
 * Weekly goal info for non-daily habits (targetFrequency < 7)
 */
export interface WeeklyGoal {
  type: 'weekly'
  targetFrequency: number
  thisWeekCompleted: number
  achievementRate: number
}

/**
 * Calculate streak or weekly goal based on target frequency
 * 
 * POLICY:
 * - targetFrequency = 7 (매일): Strict streak calculation
 * - targetFrequency < 7 (주 N회): Weekly goal achievement only
 */
export function calculateStreak(
  logs: HabitLog[],
  targetFrequency: number
): StreakInfo | WeeklyGoal {
  // Non-daily habits: Return weekly goal achievement
  if (targetFrequency < 7) {
    return calculateWeeklyGoal(logs, targetFrequency)
  }

  // Daily habits: Calculate strict streak
  if (logs.length === 0) {
    return {
      type: 'streak',
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
    }
  }

  // Sort logs by date DESC (newest first)
  const sortedLogs = [...logs].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const yesterday = getYesterdayDate()
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Start from yesterday (today doesn't count yet)
  const yesterdayTime = new Date(yesterday + 'T00:00:00').getTime()
  let expectedDate = yesterdayTime

  for (const log of sortedLogs) {
    const logTime = new Date(log.date + 'T00:00:00').getTime()

    if (logTime === expectedDate) {
      tempStreak++
      if (logTime === yesterdayTime) {
        currentStreak = tempStreak
      }
      longestStreak = Math.max(longestStreak, tempStreak)
      expectedDate -= 24 * 60 * 60 * 1000 // Move back one day
    } else if (logTime < expectedDate) {
      // Gap detected - streak broken
      break
    }
    // If logTime > expectedDate, skip (shouldn't happen with DESC sort)
  }

  return {
    type: 'streak',
    currentStreak,
    longestStreak,
    lastCompletedDate: sortedLogs[0].date,
  }
}

/**
 * Calculate weekly goal achievement (for non-daily habits)
 */
function calculateWeeklyGoal(
  logs: HabitLog[],
  targetFrequency: number
): WeeklyGoal {
  const today = new Date()
  const weekStart = getWeekStart()

  // Filter logs for this week
  const thisWeekLogs = logs.filter(log => {
    const logDate = new Date(log.date + 'T00:00:00')
    return logDate >= weekStart && logDate <= today
  })

  const thisWeekCompleted = thisWeekLogs.length
  const achievementRate = Math.round(
    (thisWeekCompleted / targetFrequency) * 100
  )

  return {
    type: 'weekly',
    targetFrequency,
    thisWeekCompleted,
    achievementRate,
  }
}
