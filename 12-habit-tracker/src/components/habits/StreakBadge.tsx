'use client'

import type { StreakInfo, WeeklyGoal } from '@/lib/utils/streak'
import { Badge } from '@/components/ui/badge'
import { Flame, Target, AlertTriangle } from 'lucide-react'

type StreakBadgeProps = {
  data: StreakInfo | WeeklyGoal
}

export function StreakBadge({ data }: StreakBadgeProps) {
  if (data.type === 'streak') {
    // Daily habit: Show streak
    const { currentStreak, longestStreak } = data
    const isActive = currentStreak > 0
    
    return (
      <div className="flex items-center gap-2">
        <Badge variant={isActive ? 'default' : 'secondary'} className="flex items-center gap-1">
          {isActive ? (
            <>
              <Flame className="h-3 w-3" />
              <span>{currentStreak}일 연속</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-3 w-3" />
              <span>연속 끊김</span>
            </>
          )}
        </Badge>
        {longestStreak > 0 && (
          <span className="text-xs text-muted-foreground" title="최장 기록">
            최장: {longestStreak}일
          </span>
        )}
      </div>
    )
  } else {
    // Weekly habit: Show goal achievement
    const { targetFrequency, thisWeekCompleted, achievementRate } = data
    const isGood = achievementRate >= 80
    const isFair = achievementRate >= 50
    
    return (
      <Badge 
        variant={isGood ? 'default' : isFair ? 'secondary' : 'outline'}
        className="flex items-center gap-1"
      >
        <Target className="h-3 w-3" />
        <span>
          이번 주 {thisWeekCompleted}/{targetFrequency} ({achievementRate}%)
        </span>
      </Badge>
    )
  }
}
