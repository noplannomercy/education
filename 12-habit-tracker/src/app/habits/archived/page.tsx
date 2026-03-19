import { getArchivedHabits } from '@/lib/queries/habits'
import { HabitList } from '@/components/habits/HabitList'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ArchivedHabitsPage() {
  const habits = await getArchivedHabits()

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">보관된 습관</h1>
          <p className="text-muted-foreground mt-1">
            보관된 습관 {habits.length}개
          </p>
        </div>
        <Link href="/habits">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
        </Link>
      </div>

      <HabitList habits={habits} showRestore />
    </div>
  )
}
