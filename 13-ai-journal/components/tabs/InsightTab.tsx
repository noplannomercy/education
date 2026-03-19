'use client';

import { useState, useEffect } from 'react';
import { WeeklyInsight } from '@/components/insight/WeeklyInsight';
import { getWeeklyInsight, getRecentInsights } from '@/actions/insight';
import { getWeekRange } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { WeeklyInsight as WeeklyInsightType } from '@/db/schema';

export function InsightTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeekInsight, setCurrentWeekInsight] = useState<WeeklyInsightType | null>(null);
  const [recentInsights, setRecentInsights] = useState<WeeklyInsightType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const weekRange = getWeekRange(currentDate);

  useEffect(() => {
    async function loadInsights() {
      setIsLoading(true);
      try {
        const [current, recent] = await Promise.all([
          getWeeklyInsight(weekRange.start, weekRange.end),
          getRecentInsights(5),
        ]);

        setCurrentWeekInsight(current);
        setRecentInsights(recent);
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadInsights();
  }, [weekRange.start, weekRange.end]);

  function handlePrevWeek() {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  }

  function handleNextWeek() {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  }

  function handleThisWeek() {
    setCurrentDate(new Date());
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        인사이트를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevWeek}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          이전 주
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleThisWeek}
        >
          이번 주
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextWeek}
        >
          다음 주
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Current Week Insight */}
      <WeeklyInsight
        weekStart={weekRange.start}
        weekEnd={weekRange.end}
        initialInsight={currentWeekInsight}
      />

      {/* Recent Insights */}
      {recentInsights.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">최근 인사이트</h3>
          <div className="space-y-4">
            {recentInsights.map((insight) => (
              <div
                key={insight.id}
                className="rounded-lg border p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  // Navigate to this week
                  const weekStartDate = new Date(insight.weekStart);
                  setCurrentDate(weekStartDate);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">
                    {insight.weekStart} ~ {insight.weekEnd}
                  </div>
                  <div className="text-xs text-gray-500">
                    {insight.emotionSummary.dominantEmotion} ({insight.emotionSummary.averageScore}/10)
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {insight.insight}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
