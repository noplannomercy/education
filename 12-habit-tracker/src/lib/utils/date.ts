/**
 * Get today's date in YYYY-MM-DD format (client-side timezone)
 * CRITICAL: Always call this from client-side to use user's timezone
 */
export function getTodayDate(): string {
  return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayDate(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toLocaleDateString('en-CA')
}

/**
 * Validate check date
 * - Must not be in the future
 * - Must be within last 7 days
 */
export function validateCheckDate(dateStr: string): { valid: boolean; error?: string } {
  const checkDate = new Date(dateStr + 'T00:00:00') // Force local timezone
  const today = new Date(getTodayDate() + 'T00:00:00')

  // Reject future dates
  if (checkDate > today) {
    return { valid: false, error: '미래 날짜는 체크할 수 없습니다' }
  }

  // Reject past > 7 days
  const maxPastDays = 7
  const pastLimit = new Date(today)
  pastLimit.setDate(pastLimit.getDate() - maxPastDays)

  if (checkDate < pastLimit) {
    return { valid: false, error: '최근 7일 이내만 체크 가능합니다' }
  }

  return { valid: true }
}

/**
 * Get start of current week (Sunday)
 */
export function getWeekStart(): Date {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay()) // Sunday
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

/**
 * Format date string for display
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

/**
 * Get all days in a given month
 * @param year - Year (e.g., 2026)
 * @param month - Month (1-12)
 * @returns Array of date strings in YYYY-MM-DD format
 */
export function getDaysInMonth(year: number, month: number): string[] {
  const lastDay = new Date(year, month, 0).getDate()
  const days: string[] = []

  for (let day = 1; day <= lastDay; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    days.push(dateStr)
  }

  return days
}

/**
 * Get Korean month name
 * @param month - Month (1-12)
 * @returns Korean month name (e.g., "1월")
 */
export function getMonthName(month: number): string {
  return `${month}월`
}

/**
 * Get current year and month
 * @returns { year: number, month: number }
 */
export function getCurrentYearMonth(): { year: number; month: number } {
  const today = new Date()
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1, // JavaScript months are 0-indexed
  }
}

/**
 * Get day of week label (Korean)
 * @param date - Date string (YYYY-MM-DD)
 * @returns Day of week (일, 월, 화, 수, 목, 금, 토)
 */
export function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return days[date.getDay()]
}

/**
 * Get first day of week for a month (0 = Sunday, 6 = Saturday)
 * Used for calendar grid rendering
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  const date = new Date(year, month - 1, 1)
  return date.getDay()
}
