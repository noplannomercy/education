'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { EmptyState } from '@/components/shared/empty-state'
import { TrendingUp } from 'lucide-react'
import { getMonthlyStats } from '@/app/actions/transactions'

interface MonthlyTrendChartProps {
  currentMonth: string
}

interface TrendData {
  month: string
  income: number
  expense: number
}

export function MonthlyTrendChart({ currentMonth }: MonthlyTrendChartProps) {
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const months: string[] = []
      const [year, month] = currentMonth.split('-').map(Number)

      // 최근 6개월
      for (let i = 5; i >= 0; i--) {
        let m = month - i
        let y = year
        while (m <= 0) {
          m += 12
          y -= 1
        }
        months.push(`${y}-${String(m).padStart(2, '0')}`)
      }

      const results = await Promise.all(months.map((m) => getMonthlyStats(m)))

      const trendData = months.map((m, idx) => ({
        month: m.slice(5) + '월',
        income: results[idx].income,
        expense: results[idx].expense,
      }))

      setData(trendData)
      setLoading(false)
    }

    fetchData()
  }, [currentMonth])

  if (loading) {
    return <div className="h-[300px] animate-pulse bg-muted rounded" />
  }

  const hasData = data.some((d) => d.income > 0 || d.expense > 0)

  if (!hasData) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="데이터 없음"
        description="거래 내역이 없습니다"
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`} />
        <Tooltip formatter={(value) => [`${Number(value).toLocaleString()}원`, '']} />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#10b981"
          name="수입"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          name="지출"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
