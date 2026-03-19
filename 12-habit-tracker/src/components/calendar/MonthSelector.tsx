'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

type MonthSelectorProps = {
  year: number
  month: number
}

export function MonthSelector({ year, month }: MonthSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateMonth = (delta: number) => {
    let newYear = year
    let newMonth = month + delta

    if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    } else if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set('year', newYear.toString())
    params.set('month', newMonth.toString())

    router.push(`/calendar?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateMonth(-1)}
        aria-label="이전 달"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="text-2xl font-bold min-w-[180px] text-center">
        {year}년 {month}월
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateMonth(1)}
        aria-label="다음 달"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
