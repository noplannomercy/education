import { getActiveHabits } from '@/lib/queries/habits'
import { getMonthlyHeatmapData } from '@/lib/queries/statistics'
import { getCurrentYearMonth } from '@/lib/utils/date'
import { Heatmap } from '@/components/calendar/Heatmap'
import { MonthSelector } from '@/components/calendar/MonthSelector'
import { HabitFilter } from '@/components/calendar/HabitFilter'

export const dynamic = 'force-dynamic'

type SearchParams = {
  year?: string
  month?: string
  habitId?: string
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // Get year/month from query params or use current
  const current = getCurrentYearMonth()
  const year = searchParams.year ? parseInt(searchParams.year) : current.year
  const month = searchParams.month ? parseInt(searchParams.month) : current.month
  const habitId = searchParams.habitId

  // Fetch data
  const habits = await getActiveHabits()
  const heatmapData = await getMonthlyHeatmapData(year, month, habitId)

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">캘린더</h1>
        <p className="text-muted-foreground">
          습관 완료 히트맵
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <MonthSelector year={year} month={month} />
        <HabitFilter habits={habits} selectedHabitId={habitId} />
      </div>

      {/* Heatmap */}
      {habits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            등록된 습관이 없습니다
          </p>
        </div>
      ) : (
        <Heatmap year={year} month={month} data={heatmapData} />
      )}
    </div>
  )
}
