import { getHabitsForToday } from '@/lib/queries/habits'
import { getTodayDate, formatDate } from '@/lib/utils/date'
import { TodayHabitCard } from '@/components/habits/TodayHabitCard'
import { Progress } from '@/components/ui/progress'
import { HabitForm } from '@/components/habits/HabitForm'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TodayPage() {
  // Server renders with current date
  const today = getTodayDate()
  const habits = await getHabitsForToday(today)

  const totalHabits = habits.length
  const checkedHabits = habits.filter(h => h.isChecked).length
  const completionRate = totalHabits > 0
    ? Math.round((checkedHabits / totalHabits) * 100)
    : 0

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">오늘의 습관</h1>
        <p className="text-muted-foreground">{formatDate(today)}</p>
      </div>

      {/* Progress Section */}
      <div className="bg-card rounded-lg p-6 mb-8 border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">오늘의 진행률</span>
          <span className="text-2xl font-bold">
            {checkedHabits}/{totalHabits}
          </span>
        </div>
        <Progress value={completionRate} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {completionRate}% 완료
        </p>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            등록된 습관이 없습니다
          </p>
          <div className="flex gap-2 justify-center">
            <HabitForm>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                새 습관 만들기
              </Button>
            </HabitForm>
            <Link href="/habits">
              <Button variant="outline">습관 관리</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <TodayHabitCard key={habit.id} habit={habit} date={today} />
          ))}
        </div>
      )}
    </div>
  )
}
