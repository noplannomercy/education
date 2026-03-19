'use client';

import type { TagUsageStats } from '@/actions/stats';

interface TagCloudProps {
  data: TagUsageStats[];
}

export function TagCloud({ data }: TagCloudProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-500">
        사용된 태그가 없습니다
      </div>
    );
  }

  // Find max count for sizing
  const maxCount = Math.max(...data.map(item => item.count));

  // Calculate font size based on count
  const getFontSize = (count: number) => {
    const minSize = 14;
    const maxSize = 32;
    const ratio = count / maxCount;
    return minSize + (maxSize - minSize) * ratio;
  };

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center p-6">
      {data.map((item, index) => (
        <div
          key={index}
          className="inline-block transition-transform hover:scale-110"
          style={{
            fontSize: `${getFontSize(item.count)}px`,
          }}
        >
          <span
            className="font-semibold cursor-default"
            style={{ color: item.color }}
          >
            #{item.tag}
          </span>
          <span className="text-gray-500 text-sm ml-1">({item.count})</span>
        </div>
      ))}
    </div>
  );
}
