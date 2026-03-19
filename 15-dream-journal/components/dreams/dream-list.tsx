'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Moon, Calendar } from 'lucide-react'
import type { Dream } from '@/lib/db/schema'

interface DreamListProps {
  dreams: Dream[]
}

const emotionColors = {
  positive: 'bg-green-100 text-green-800 border-green-300',
  neutral: 'bg-gray-100 text-gray-800 border-gray-300',
  negative: 'bg-red-100 text-red-800 border-red-300',
}

const emotionLabels = {
  positive: '긍정적',
  neutral: '중립',
  negative: '부정적',
}

export function DreamList({ dreams }: DreamListProps) {
  if (dreams.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Moon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">아직 기록된 꿈이 없습니다</p>
          <p className="text-sm text-muted-foreground mt-2">
            오늘 탭에서 첫 꿈을 기록해보세요
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">최근 꿈 기록</h3>
      {dreams.map((dream) => (
        <Card key={dream.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{dream.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(dream.date).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={emotionColors[dream.emotion]}
              >
                {emotionLabels[dream.emotion]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {dream.content}
            </p>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span>생생함: {dream.vividness}/5</span>
              {dream.lucid && (
                <Badge variant="secondary" className="text-xs">
                  자각몽
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
