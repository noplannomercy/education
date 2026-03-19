'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateWeeklyInsightAction } from '@/actions/insight';
import { formatDateShort } from '@/lib/date-utils';
import { Sparkles, TrendingUp, Target } from 'lucide-react';
import { toast } from 'sonner';
import type { WeeklyInsight as WeeklyInsightType } from '@/db/schema';

interface WeeklyInsightProps {
  weekStart: string;
  weekEnd: string;
  initialInsight?: WeeklyInsightType | null;
}

export function WeeklyInsight({ weekStart, weekEnd, initialInsight }: WeeklyInsightProps) {
  const [insight, setInsight] = useState<WeeklyInsightType | null>(initialInsight || null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);

    try {
      const result = await generateWeeklyInsightAction(weekStart, weekEnd);

      if (result.success) {
        setInsight(result.data);
        toast.success('주간 인사이트가 생성되었습니다');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Generate insight error:', error);
      toast.error('주간 인사이트 생성에 실패했습니다');
    } finally {
      setIsGenerating(false);
    }
  }

  const weekLabel = `${formatDateShort(weekStart)} ~ ${formatDateShort(weekEnd)}`;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">주간 인사이트</h3>
          <p className="text-sm text-gray-600 mt-1">{weekLabel}</p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          variant="outline"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isGenerating ? '분석 중...' : insight ? '새로 분석하기' : 'AI 분석하기'}
        </Button>
      </div>

      {insight ? (
        <div className="space-y-6">
          {/* Emotion Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              이번 주 감정 요약
            </h4>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-gray-600">평균 감정 점수:</span>{' '}
                <span className="font-semibold">{insight.emotionSummary.averageScore}/10</span>
              </div>
              <div>
                <span className="text-gray-600">주요 감정:</span>{' '}
                <span className="font-semibold">{insight.emotionSummary.dominantEmotion}</span>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              AI 인사이트
            </h4>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {insight.insight}
              </div>
            </div>
          </div>

          {/* Emotion Details */}
          {Object.keys(insight.emotionSummary.emotionCounts).length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">감정 분포</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(insight.emotionSummary.emotionCounts).map(([emotion, count]) => (
                  <div
                    key={emotion}
                    className="bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    {emotion} <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 pt-4 border-t">
            생성일: {new Date(insight.createdAt || '').toLocaleString('ko-KR')}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>AI 분석하기 버튼을 눌러 주간 인사이트를 생성하세요</p>
        </div>
      )}
    </Card>
  );
}
