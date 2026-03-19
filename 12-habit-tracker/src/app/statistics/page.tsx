import { StatsCard } from '@/components/statistics/StatsCard'
import { CategoryChart } from '@/components/statistics/CategoryChart'
import { TrendChart } from '@/components/statistics/TrendChart'
import { WeeklyReport } from '@/components/statistics/WeeklyReport'
import {
  getOverallStats,
  getCompletionRate,
  getCategoryStats,
  getWeeklyTrend,
  getWeeklyReport,
} from '@/lib/queries/statistics'
import { BarChart3, Target, TrendingUp, Archive } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StatisticsPage() {
  // Calculate date ranges
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 6)
  const monthStart = new Date(today)
  monthStart.setDate(1)

  const weekStartDate = weekStart.toLocaleDateString('en-CA')
  const monthStartDate = monthStart.toLocaleDateString('en-CA')
  const todayDate = today.toLocaleDateString('en-CA')

  // Fetch all data
  const overallStats = await getOverallStats()
  const weekCompletionRate = await getCompletionRate(weekStartDate, todayDate)
  const monthCompletionRate = await getCompletionRate(monthStartDate, todayDate)
  const categoryStats = await getCategoryStats(monthStartDate, todayDate)
  const weeklyTrend = await getWeeklyTrend(4)
  const weeklyReport = await getWeeklyReport()

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">통계</h1>
        <p className="text-muted-foreground">습관 달성 현황 및 분석</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="전체 습관"
          value={overallStats.total}
          icon={BarChart3}
          description="등록된 전체 습관"
        />
        <StatsCard
          title="활성 습관"
          value={overallStats.active}
          icon={Target}
          description="현재 진행 중"
        />
        <StatsCard
          title="주간 완료율"
          value={`${Math.round(weekCompletionRate * 100)}%`}
          icon={TrendingUp}
          description="최근 7일"
        />
        <StatsCard
          title="월간 완료율"
          value={`${Math.round(monthCompletionRate * 100)}%`}
          icon={TrendingUp}
          description="이번 달"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CategoryChart data={categoryStats} />
        <TrendChart data={weeklyTrend} />
      </div>

      {/* Weekly Report */}
      <WeeklyReport best={weeklyReport.best} worst={weeklyReport.worst} />
    </div>
  )
}
