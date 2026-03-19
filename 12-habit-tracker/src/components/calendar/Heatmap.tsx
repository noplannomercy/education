'use client'

import type { HeatmapDayData } from '@/lib/queries/statistics'
import { HeatmapCell } from './HeatmapCell'
import { getFirstDayOfMonth } from '@/lib/utils/date'

type HeatmapProps = {
  year: number
  month: number
  data: HeatmapDayData[]
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토']

export function Heatmap({ year, month, data }: HeatmapProps) {
  const firstDayOfWeek = getFirstDayOfMonth(year, month)
  const daysInMonth = data.length

  // Create empty cells for days before the first day of month
  const emptyCells = Array(firstDayOfWeek).fill(null)

  return (
    <div>
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells before first day */}
        {emptyCells.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Actual days */}
        {data.map((dayData) => (
          <HeatmapCell key={dayData.date} data={dayData} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
        <span>적음</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded-sm bg-gray-100 border border-gray-200" />
          <div className="w-4 h-4 rounded-sm bg-green-200 border border-gray-200" />
          <div className="w-4 h-4 rounded-sm bg-green-400 border border-gray-200" />
          <div className="w-4 h-4 rounded-sm bg-green-600 border border-gray-200" />
          <div className="w-4 h-4 rounded-sm bg-green-800 border border-gray-200" />
        </div>
        <span>많음</span>
      </div>
    </div>
  )
}
