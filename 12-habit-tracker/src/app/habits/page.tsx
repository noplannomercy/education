import { getActiveHabits } from '@/lib/queries/habits'
import { HabitList } from '@/components/habits/HabitList'
import { HabitForm } from '@/components/habits/HabitForm'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function HabitsPage() {
  const habits = await getActiveHabits()

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">습관 관리</h1>
          <p className="text-muted-foreground mt-1">
            활성 습관 {habits.length}개
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/habits/archived">
            <Button variant="outline">보관함</Button>
          </Link>
          <HabitForm>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 습관
            </Button>
          </HabitForm>
        </div>
      </div>

      <HabitList habits={habits} />
    </div>
  )
}
