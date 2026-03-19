'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Dream } from '@/lib/db/schema'

interface StatsViewProps {
  dreams: Dream[]
}

const EMOTION_COLORS = {
  positive: '#22c55e',
  neutral: '#94a3b8',
  negative: '#ef4444',
}

const EMOTION_LABELS = {
  positive: '긍정적',
  neutral: '중립',
  negative: '부정적',
}

export function StatsView({ dreams }: StatsViewProps) {
  if (dreams.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            통계를 보려면 먼저 꿈을 기록해주세요
          </p>
        </CardContent>
      </Card>
    )
  }

  // 1. Emotion Distribution (Pie Chart)
  const emotionData = Object.entries(
    dreams.reduce((acc, dream) => {
      acc[dream.emotion] = (acc[dream.emotion] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([emotion, count]) => ({
    name: EMOTION_LABELS[emotion as keyof typeof EMOTION_LABELS],
    value: count,
    color: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS],
  }))

  // 2. Monthly Dream Count (Bar Chart)
  const monthlyData = dreams.reduce((acc, dream) => {
    const date = new Date(dream.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    acc[monthKey] = (acc[monthKey] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const monthlyChartData = Object.entries(monthlyData)
    .sort()
    .slice(-6) // Last 6 months
    .map(([month, count]) => ({
      month: month.split('-')[1] + '월',
      count,
    }))

  // 3. Vividness Trend (Line Chart)
  const vividnessData = dreams
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10) // Last 10 dreams
    .map((dream) => ({
      date: new Date(dream.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      vividness: dream.vividness,
    }))

  // 4. Statistics summary
  const totalDreams = dreams.length
  const avgVividness = (dreams.reduce((sum, d) => sum + d.vividness, 0) / totalDreams).toFixed(1)
  const lucidCount = dreams.filter(d => d.lucid).length
  const lucidPercentage = ((lucidCount / totalDreams) * 100).toFixed(0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalDreams}</div>
            <p className="text-xs text-muted-foreground">총 꿈 기록</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{avgVividness}</div>
            <p className="text-xs text-muted-foreground">평균 생생함</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{lucidCount}</div>
            <p className="text-xs text-muted-foreground">자각몽 횟수</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{lucidPercentage}%</div>
            <p className="text-xs text-muted-foreground">자각몽 비율</p>
          </CardContent>
        </Card>
      </div>

      {/* Emotion Distribution - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>감정 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emotionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {emotionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Dream Count - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>월별 꿈 기록 (최근 6개월)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" name="꿈 기록 수" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vividness Trend - Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>생생함 추이 (최근 10개)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vividnessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="vividness"
                stroke="#3b82f6"
                strokeWidth={2}
                name="생생함"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
