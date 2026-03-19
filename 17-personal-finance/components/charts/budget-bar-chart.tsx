'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { EmptyState } from '@/components/shared/empty-state'
import { BarChart3 } from 'lucide-react'

interface BudgetBarChartProps {
  data: { category: string; budget: number; spent: number }[]
}

export function BudgetBarChart({ data }: BudgetBarChartProps) {
  const filteredData = data.filter((d) => d.budget > 0 || d.spent > 0)

  if (!filteredData || filteredData.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="데이터 없음"
        description="예산을 설정하면 비교 차트가 표시됩니다"
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={filteredData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`} />
        <Tooltip formatter={(value) => [`${Number(value).toLocaleString()}원`, '']} />
        <Legend />
        <Bar dataKey="budget" fill="#6366f1" name="예산" />
        <Bar dataKey="spent" fill="#ef4444" name="지출" />
      </BarChart>
    </ResponsiveContainer>
  )
}
