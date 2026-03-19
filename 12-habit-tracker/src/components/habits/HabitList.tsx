'use client'

import type { Habit } from '@/lib/db/schema'
import { HabitCard } from './HabitCard'

type HabitListProps = {
  habits: Habit[]
  showRestore?: boolean
}

export function HabitList({ habits, showRestore = false }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {showRestore ? '보관된 습관이 없습니다' : '등록된 습관이 없습니다'}
        </p>
        {!showRestore && (
          <p className="text-sm text-muted-foreground mt-1">
            새 습관 버튼을 클릭하여 시작하세요
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} showRestore={showRestore} />
      ))}
    </div>
  )
}
