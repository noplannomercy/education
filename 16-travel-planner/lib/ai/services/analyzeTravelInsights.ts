// lib/ai/services/analyzeTravelInsights.ts

import { generateText } from 'ai';
import { model } from '../client';
import { buildInsightsPrompt, type InsightsInput } from '../prompts/insights';
import { parseAIResponse } from '../utils/parseJSON';
import { retryAICall, withTimeout } from '../utils/retry';
import { checkAIRateLimit } from '../utils/rateLimit';
import { AIServiceError } from '@/lib/utils/errors';
import { z } from 'zod';

// AI가 추가 필드를 반환할 수 있으므로 유연하게 설정
const savingsOpportunitySchema = z.object({
  category: z.string(),
  potentialSavings: z.number().optional().default(0),
  suggestion: z.string().optional().default(''),
}).passthrough();

const budgetInsightsSchema = z.object({
  efficiency: z.enum(['good', 'average', 'poor']).optional().default('average'),
  comparison: z.string().optional().default(''),
  savingsOpportunities: z.array(savingsOpportunitySchema).optional().default([]),
}).passthrough();

const travelStyleSchema = z.object({
  pace: z.enum(['fast', 'moderate', 'slow']).optional().default('moderate'),
  preferences: z.array(z.string()).optional().default([]),
  budgetLevel: z.enum(['budget', 'mid-range', 'luxury']).optional().default('mid-range'),
}).passthrough();

const recommendationItemSchema = z.object({
  category: z.string(),
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  suggestion: z.string(),
  expectedBenefit: z.string().optional().default(''),
}).passthrough();

const nextTripSuggestionsSchema = z.object({
  similarDestinations: z.array(z.string()).optional().default([]),
  budgetEstimate: z.number().optional().default(0),
  bestTimeToVisit: z.string().optional().default(''),
  tips: z.array(z.string()).optional().default([]),
}).passthrough();

const insightsResponseSchema = z.object({
  overallScore: z.number().min(0).max(100).optional().default(50),
  highlights: z.array(z.string()).optional().default([]),
  concerns: z.array(z.string()).optional().default([]),
  budgetInsights: budgetInsightsSchema.optional().default({
    efficiency: 'average',
    comparison: '',
    savingsOpportunities: [],
  }),
  travelStyle: travelStyleSchema.optional().default({
    pace: 'moderate',
    preferences: [],
    budgetLevel: 'mid-range',
  }),
  recommendations: z.array(recommendationItemSchema).optional().default([]),
  nextTripSuggestions: nextTripSuggestionsSchema.optional().default({
    similarDestinations: [],
    budgetEstimate: 0,
    bestTimeToVisit: '',
    tips: [],
  }),
  summary: z.string().optional().default('여행 인사이트 분석이 완료되었습니다.'),
}).passthrough();

export type SavingsOpportunity = z.infer<typeof savingsOpportunitySchema>;
export type BudgetInsights = z.infer<typeof budgetInsightsSchema>;
export type TravelStyle = z.infer<typeof travelStyleSchema>;
export type RecommendationItem = z.infer<typeof recommendationItemSchema>;
export type NextTripSuggestions = z.infer<typeof nextTripSuggestionsSchema>;
export type InsightsResponse = z.infer<typeof insightsResponseSchema>;

/**
 * AI를 사용하여 여행 인사이트를 분석합니다.
 *
 * @param input - 여행 정보
 * @returns 여행 인사이트 분석
 */
export async function analyzeTravelInsights(input: InsightsInput): Promise<InsightsResponse> {
  try {
    checkAIRateLimit();

    const prompt = buildInsightsPrompt(input);

    const result = await retryAICall(async () => {
      return await withTimeout(async () => {
        return await generateText({
          model,
          prompt,
          temperature: 0.7,
          maxOutputTokens: 3500,
        });
      }, 45000); // Increased timeout for insights analysis
    }, 3, 2000);

    console.log('✅ AI 응답 받음, 길이:', result.text.length);

    const parsed = parseAIResponse<InsightsResponse>(result.text);

    console.log('✅ JSON 파싱 성공');
    console.log('📊 응답 구조:', {
      highlightsCount: parsed.highlights?.length || 0,
      concernsCount: parsed.concerns?.length || 0,
      recommendationsCount: parsed.recommendations?.length || 0,
    });

    const validated = insightsResponseSchema.parse(parsed);

    console.log('✅ 스키마 검증 성공');
    return validated;
  } catch (error) {
    console.error('analyzeTravelInsights error:', error);

    if (error instanceof z.ZodError) {
      throw new AIServiceError('AI 응답 형식이 올바르지 않습니다');
    }

    if (error instanceof AIServiceError) {
      throw error;
    }

    throw new AIServiceError('여행 인사이트 분석 중 오류가 발생했습니다');
  }
}
