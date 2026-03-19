import { EmotionsType } from '@/db/schema';

// Server Action 결과 타입
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// AI 응답 타입
export type AIEmotionResponse = {
  primaryEmotion: string;
  emotionScore: number;
  emotions: EmotionsType;
  keywords: string[];
};

// 검색 필터 타입
export type SearchFilters = {
  query?: string;
  startDate?: string;
  endDate?: string;
  tagIds?: string[];
};
