'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { saveBudget, getBudget, getBudgetUsage } from '@/app/actions/budgets'
import { getCategories } from '@/app/actions/categories'
import { suggestBudget } from '@/app/actions/insights'
import { BudgetBarChart } from '@/components/charts'
import { Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMonth } from '@/hooks/use-month'
import type { Category } from '@/lib/db/schema'

export function BudgetTab() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSuggesting, setIsSuggesting] = useState(false)
  const { month, formattedMonth, goToPreviousMonth, goToNextMonth } = useMonth()

  const [categories, setCategories] = useState<Category[]>([])
  const [budgetData, setBudgetData] = useState({
    totalBudget: 0,
    categoryBudgets: {} as Record<string, number>,
  })
  const [usage, setUsage] = useState<{
    totalSpent: number
    totalPercentage: number
    categoryUsage: { category: string; budget: number; spent: number; percentage: number }[]
  } | null>(null)

  useEffect(() => {
    async function loadData() {
      const [cats, budget, usageData] = await Promise.all([
        getCategories(),
        getBudget(month),
        getBudgetUsage(month),
      ])

      setCategories(cats)
      setUsage(usageData)

      if (budget) {
        setBudgetData({
          totalBudget: Number(budget.totalBudget),
          categoryBudgets: budget.categoryBudgets || {},
        })
      } else {
        // 기본값 설정
        const defaultBudgets: Record<string, number> = {}
        cats.forEach((cat) => {
          defaultBudgets[cat.name] = 0
        })
        setBudgetData({
          totalBudget: 0,
          categoryBudgets: defaultBudgets,
        })
      }
    }

    loadData()
  }, [month])

  const handleAISuggest = async () => {
    const income = prompt('월 수입을 입력하세요 (원):')
    if (!income || isNaN(Number(income))) {
      toast.error('올바른 금액을 입력해주세요')
      return
    }

    setIsSuggesting(true)
    const result = await suggestBudget(Number(income), month)

    if (result.success && result.data) {
      setBudgetData({
        totalBudget: result.data.totalBudget,
        categoryBudgets: result.data.categoryBudgets,
      })
      toast.success('AI 예산 제안이 적용되었습니다')
    } else {
      toast.error(result.error || '예산 제안에 실패했습니다')
    }
    setIsSuggesting(false)
  }

  const handleSave = () => {
    // 카테고리 합계 검증
    const categoryTotal = Object.values(budgetData.categoryBudgets).reduce(
      (a, b) => a + b,
      0
    )
    if (categoryTotal > budgetData.totalBudget) {
      toast.error(
        `카테고리 예산 합계(${categoryTotal.toLocaleString()}원)가 총 예산(${budgetData.totalBudget.toLocaleString()}원)을 초과합니다`
      )
      return
    }

    startTransition(async () => {
      const result = await saveBudget({
        month,
        totalBudget: budgetData.totalBudget,
        categoryBudgets: budgetData.categoryBudgets,
      })

      if (result.success) {
        toast.success('예산이 저장되었습니다')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const chartData = usage?.categoryUsage.map((u) => ({
    category: u.category,
    budget: u.budget,
    spent: u.spent,
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">{formattedMonth} 예산</h2>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleAISuggest} disabled={isSuggesting}>
          {isSuggesting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          AI 예산 제안
        </Button>
      </div>

      {/* 총 예산 */}
      <Card>
        <CardHeader>
          <CardTitle>총 예산</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={budgetData.totalBudget || ''}
              onChange={(e) =>
                setBudgetData((prev) => ({
                  ...prev,
                  totalBudget: Number(e.target.value),
                }))
              }
              placeholder="총 예산"
              className="flex-1"
            />
            <span className="text-muted-foreground">원</span>
          </div>
          {usage && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>사용: {usage.totalSpent.toLocaleString()}원</span>
                <span>{usage.totalPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(usage.totalPercentage, 100)} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 카테고리별 예산 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 예산</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((cat) => {
            const catUsage = usage?.categoryUsage.find(
              (u) => u.category === cat.name
            )
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium">{cat.name}</span>
                  <Input
                    type="number"
                    value={budgetData.categoryBudgets[cat.name] || ''}
                    onChange={(e) =>
                      setBudgetData((prev) => ({
                        ...prev,
                        categoryBudgets: {
                          ...prev.categoryBudgets,
                          [cat.name]: Number(e.target.value),
                        },
                      }))
                    }
                    placeholder="0"
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">원</span>
                </div>
                {catUsage && catUsage.budget > 0 && (
                  <div className="ml-24 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{catUsage.spent.toLocaleString()}원 사용</span>
                      <span>{catUsage.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={Math.min(catUsage.percentage, 100)}
                      className="h-1"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* 차트 */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>예산 vs 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetBarChart data={chartData} />
          </CardContent>
        </Card>
      )}

      {/* 저장 버튼 */}
      <Button onClick={handleSave} disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            저장 중...
          </>
        ) : (
          '예산 저장'
        )}
      </Button>
    </div>
  )
}
