'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { EmotionTrend } from '@/actions/stats';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface EmotionLineChartProps {
  data: EmotionTrend[];
}

export default function EmotionLineChart({ data }: EmotionLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        감정 추이 데이터가 없습니다
      </div>
    );
  }

  // Format data for display
  const formattedData = data.map(item => ({
    ...item,
    displayDate: format(new Date(item.date), 'M/d', { locale: ko }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="displayDate"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          labelFormatter={(label) => `날짜: ${label}`}
          formatter={(value: number | undefined) => value !== undefined ? [`${value}점`, '감정 점수'] : ['', '']}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ fill: '#8884d8', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
