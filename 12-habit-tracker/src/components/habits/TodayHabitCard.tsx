'use client'

import type { Habit } from '@/lib/db/schema'
import type { StreakInfo, WeeklyGoal } from '@/lib/utils/streak'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckButton } from './CheckButton'
import { StreakBadge } from './StreakBadge'
import { categoryLabels, frequencyLabels } from '@/lib/types'

type TodayHabitCardProps = {
  habit: Habit & {
    isChecked: boolean
    completedAt: Date | null
  } & (StreakInfo | WeeklyGoal)
  date: string
}

export function TodayHabitCard({ habit, date }: TodayHabitCardProps) {
  const streakOrGoal: StreakInfo | WeeklyGoal = habit.type === 'streak'
    ? { type: 'streak', currentStreak: habit.currentStreak, longestStreak: habit.longestStreak, lastCompletedDate: habit.lastCompletedDate }
    : { type: 'weekly', targetFrequency: habit.targetFrequency, thisWeekCompleted: habit.thisWeekCompleted, achievementRate: habit.achievementRate }

  return (
    <Card className="relative">
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
        style={{ backgroundColor: habit.color }}
      />
      <CardContent className="pl-6 py-4">
        <div className="flex items-center gap-4">
          <CheckButton
            habitId={habit.id}
            habitName={habit.name}
            isChecked={habit.isChecked}
            date={date}
          />

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold ${habit.isChecked ? 'line-through text-muted-foreground' : ''}`}>
                {habit.name}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="text-xs">
                {categoryLabels[habit.category]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {frequencyLabels[habit.targetFrequency]}
              </Badge>
            </div>
          </div>

          <StreakBadge data={streakOrGoal} />
        </div>

        {habit.description && (
          <p className="text-sm text-muted-foreground mt-2 ml-10">
            {habit.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
