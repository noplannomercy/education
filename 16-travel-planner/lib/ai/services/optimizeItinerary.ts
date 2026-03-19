// lib/ai/services/optimizeItinerary.ts

import { generateText } from 'ai';
import { model } from '../client';
import { buildOptimizationPrompt, type OptimizationInput } from '../prompts/optimization';
import { parseAIResponse } from '../utils/parseJSON';
import { retryAICall, withTimeout } from '../utils/retry';
import { checkAIRateLimit } from '../utils/rateLimit';
import { AIServiceError } from '@/lib/utils/errors';
import { z } from 'zod';

// AI가 추가 필드를 반환할 수 있으므로 유연하게 설정
const conflictSchema = z.object({
  itineraryIds: z.array(z.string()).optional().default([]),
  issue: z.string(),
  severity: z.enum(['high', 'medium', 'low']).optional().default('medium'),
}).passthrough(); // 추가 필드 허용

const inefficiencySchema = z.object({
  date: z.string().optional().default(''),
  issue: z.string(),
  impact: z.string().optional().default(''),
}).passthrough();

const suggestionSchema = z.object({
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  type: z.string(),
  reason: z.string(),
  expectedImprovement: z.string().optional().default(''),
}).passthrough();

const optimizedScheduleSchema = z.object({
  itineraryId: z.string(),
  suggestedDate: z.string(),
  suggestedStartTime: z.string(),
  suggestedEndTime: z.string(),
  reason: z.string(),
}).passthrough();

const newSuggestionSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  activity: z.string(),
  location: z.string().optional().default(''),
  reason: z.string().optional().default(''),
  estimatedCost: z.number().optional().default(0),
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
}).passthrough();

const optimizationResponseSchema = z.object({
  analysis: z.object({
    conflicts: z.array(conflictSchema).optional().default([]),
    inefficiencies: z.array(inefficiencySchema).optional().default([]),
    suggestions: z.array(suggestionSchema).optional().default([]),
  }).passthrough(),
  optimizedSchedule: z.array(optimizedScheduleSchema).optional().default([]),
  newSuggestions: z.array(newSuggestionSchema).optional().default([]),
  summary: z.string().optional().default('일정 최적화 분석이 완료되었습니다.'),
}).passthrough();

export type Conflict = z.infer<typeof conflictSchema>;
export type Inefficiency = z.infer<typeof inefficiencySchema>;
export type Suggestion = z.infer<typeof suggestionSchema>;
export type OptimizedScheduleItem = z.infer<typeof optimizedScheduleSchema>;
export type NewSuggestion = z.infer<typeof newSuggestionSchema>;
export type OptimizationResponse = z.infer<typeof optimizationResponseSchema>;

/**
 * AI를 사용하여 일정을 최적화합니다.
 *
 * @param input - 일정 정보
 * @returns 최적화된 일정 분석
 */
export async function optimizeItinerary(input: OptimizationInput): Promise<OptimizationResponse> {
  try {
    checkAIRateLimit();

    const prompt = buildOptimizationPrompt(input);

    const result = await retryAICall(async () => {
      return await withTimeout(async () => {
        return await generateText({
          model,
          prompt,
          temperature: 0.7,
        });
      }, 45000); // Increased timeout for optimization
    }, 3, 2000);

    console.log('✅ AI 응답 받음, 길이:', result.text.length);

    const parsed = parseAIResponse<OptimizationResponse>(result.text);

    console.log('✅ JSON 파싱 성공');
    console.log('📊 응답 구조:', {
      conflictsCount: parsed.analysis?.conflicts?.length || 0,
      inefficienciesCount: parsed.analysis?.inefficiencies?.length || 0,
      suggestionsCount: parsed.analysis?.suggestions?.length || 0,
      optimizedScheduleCount: parsed.optimizedSchedule?.length || 0,
      newSuggestionsCount: parsed.newSuggestions?.length || 0,
    });

    const validated = optimizationResponseSchema.parse(parsed);

    console.log('✅ 스키마 검증 성공');
    return validated;
  } catch (error) {
    console.error('❌ optimizeItinerary error:', error);

    if (error instanceof z.ZodError) {
      console.error('📋 Zod 검증 실패 상세:', JSON.stringify(error.issues, null, 2));
      throw new AIServiceError('AI 응답 형식이 올바르지 않습니다');
    }

    if (error instanceof AIServiceError) {
      throw error;
    }

    throw new AIServiceError('일정 최적화 중 오류가 발생했습니다');
  }
}
