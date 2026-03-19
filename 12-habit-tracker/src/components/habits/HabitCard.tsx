'use client'

import { useState } from 'react'
import { archiveHabit, restoreHabit, deleteHabit } from '@/lib/actions/habits'
import { categoryLabels, frequencyLabels } from '@/lib/types'
import type { Habit } from '@/lib/db/schema'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HabitForm } from './HabitForm'
import { Archive, Edit, Trash2, ArchiveRestore } from 'lucide-react'
import { toast } from 'sonner'

type HabitCardProps = {
  habit: Habit
  showRestore?: boolean
}

export function HabitCard({ habit, showRestore = false }: HabitCardProps) {
  const [loading, setLoading] = useState(false)

  const handleArchive = async () => {
    setLoading(true)
    const result = await archiveHabit(habit.id)
    if (result.success) {
      toast.success('습관이 보관되었습니다')
    } else {
      toast.error(result.error || '오류가 발생했습니다')
    }
    setLoading(false)
  }

  const handleRestore = async () => {
    setLoading(true)
    const result = await restoreHabit(habit.id)
    if (result.success) {
      toast.success('습관이 복원되었습니다')
    } else {
      toast.error(result.error || '오류가 발생했습니다')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 습관을 삭제하시겠습니까? 모든 기록이 함께 삭제됩니다.')) {
      return
    }

    setLoading(true)
    const result = await deleteHabit(habit.id)
    if (result.success) {
      toast.success('습관이 삭제되었습니다')
    } else {
      toast.error(result.error || '오류가 발생했습니다')
    }
    setLoading(false)
  }

  return (
    <Card className="relative">
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
        style={{ backgroundColor: habit.color }}
      />
      <CardHeader className="pl-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{habit.name}</CardTitle>
            {habit.description && (
              <CardDescription className="mt-1">{habit.description}</CardDescription>
            )}
          </div>
          <div className="flex gap-1">
            {!showRestore ? (
              <>
                <HabitForm habit={habit}>
                  <Button variant="ghost" size="icon" disabled={loading}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </HabitForm>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleArchive}
                  disabled={loading}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRestore}
                disabled={loading}
              >
                <ArchiveRestore className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-6">
        <div className="flex gap-2">
          <Badge variant="secondary">{categoryLabels[habit.category]}</Badge>
          <Badge variant="outline">{frequencyLabels[habit.targetFrequency]}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
