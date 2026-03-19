// lib/ai/services/generateItinerary.ts

import { generateText } from 'ai';
import { model } from '../client';
import { buildItineraryPrompt, type ItineraryInput } from '../prompts/itinerary';
import { parseAIResponse } from '../utils/parseJSON';
import { retryAICall, withTimeout } from '../utils/retry';
import { checkAIRateLimit } from '../utils/rateLimit';
import { AIServiceError } from '@/lib/utils/errors';
import { z } from 'zod';

// 응답 스키마 정의 (AI가 일부 필드를 누락할 수 있으므로 유연하게 설정)
const dailyPlanSchema = z.object({
  date: z.string(),
  dayNumber: z.number().optional().default(1),
  theme: z.string().optional().default('여행'),
  activities: z.array(z.object({
    time: z.string(),
    duration: z.number().optional().default(60),
    activity: z.string(),
    location: z.string(),
    estimatedCost: z.number().optional().default(0),
    priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
    notes: z.string().optional(),
  })).min(1),
});

const budgetBreakdownSchema = z.object({
  transport: z.number().optional().default(0),
  accommodation: z.number().optional().default(0),
  food: z.number().optional().default(0),
  activities: z.number().optional().default(0),
  shopping: z.number().optional().default(0),
  emergency: z.number().optional().default(0),
});

const itineraryResponseSchema = z.object({
  dailyPlans: z.array(dailyPlanSchema).min(1),
  budgetBreakdown: budgetBreakdownSchema.optional().default({
    transport: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    shopping: 0,
    emergency: 0,
  }),
  tips: z.array(z.string()).optional().default([]),
});

export type DailyPlan = z.infer<typeof dailyPlanSchema>;
export type ItineraryResponse = z.infer<typeof itineraryResponseSchema>;

/**
 * AI를 사용하여 여행 일정을 자동 생성합니다.
 *
 * @param input - 여행 정보
 * @returns 생성된 일정
 */
export async function generateItinerary(input: ItineraryInput): Promise<ItineraryResponse> {
  try {
    // Rate limit 체크
    checkAIRateLimit();

    // 프롬프트 생성
    const prompt = buildItineraryPrompt(input);

    // AI 호출 (재시도 + 타임아웃)
    const result = await retryAICall(async () => {
      return await withTimeout(async () => {
        const response = await generateText({
          model,
          prompt,
          temperature: 0.7,
        });
        return response;
      }, 45000); // Increased timeout to 45 seconds for longer responses
    }, 3, 2000); // Increased retry delay to 2 seconds

    // JSON 파싱
    const parsed = parseAIResponse<ItineraryResponse>(result.text);

    console.log('✅ JSON 파싱 성공');
    console.log('📊 응답 구조:', {
      dailyPlansCount: parsed.dailyPlans?.length || 0,
      hasBudgetBreakdown: !!parsed.budgetBreakdown,
      tipsCount: parsed.tips?.length || 0,
    });

    // 스키마 검증
    const validated = itineraryResponseSchema.parse(parsed);

    console.log('✅ 스키마 검증 성공');
    return validated;
  } catch (error) {
    console.error('❌ generateItinerary error:', error);

    if (error instanceof z.ZodError) {
      console.error('📋 Zod 검증 실패 상세:', JSON.stringify(error.issues, null, 2));
      throw new AIServiceError('AI 응답 형식이 올바르지 않습니다');
    }

    if (error instanceof AIServiceError) {
      throw error;
    }

    throw new AIServiceError('일정 생성 중 오류가 발생했습니다');
  }
}
