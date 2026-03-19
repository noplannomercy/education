// lib/validations/schemas.ts

import { z } from 'zod';

// ============================================================================
// Trip Schemas
// ============================================================================

const baseTripSchema = z.object({
  userId: z.string().min(1, '사용자 ID는 필수입니다'),
  name: z.string().min(1, '여행 이름은 필수입니다').max(255, '여행 이름은 255자 이하여야 합니다'),
  destination: z.string().min(1, '목적지는 필수입니다').max(255, '목적지는 255자 이하여야 합니다'),
  country: z.string().min(1, '국가는 필수입니다').max(100, '국가는 100자 이하여야 합니다'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)'),
  budget: z.number().min(0, '예산은 0 이상이어야 합니다').default(0),
  actualSpent: z.number().min(0, '실제 지출은 0 이상이어야 합니다').default(0).optional(),
  travelers: z.number().int().min(1, '여행 인원은 1명 이상이어야 합니다').default(1),
  tripType: z.enum(['vacation', 'business', 'adventure', 'backpacking'], {
    message: '올바른 여행 유형을 선택하세요',
  }),
  status: z.enum(['planning', 'ongoing', 'completed']).default('planning').optional(),
});

export const createTripSchema = baseTripSchema.refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: '종료일은 시작일보다 이후여야 합니다',
  path: ['endDate'],
});

export const updateTripSchema = baseTripSchema.partial().extend({
  version: z.number().int().min(1, '버전은 필수입니다'), // Optimistic locking
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;

// ============================================================================
// Destination Schemas
// ============================================================================

export const createDestinationSchema = z.object({
  name: z.string().min(1, '목적지 이름은 필수입니다').max(255, '목적지 이름은 255자 이하여야 합니다'),
  city: z.string().min(1, '도시는 필수입니다').max(100, '도시는 100자 이하여야 합니다'),
  country: z.string().min(1, '국가는 필수입니다').max(100, '국가는 100자 이하여야 합니다'),
  category: z.enum(['attraction', 'restaurant', 'accommodation', 'shopping', 'activity'], {
    message: '올바른 카테고리를 선택하세요',
  }),
  averageCost: z.number().min(0, '평균 비용은 0 이상이어야 합니다').default(0),
  recommendedDuration: z.number().int().min(0, '추천 체류 시간은 0 이상이어야 합니다').default(60),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const updateDestinationSchema = createDestinationSchema.partial();

export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;
export type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;

// ============================================================================
// Itinerary Schemas
// ============================================================================

const baseItinerarySchema = z.object({
  tripId: z.string().uuid('올바른 여행 ID 형식이 아닙니다'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)'),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, '시간 형식이 올바르지 않습니다 (HH:mm 또는 HH:mm:ss)'),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, '시간 형식이 올바르지 않습니다 (HH:mm 또는 HH:mm:ss)'),
  destinationId: z.string().uuid('올바른 목적지 ID 형식이 아닙니다').optional().nullable(),
  activity: z.string().min(1, '활동 내용은 필수입니다').max(500, '활동 내용은 500자 이하여야 합니다'),
  notes: z.string().optional().nullable(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  completed: z.boolean().default(false),
  order: z.number().int().min(0, '순서는 0 이상이어야 합니다').default(0),
});

export const createItinerarySchema = baseItinerarySchema.refine((data) => {
  // startTime과 endTime 비교 (HH:mm 형식)
  const startTime = data.startTime.substring(0, 5);
  const endTime = data.endTime.substring(0, 5);
  return endTime > startTime;
}, {
  message: '종료 시간은 시작 시간보다 이후여야 합니다',
  path: ['endTime'],
});

export const updateItinerarySchema = baseItinerarySchema.partial().extend({
  tripId: z.string().uuid().optional(),
});

export type CreateItineraryInput = z.infer<typeof createItinerarySchema>;
export type UpdateItineraryInput = z.infer<typeof updateItinerarySchema>;

// ============================================================================
// Expense Schemas
// ============================================================================

export const createExpenseSchema = z.object({
  tripId: z.string().uuid('올바른 여행 ID 형식이 아닙니다'),
  category: z.enum(['transport', 'accommodation', 'food', 'activity', 'shopping', 'other'], {
    message: '올바른 카테고리를 선택하세요',
  }),
  amount: z.string().min(1, '금액은 필수입니다'),
  currency: z.string().length(3, '통화 코드는 3자리여야 합니다 (예: KRW, USD)').default('KRW').optional(),
  description: z.string().min(1, '설명은 필수입니다').max(500, '설명은 500자 이하여야 합니다'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)'),
  notes: z.string().nullish(),
});

export const updateExpenseSchema = z.object({
  category: z.enum(['transport', 'accommodation', 'food', 'activity', 'shopping', 'other']).optional(),
  amount: z.string().min(1).optional(),
  currency: z.string().length(3).optional(),
  description: z.string().min(1).max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().nullish(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

// ============================================================================
// AI Recommendation Schemas
// ============================================================================

export const createAIRecommendationSchema = z.object({
  tripId: z.string().uuid('올바른 여행 ID 형식이 아닙니다'),
  type: z.enum(['itinerary', 'place', 'budget', 'optimization', 'insight'], {
    message: '올바른 추천 타입을 선택하세요',
  }),
  title: z.string().min(1, '제목은 필수입니다').max(255, '제목은 255자 이하여야 합니다'),
  content: z.string().min(1, '내용은 필수입니다'),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  applied: z.boolean().default(false),
});

export const updateAIRecommendationSchema = createAIRecommendationSchema.partial().extend({
  tripId: z.string().uuid().optional(),
});

export type CreateAIRecommendationInput = z.infer<typeof createAIRecommendationSchema>;
export type UpdateAIRecommendationInput = z.infer<typeof updateAIRecommendationSchema>;

// ============================================================================
// Query Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const tripFilterSchema = z.object({
  userId: z.string().optional(),
  status: z.enum(['planning', 'ongoing', 'completed']).optional(),
  tripType: z.enum(['vacation', 'business', 'adventure', 'backpacking']).optional(),
  destination: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type TripFilterInput = z.infer<typeof tripFilterSchema>;
