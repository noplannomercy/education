'use client'

import type { Habit } from '@/lib/db/schema'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'

type HabitFilterProps = {
  habits: Habit[]
  selectedHabitId?: string
}

export function HabitFilter({ habits, selectedHabitId }: HabitFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all') {
      params.delete('habitId')
    } else {
      params.set('habitId', value)
    }

    router.push(`/calendar?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="habit-filter" className="text-sm font-medium whitespace-nowrap">
        습관 선택:
      </label>
      <Select value={selectedHabitId || 'all'} onValueChange={handleChange}>
        <SelectTrigger id="habit-filter" className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 습관</SelectItem>
          {habits.map((habit) => (
            <SelectItem key={habit.id} value={habit.id}>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                {habit.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
