'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles } from 'lucide-react'
import type { Dream, Interpretation } from '@/lib/db/schema'

interface InterpretationViewProps {
  dreams: Dream[]
}

export function InterpretationView({ dreams }: InterpretationViewProps) {
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null)
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInterpret = async (dream: Dream) => {
    setSelectedDream(dream)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamId: dream.id }),
      })

      if (!response.ok) {
        throw new Error('AI 해석에 실패했습니다')
      }

      const data = await response.json()
      setInterpretation(data.interpretation)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  if (dreams.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            해석할 꿈이 없습니다. 먼저 꿈을 기록해주세요
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Dream List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">꿈 목록</h3>
        <div className="space-y-3">
          {dreams.map((dream) => (
            <Card
              key={dream.id}
              className={`cursor-pointer transition-all ${
                selectedDream?.id === dream.id
                  ? 'ring-2 ring-primary'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedDream(dream)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{dream.title}</h4>
                  <Badge
                    variant="outline"
                    className={
                      dream.emotion === 'positive'
                        ? 'bg-green-100 text-green-800'
                        : dream.emotion === 'neutral'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {dream.emotion === 'positive'
                      ? '긍정적'
                      : dream.emotion === 'neutral'
                      ? '중립'
                      : '부정적'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {dream.content}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(dream.date).toLocaleDateString('ko-KR')}
                  </span>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleInterpret(dream)
                    }}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI 해석
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Interpretation Result */}
      <div>
        <h3 className="text-lg font-semibold mb-4">AI 해석 결과</h3>
        {!selectedDream ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                왼쪽에서 꿈을 선택하고 AI 해석 버튼을 클릭하세요
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">AI가 꿈을 분석하고 있습니다...</p>
              <p className="text-xs text-muted-foreground mt-2">
                Claude Haiku 4.5 모델 사용 중
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => handleInterpret(selectedDream)}>
                다시 시도
              </Button>
            </CardContent>
          </Card>
        ) : interpretation ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">전체적인 해석</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{interpretation.interpretation}</p>
              </CardContent>
            </Card>

            {interpretation.psychological && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">심리학적 관점</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{interpretation.psychological}</p>
                </CardContent>
              </Card>
            )}

            {interpretation.symbolic && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">상징적 의미</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{interpretation.symbolic}</p>
                </CardContent>
              </Card>
            )}

            {interpretation.message && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">꿈이 전하는 메시지</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{interpretation.message}</p>
                </CardContent>
              </Card>
            )}

            <p className="text-xs text-muted-foreground text-center">
              분석 시간: {new Date(interpretation.analyzedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                AI 해석 버튼을 클릭하여 꿈을 분석하세요
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
