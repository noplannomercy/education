'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Dream } from '@/lib/db/schema'

interface CalendarViewProps {
  dreams: Dream[]
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
]

const emotionColors = {
  positive: 'bg-green-500',
  neutral: 'bg-gray-400',
  negative: 'bg-red-500',
}

export function CalendarView({ dreams }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Create dream map by date
  const dreamsByDate = new Map<string, Dream[]>()
  dreams.forEach((dream) => {
    const dateKey = new Date(dream.date).toISOString().split('T')[0]
    if (!dreamsByDate.has(dateKey)) {
      dreamsByDate.set(dateKey, [])
    }
    dreamsByDate.get(dateKey)!.push(dream)
  })

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1))
    setSelectedDate(null)
  }

  // Get dreams for a specific date
  const getDreamsForDate = (day: number) => {
    const dateKey = new Date(year, month, day).toISOString().split('T')[0]
    return dreamsByDate.get(dateKey) || []
  }

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day)
    setSelectedDate(date)
  }

  const selectedDreams = selectedDate
    ? getDreamsForDate(selectedDate.getDate())
    : []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>꿈 캘린더</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[120px] text-center font-semibold">
                {year}년 {MONTHS[month]}
              </span>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>긍정적</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span>중립</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>부정적</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}

            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dreamsForDay = getDreamsForDate(day)
              const date = new Date(year, month, day)
              const isToday =
                date.toISOString().split('T')[0] ===
                new Date().toISOString().split('T')[0]
              const isSelected =
                selectedDate &&
                date.toISOString().split('T')[0] ===
                  selectedDate.toISOString().split('T')[0]

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    aspect-square rounded-lg border p-1 text-sm
                    hover:bg-accent transition-colors
                    ${isToday ? 'border-primary border-2' : 'border-border'}
                    ${isSelected ? 'bg-accent' : 'bg-card'}
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={isToday ? 'font-bold' : ''}>{day}</span>
                    {dreamsForDay.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dreamsForDay.slice(0, 3).map((dream, idx) => (
                          <div
                            key={dream.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              emotionColors[dream.emotion]
                            }`}
                          />
                        ))}
                        {dreamsForDay.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{dreamsForDay.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected date dreams */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              의 꿈 ({selectedDreams.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDreams.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                이 날짜에 기록된 꿈이 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDreams.map((dream) => (
                  <div
                    key={dream.id}
                    className="border rounded-lg p-3 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{dream.title}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          dream.emotion === 'positive'
                            ? 'bg-green-100 text-green-800'
                            : dream.emotion === 'neutral'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {dream.emotion === 'positive'
                          ? '긍정적'
                          : dream.emotion === 'neutral'
                          ? '중립'
                          : '부정적'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dream.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>생생함: {dream.vividness}/5</span>
                      {dream.lucid && (
                        <span className="px-2 py-0.5 bg-secondary rounded-full">
                          자각몽
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
