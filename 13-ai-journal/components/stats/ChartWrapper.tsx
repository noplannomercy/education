'use client';

import dynamic from 'next/dynamic';
import type { EmotionDistribution, EmotionTrend } from '@/actions/stats';

// Dynamic imports to prevent SSR issues with Recharts
export const EmotionPieChartDynamic = dynamic(
  () => import('./EmotionPieChart'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        차트 로딩중...
      </div>
    ),
  }
);

export const EmotionLineChartDynamic = dynamic(
  () => import('./EmotionLineChart'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        차트 로딩중...
      </div>
    ),
  }
);

// Re-export prop types for convenience
export type { EmotionDistribution, EmotionTrend };
