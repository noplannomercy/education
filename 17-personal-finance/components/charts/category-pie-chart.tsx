'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { EmptyState } from '@/components/shared/empty-state'
import { PieChart as PieChartIcon } from 'lucide-react'

interface CategoryPieChartProps {
  data: { name: string; value: number }[]
}

const COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
]

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  // 빈 데이터 또는 모든 값이 0인 경우
  const filteredData = data.filter((d) => d.value > 0)

  if (!filteredData || filteredData.length === 0) {
    return (
      <EmptyState icon={PieChartIcon} title="데이터 없음" description="지출 내역이 없습니다" />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {filteredData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${Number(value).toLocaleString()}원`, '금액']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
