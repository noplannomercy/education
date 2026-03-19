'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  AlertTriangle,
  PiggyBank,
  Target,
} from 'lucide-react'
import type { AiInsight } from '@/lib/db/schema'

interface InsightCardProps {
  insight: AiInsight
}

const typeConfig = {
  spending_pattern: {
    icon: TrendingUp,
    label: '지출 분석',
    color: 'bg-blue-100 text-blue-800',
  },
  budget_suggestion: {
    icon: Target,
    label: '예산 제안',
    color: 'bg-green-100 text-green-800',
  },
  anomaly_detection: {
    icon: AlertTriangle,
    label: '이상 거래',
    color: 'bg-yellow-100 text-yellow-800',
  },
  savings_advice: {
    icon: PiggyBank,
    label: '저축 조언',
    color: 'bg-purple-100 text-purple-800',
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContentType = any

export function InsightCard({ insight }: InsightCardProps) {
  const config = typeConfig[insight.type] || typeConfig.spending_pattern
  const Icon = config.icon

  let content: ContentType = null
  try {
    content = JSON.parse(insight.content)
  } catch {
    content = null
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-lg">{insight.title}</CardTitle>
          </div>
          <Badge className={config.color}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {content ? (
          <InsightContent type={insight.type} content={content} />
        ) : (
          <p className="text-muted-foreground">내용을 표시할 수 없습니다</p>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          {new Date(insight.createdAt).toLocaleString('ko-KR')}
        </p>
      </CardContent>
    </Card>
  )
}

function InsightContent({
  type,
  content,
}: {
  type: string
  content: ContentType
}) {
  switch (type) {
    case 'spending_pattern':
      return <SpendingPatternContent content={content} />
    case 'anomaly_detection':
      return <AnomalyContent content={content} />
    case 'savings_advice':
      return <SavingsAdviceContent content={content} />
    case 'budget_suggestion':
      return <BudgetSuggestionContent content={content} />
    default:
      return <pre className="text-sm">{JSON.stringify(content, null, 2)}</pre>
  }
}

function SpendingPatternContent({ content }: { content: ContentType }) {
  const topSpending = content.topSpending as { category: string; amount: number; percentage: number }[] | undefined
  const savingOpportunities = content.savingOpportunities as string[] | undefined

  return (
    <div className="space-y-4">
      <p>{content.summary}</p>

      {topSpending && topSpending.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">주요 지출 카테고리</h4>
          <ul className="space-y-1">
            {topSpending.map((item, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span>{item.category}</span>
                <span>
                  {item.amount.toLocaleString()}원 ({item.percentage.toFixed(1)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {savingOpportunities && savingOpportunities.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">절약 기회</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            {savingOpportunities.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function AnomalyContent({ content }: { content: ContentType }) {
  const anomalies = content.anomalies as {
    description: string
    amount: number
    date: string
    reason: string
    severity: string
  }[] | undefined

  return (
    <div className="space-y-4">
      <p>{content.summary}</p>

      {anomalies && anomalies.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">감지된 이상 거래</h4>
          <ul className="space-y-2">
            {anomalies.map((item, idx) => (
              <li
                key={idx}
                className={`p-2 rounded text-sm ${
                  item.severity === 'high'
                    ? 'bg-red-50'
                    : item.severity === 'medium'
                      ? 'bg-yellow-50'
                      : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{item.description}</span>
                  <span>{item.amount.toLocaleString()}원</span>
                </div>
                <p className="text-muted-foreground mt-1">{item.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.recommendation && (
        <div className="p-3 bg-blue-50 rounded">
          <h4 className="font-medium mb-1">권고 사항</h4>
          <p className="text-sm">{content.recommendation}</p>
        </div>
      )}
    </div>
  )
}

function SavingsAdviceContent({ content }: { content: ContentType }) {
  const strategies = content.strategies as {
    action: string
    potentialSavings: number
    difficulty: string
  }[] | undefined

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-muted-foreground">필요 월 저축액</p>
          <p className="text-lg font-semibold">
            {Number(content.requiredMonthlySavings || 0).toLocaleString()}원
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-muted-foreground">실현 가능성</p>
          <p className="text-lg font-semibold">{content.feasibility}</p>
        </div>
      </div>

      {strategies && strategies.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">저축 전략</h4>
          <ul className="space-y-2">
            {strategies.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm">
                <span>{item.action}</span>
                <Badge variant="outline">
                  {item.potentialSavings.toLocaleString()}원 절약 가능
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.motivation && (
        <div className="p-3 bg-green-50 rounded">
          <p className="text-sm font-medium">{content.motivation}</p>
        </div>
      )}
    </div>
  )
}

function BudgetSuggestionContent({ content }: { content: ContentType }) {
  const categoryBudgets = content.categoryBudgets as Record<string, number> | undefined
  const insights = content.insights as string[] | undefined

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-muted-foreground">총 예산</p>
          <p className="text-lg font-semibold">
            {Number(content.totalBudget || 0).toLocaleString()}원
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-muted-foreground">저축 목표</p>
          <p className="text-lg font-semibold">
            {Number(content.savingsTarget || 0).toLocaleString()}원
          </p>
        </div>
      </div>

      {categoryBudgets && Object.keys(categoryBudgets).length > 0 && (
        <div>
          <h4 className="font-medium mb-2">카테고리별 예산</h4>
          <ul className="space-y-1">
            {Object.entries(categoryBudgets).map(([cat, amount]) => (
              <li key={cat} className="flex justify-between text-sm">
                <span>{cat}</span>
                <span>{amount.toLocaleString()}원</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {insights && insights.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">인사이트</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            {insights.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
