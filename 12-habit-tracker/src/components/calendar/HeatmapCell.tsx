'use client'

import { getHeatmapColor, formatCompletionRate } from '@/lib/utils/heatmap'
import type { HeatmapDayData } from '@/lib/queries/statistics'
import { cn } from '@/lib/utils'

type HeatmapCellProps = {
  data: HeatmapDayData
  onClick?: () => void
}

export function HeatmapCell({ data, onClick }: HeatmapCellProps) {
  const colorClass = getHeatmapColor(data.completionRate)
  const day = new Date(data.date).getDate()

  return (
    <div
      className={cn(
        'aspect-square rounded-sm border border-gray-200 flex items-center justify-center text-xs transition-all hover:ring-2 hover:ring-blue-300 cursor-pointer relative group',
        colorClass
      )}
      onClick={onClick}
      title={`${data.date}: ${formatCompletionRate(data.completionRate)} (${data.habitsCompleted}/${data.totalHabits})`}
    >
      <span className="text-[10px] font-medium">{day}</span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          <div>{data.date}</div>
          <div className="font-semibold">{formatCompletionRate(data.completionRate)}</div>
          <div className="text-gray-300">
            {data.habitsCompleted}/{data.totalHabits} 습관
          </div>
        </div>
      </div>
    </div>
  )
}
