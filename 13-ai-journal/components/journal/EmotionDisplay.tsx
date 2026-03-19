import type { EmotionAnalysis } from '@/db/schema';
import { getEmotionEmoji } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmotionDisplayProps {
  emotion: EmotionAnalysis;
  summary?: string;
}

export function EmotionDisplay({ emotion, summary }: EmotionDisplayProps) {
  const emoji = getEmotionEmoji(emotion.primaryEmotion);
  const keywords = emotion.keywords as string[];

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span>AI 감정 분석</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">주요 감정</p>
          <p className="text-xl font-bold text-gray-900">
            {emotion.primaryEmotion} ({emotion.emotionScore}/10)
          </p>
        </div>

        {keywords && keywords.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">키워드</p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, i) => (
                <span
                  key={i}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600">키워드 없음</p>
          </div>
        )}

        {summary && (
          <div>
            <p className="text-sm text-gray-600 mb-2">요약</p>
            <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-600 mb-2">세부 감정 분석</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(emotion.emotions as Record<string, number>).map(
              ([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 capitalize">
                    {key === 'happiness' && '행복'}
                    {key === 'sadness' && '슬픔'}
                    {key === 'anger' && '분노'}
                    {key === 'anxiety' && '불안'}
                    {key === 'calm' && '평온'}
                    {key === 'gratitude' && '감사'}
                  </span>
                  <span className="font-medium text-gray-900">{value}/10</span>
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
