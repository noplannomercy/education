import { format } from 'date-fns'
import { getMonthlyStats } from '@/app/actions/transactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { CategoryPieChart, MonthlyTrendChart } from '@/components/charts'
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  LayoutDashboard,
} from 'lucide-react'

export async function DashboardTab() {
  const currentMonth = format(new Date(), 'yyyy-MM')
  const stats = await getMonthlyStats(currentMonth)

  const hasData = stats.income > 0 || stats.expense > 0

  if (!hasData) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="데이터가 없습니다"
        description="거래를 추가하면 대시보드에 통계가 표시됩니다."
      />
    )
  }

  const categoryData = Object.entries(stats.byCategory).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {currentMonth.replace('-', '년 ')}월 요약
      </h2>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">수입</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.income.toLocaleString()}원
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">지출</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.expense.toLocaleString()}원
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">저축</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${stats.savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}
            >
              {stats.savings.toLocaleString()}원
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">저축률</CardTitle>
            <Percent className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.savingsRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categoryData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>월별 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart currentMonth={currentMonth} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
