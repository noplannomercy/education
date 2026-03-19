// types/enums.ts

/**
 * 통합 Enum 타입 정의
 */

// 여행 유형
export type TripType = 'vacation' | 'business' | 'adventure' | 'backpacking';

// 여행 상태
export type TripStatus = 'planning' | 'ongoing' | 'completed';

// 목적지 카테고리
export type DestinationCategory = 'attraction' | 'restaurant' | 'accommodation' | 'shopping' | 'activity';

// 우선순위
export type Priority = 'high' | 'medium' | 'low';

// 지출 카테고리
export type ExpenseCategory = 'transport' | 'accommodation' | 'food' | 'activity' | 'shopping' | 'other';

// AI 추천 타입
export type AIRecommendationType = 'itinerary' | 'place' | 'budget' | 'optimization' | 'insight';

// 통화 코드
export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'CNY';

/**
 * Enum 라벨 매핑
 */
export const TRIP_TYPE_LABELS: Record<TripType, string> = {
  vacation: '휴가',
  business: '출장',
  adventure: '모험',
  backpacking: '배낭여행',
};

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  planning: '계획 중',
  ongoing: '진행 중',
  completed: '완료',
};

export const DESTINATION_CATEGORY_LABELS: Record<DestinationCategory, string> = {
  attraction: '관광지',
  restaurant: '음식점',
  accommodation: '숙박',
  shopping: '쇼핑',
  activity: '액티비티',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  transport: '교통',
  accommodation: '숙박',
  food: '식비',
  activity: '액티비티',
  shopping: '쇼핑',
  other: '기타',
};

export const AI_RECOMMENDATION_TYPE_LABELS: Record<AIRecommendationType, string> = {
  itinerary: '일정 생성',
  place: '장소 추천',
  budget: '예산 최적화',
  optimization: '일정 조정',
  insight: '여행 인사이트',
};
