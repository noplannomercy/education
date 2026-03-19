'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, Lightbulb } from 'lucide-react'
import type { Dream } from '@/lib/db/schema'

interface PatternsViewProps {
  dreams: Dream[]
}

interface Pattern {
  type: 'theme' | 'person' | 'place' | 'emotion'
  name: string
  description: string
  occurrences: number
  significance: string
}

interface WeeklyInsight {
  summary: string
  mainThemes: string[]
  emotionalFlow: string
  subconscious: string
  nextWeek: string
}

const PATTERN_TYPE_LABELS = {
  theme: '주제',
  person: '인물',
  place: '장소',
  emotion: '감정',
}

const PATTERN_TYPE_COLORS = {
  theme: 'bg-purple-100 text-purple-800',
  person: 'bg-blue-100 text-blue-800',
  place: 'bg-green-100 text-green-800',
  emotion: 'bg-orange-100 text-orange-800',
}

export function PatternsView({ dreams }: PatternsViewProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [insight, setInsight] = useState<WeeklyInsight | null>(null)
  const [isLoadingPatterns, setIsLoadingPatterns] = useState(false)
  const [isLoadingInsight, setIsLoadingInsight] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyzePatterns = async () => {
    setIsLoadingPatterns(true)
    setError(null)

    try {
      const response = await fetch('/api/patterns', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('패턴 분석에 실패했습니다')
      }

      const data = await response.json()
      setPatterns(data.patterns || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsLoadingPatterns(false)
    }
  }

  const handleGenerateInsight = async () => {
    setIsLoadingInsight(true)
    setError(null)

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('주간 인사이트 생성에 실패했습니다')
      }

      const data = await response.json()
      setInsight(data.insight)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsLoadingInsight(false)
    }
  }

  if (dreams.length < 3) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            패턴 분석을 위해서는 최소 3개 이상의 꿈 기록이 필요합니다
          </p>
          <p className="text-sm text-muted-foreground">
            현재: {dreams.length}개
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pattern Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>반복 패턴 분석</CardTitle>
            <Button
              onClick={handleAnalyzePatterns}
              disabled={isLoadingPatterns}
            >
              {isLoadingPatterns ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  패턴 분석하기
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            최근 20개의 꿈에서 반복되는 패턴을 AI가 찾아드립니다
          </p>

          {isLoadingPatterns ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                Claude Haiku 4.5가 패턴을 분석하고 있습니다...
              </p>
            </div>
          ) : patterns.length > 0 ? (
            <div className="space-y-4">
              {patterns.map((pattern, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold mb-1">{pattern.name}</h4>
                        <Badge
                          className={PATTERN_TYPE_COLORS[pattern.type]}
                        >
                          {PATTERN_TYPE_LABELS[pattern.type]}
                        </Badge>
                      </div>
                      <Badge variant="secondary">
                        {pattern.occurrences}회
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {pattern.description}
                    </p>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">의미:</p>
                      <p className="text-sm text-muted-foreground">
                        {pattern.significance}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              패턴 분석하기 버튼을 클릭하여 꿈의 패턴을 찾아보세요
            </p>
          )}
        </CardContent>
      </Card>

      {/* Weekly Insight */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>주간 인사이트</CardTitle>
            <Button
              onClick={handleGenerateInsight}
              disabled={isLoadingInsight}
            >
              {isLoadingInsight ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  인사이트 생성
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            최근 7일간의 꿈을 종합적으로 분석합니다
          </p>

          {isLoadingInsight ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                Claude Haiku 4.5가 주간 인사이트를 생성하고 있습니다...
              </p>
            </div>
          ) : insight ? (
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">📝 한 주 요약</h4>
                <p className="text-sm leading-relaxed">{insight.summary}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold mb-2">🎯 주요 테마</h4>
                <ul className="list-disc list-inside space-y-1">
                  {insight.mainThemes.map((theme, idx) => (
                    <li key={idx} className="text-sm">{theme}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">💭 감정 흐름</h4>
                <p className="text-sm leading-relaxed">{insight.emotionalFlow}</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold mb-2">🧠 잠재의식의 메시지</h4>
                <p className="text-sm leading-relaxed">{insight.subconscious}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2">👀 다음 주 관찰 포인트</h4>
                <p className="text-sm leading-relaxed">{insight.nextWeek}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              인사이트 생성 버튼을 클릭하여 이번 주 꿈을 종합 분석하세요
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
