'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

type CategoryData = {
  category: string
  habitCount: number
  logsCount: number
  completionRate: number
}

type CategoryChartProps = {
  data: CategoryData[]
}

const CATEGORY_COLORS: Record<string, string> = {
  health: '#10b981', // green-500
  learning: '#3b82f6', // blue-500
  exercise: '#f59e0b', // amber-500
  other: '#6b7280', // gray-500
}

const CATEGORY_NAMES: Record<string, string> = {
  health: '건강',
  learning: '학습',
  exercise: '운동',
  other: '기타',
}

export function CategoryChart({ data }: CategoryChartProps) {
  // Transform data for pie chart
  const chartData = data.map((item) => ({
    name: CATEGORY_NAMES[item.category] || item.category,
    value: item.habitCount,
    completionRate: Math.round(item.completionRate * 100),
    color: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other,
  }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">데이터가 없습니다</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>카테고리별 분포</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined, name: string | undefined, props: any) => [
                `${value || 0}개 (완료율 ${props.payload.completionRate}%)`,
                name || '',
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
