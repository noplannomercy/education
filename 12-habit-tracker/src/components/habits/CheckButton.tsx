'use client'

import { useState } from 'react'
import { checkHabit, uncheckHabit } from '@/lib/actions/logs'
import { getTodayDate } from '@/lib/utils/date'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

type CheckButtonProps = {
  habitId: string
  habitName: string
  isChecked: boolean
  date?: string // Optional: defaults to today
}

export function CheckButton({ habitId, habitName, isChecked, date }: CheckButtonProps) {
  const [checked, setChecked] = useState(isChecked)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    const targetDate = date || getTodayDate()
    setLoading(true)

    // Optimistic update
    const previousState = checked
    setChecked(!checked)

    try {
      const result = !checked
        ? await checkHabit(habitId, targetDate)
        : await uncheckHabit(habitId, targetDate)

      if (!result.success) {
        // Revert on error
        setChecked(previousState)
        toast.error(result.error || '오류가 발생했습니다')
      } else {
        toast.success(!checked ? `${habitName} 체크 완료!` : '체크 해제')
      }
    } catch (error) {
      // Revert on error
      setChecked(previousState)
      toast.error('오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={handleToggle}
      disabled={loading}
      className="h-6 w-6"
    />
  )
}
