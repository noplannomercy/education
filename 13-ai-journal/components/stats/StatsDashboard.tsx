'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import {
  getMonthlyWritingStats,
  getEmotionDistribution,
  getEmotionTrend,
  getTagUsageStats,
  type MonthlyWritingStats,
  type EmotionDistribution,
  type EmotionTrend,
  type TagUsageStats,
} from '@/actions/stats';
import { EmotionPieChartDynamic, EmotionLineChartDynamic } from './ChartWrapper';
import { TagCloud } from './TagCloud';
import { BookOpen, Flame, TrendingUp, FileText } from 'lucide-react';

export function StatsDashboard() {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyWritingStats | null>(null);
  const [emotionDist, setEmotionDist] = useState<EmotionDistribution[]>([]);
  const [emotionTrend, setEmotionTrend] = useState<EmotionTrend[]>([]);
  const [tagUsage, setTagUsage] = useState<TagUsageStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);

      // Get current month
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // Calculate date range for last 30 days
      const endDate = now.toISOString().split('T')[0];
      const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      try {
        const [stats, dist, trend, tags] = await Promise.all([
          getMonthlyWritingStats(year, month),
          getEmotionDistribution(startDate, endDate),
          getEmotionTrend(startDate, endDate),
          getTagUsageStats(),
        ]);

        setMonthlyStats(stats);
        setEmotionDist(dist);
        setEmotionTrend(trend);
        setTagUsage(tags);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        통계를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">이번 달 작성 일수</p>
              <p className="text-3xl font-bold mt-2">{monthlyStats?.daysWritten || 0}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">연속 작성 일수</p>
              <p className="text-3xl font-bold mt-2">{monthlyStats?.currentStreak || 0}</p>
            </div>
            <Flame className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">평균 감정 점수</p>
              <p className="text-3xl font-bold mt-2">
                {monthlyStats?.averageEmotionScore?.toFixed(1) || '0.0'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 일기 수</p>
              <p className="text-3xl font-bold mt-2">{monthlyStats?.totalJournals || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">감정 분포 (최근 30일)</h3>
          <EmotionPieChartDynamic data={emotionDist} />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">감정 추이 (최근 30일)</h3>
          <EmotionLineChartDynamic data={emotionTrend} />
        </Card>
      </div>

      {/* Tag Cloud */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">자주 사용한 태그</h3>
        <TagCloud data={tagUsage} />
      </Card>
    </div>
  );
}
