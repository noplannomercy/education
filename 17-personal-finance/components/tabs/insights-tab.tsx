'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  analyzeSpending,
  detectAnomalies,
  provideSavingsAdvice,
  getInsights,
} from '@/app/actions/insights'
import { getMonthlyStats } from '@/app/actions/transactions'
import { EmptyState } from '@/components/shared/empty-state'
import { InsightCard } from '@/components/insights/insight-card'
import { useMonth } from '@/hooks/use-month'
import {
  Sparkles,
  Loader2,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { AiInsight } from '@/lib/db/schema'

export function InsightsTab() {
  const { month, formattedMonth, goToPreviousMonth, goToNextMonth } = useMonth()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [insights, setInsights] = useState<AiInsight[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadInsights() {
      const data = await getInsights(month)
      setInsights(data)
    }
    loadInsights()
  }, [month])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      // 월간 통계 조회
      const stats = await getMonthlyStats(month)

      // 병렬 AI 분석 실행
      const results = await Promise.allSettled([
        analyzeSpending(month),
        detectAnomalies(month),
        provideSavingsAdvice({
          income: stats.income,
          expenses: stats.expense,
          savingsGoal: stats.income * 0.3, // 수입의 30% 목표
          timeframeMonths: 12,
          currentSavings: 0,
        }),
      ])

      // 실패한 분석 확인
      const failures = results.filter((r) => r.status === 'rejected')
      const successes = results.filter(
        (r) =>
          r.status === 'fulfilled' &&
          (r as PromiseFulfilledResult<{ success: boolean }>).value.success
      )

      if (failures.length > 0 || successes.length < results.length) {
        const failCount = results.length - successes.length
        toast.warning(`${failCount}개 분석이 실패했습니다`)
      }

      if (successes.length > 0) {
        toast.success('AI 분석이 완료되었습니다')
      }

      // 인사이트 다시 로드
      const newInsights = await getInsights(month)
      setInsights(newInsights)
    } catch (e) {
      console.error('Analysis error:', e)
      setError('분석 중 오류가 발생했습니다')
      toast.error('분석 중 오류가 발생했습니다')
    }

    setIsAnalyzing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">{formattedMonth} AI 인사이트</h2>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              AI 분석 실행
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">{error}</CardContent>
        </Card>
      )}

      {insights.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="인사이트가 없습니다"
          description="AI 분석을 실행하여 재무 인사이트를 받아보세요"
        />
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  )
}
