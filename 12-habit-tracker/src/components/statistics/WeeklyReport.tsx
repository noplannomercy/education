import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, AlertTriangle } from 'lucide-react'

type HabitReport = {
  habitId: string
  habitName: string
  logsCount: number
  targetFrequency: number
  achievementRate: number
}

type WeeklyReportProps = {
  best: HabitReport | null
  worst: HabitReport | null
}

export function WeeklyReport({ best, worst }: WeeklyReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>주간 리포트</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Best Habit */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">최고 습관</h3>
          </div>
          {best ? (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <p className="font-medium mb-1">{best.habitName}</p>
              <div className="text-sm text-muted-foreground">
                <p>
                  이번 주: {best.logsCount}/{best.targetFrequency}회 완료
                </p>
                <p className="text-green-600 dark:text-green-400 font-semibold">
                  달성률: {Math.round(best.achievementRate)}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">데이터가 없습니다</p>
          )}
        </div>

        {/* Worst Habit */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">개선 필요</h3>
          </div>
          {worst ? (
            <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
              <p className="font-medium mb-1">{worst.habitName}</p>
              <div className="text-sm text-muted-foreground">
                <p>
                  이번 주: {worst.logsCount}/{worst.targetFrequency}회 완료
                </p>
                <p className="text-orange-600 dark:text-orange-400 font-semibold">
                  달성률: {Math.round(worst.achievementRate)}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">데이터가 없습니다</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
