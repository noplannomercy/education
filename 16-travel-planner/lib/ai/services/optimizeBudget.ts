// lib/ai/services/optimizeBudget.ts

import { generateText } from 'ai';
import { model } from '../client';
import { buildBudgetPrompt, type BudgetInput } from '../prompts/budget';
import { parseAIResponse } from '../utils/parseJSON';
import { retryAICall, withTimeout } from '../utils/retry';
import { checkAIRateLimit } from '../utils/rateLimit';
import { AIServiceError } from '@/lib/utils/errors';
import { z } from 'zod';

// AI가 추가 필드를 반환할 수 있으므로 유연하게 설정
const categoryAnalysisSchema = z.object({
  category: z.string(),
  spent: z.number().optional().default(0),
  budgeted: z.number().optional().default(0),
  remaining: z.number().optional().default(0),
  status: z.enum(['on_track', 'over_budget', 'under_budget']).optional().default('on_track'),
  recommendation: z.string().optional().default(''),
}).passthrough();

const recommendationSchema = z.object({
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  category: z.string(),
  action: z.string(),
  expectedSavings: z.number().optional().default(0),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
}).passthrough();

const budgetResponseSchema = z.object({
  analysis: z.object({
    overallStatus: z.enum(['on_track', 'over_budget', 'under_budget']).optional().default('on_track'),
    spendingRate: z.number().optional().default(0),
    projectedTotal: z.number().optional().default(0),
    riskLevel: z.enum(['low', 'medium', 'high']).optional().default('low'),
  }).passthrough(),
  categoryAnalysis: z.array(categoryAnalysisSchema).optional().default([]),
  recommendations: z.array(recommendationSchema).optional().default([]),
  optimizedBudget: z.object({
    transport: z.number().optional().default(0),
    accommodation: z.number().optional().default(0),
    food: z.number().optional().default(0),
    activities: z.number().optional().default(0),
    shopping: z.number().optional().default(0),
    emergency: z.number().optional().default(0),
  }).passthrough().optional().default({
    transport: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    shopping: 0,
    emergency: 0,
  }),
  tips: z.array(z.string()).optional().default([]),
}).passthrough();

export type CategoryAnalysis = z.infer<typeof categoryAnalysisSchema>;
export type BudgetRecommendation = z.infer<typeof recommendationSchema>;
export type BudgetResponse = z.infer<typeof budgetResponseSchema>;

/**
 * AI를 사용하여 예산을 최적화합니다.
 *
 * @param input - 예산 정보
 * @returns 최적화된 예산 분석
 */
export async function optimizeBudget(input: BudgetInput): Promise<BudgetResponse> {
  try {
    checkAIRateLimit();

    const prompt = buildBudgetPrompt(input);

    const result = await retryAICall(async () => {
      return await withTimeout(async () => {
        return await generateText({
          model,
          prompt,
          temperature: 0.7,
        });
      }, 45000); // Increased timeout for budget optimization
    }, 3, 2000);

    console.log('✅ AI 응답 받음, 길이:', result.text.length);

    const parsed = parseAIResponse<BudgetResponse>(result.text);

    console.log('✅ JSON 파싱 성공');
    console.log('📊 응답 구조:', {
      categoryAnalysisCount: parsed.categoryAnalysis?.length || 0,
      recommendationsCount: parsed.recommendations?.length || 0,
      tipsCount: parsed.tips?.length || 0,
    });

    const validated = budgetResponseSchema.parse(parsed);

    console.log('✅ 스키마 검증 성공');
    return validated;
  } catch (error) {
    console.error('❌ optimizeBudget error:', error);

    if (error instanceof z.ZodError) {
      console.error('📋 Zod 검증 실패 상세:', JSON.stringify(error.issues, null, 2));
      throw new AIServiceError('AI 응답 형식이 올바르지 않습니다');
    }

    if (error instanceof AIServiceError) {
      throw error;
    }

    throw new AIServiceError('예산 최적화 중 오류가 발생했습니다');
  }
}
