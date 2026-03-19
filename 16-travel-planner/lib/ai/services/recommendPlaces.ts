// lib/ai/services/recommendPlaces.ts

import { generateText } from 'ai';
import { model } from '../client';
import { buildPlacesPrompt, type PlacesInput } from '../prompts/places';
import { parseAIResponse } from '../utils/parseJSON';
import { retryAICall, withTimeout } from '../utils/retry';
import { checkAIRateLimit } from '../utils/rateLimit';
import { AIServiceError } from '@/lib/utils/errors';
import { z } from 'zod';

// AI가 추가 필드를 반환할 수 있으므로 유연하게 설정
const placeSchema = z.object({
  name: z.string(),
  category: z.enum(['attraction', 'restaurant', 'accommodation', 'shopping', 'activity']).optional().default('attraction'),
  description: z.string().optional().default(''),
  address: z.string().optional().default(''),
  averageCost: z.number().optional().default(0),
  recommendedDuration: z.number().optional().default(1),
  openingHours: z.string().optional().default(''),
  rating: z.number().optional().default(0),
  tips: z.array(z.string()).optional().default([]),
  nearbyTransport: z.string().optional().default(''),
  bestTime: z.string().optional().default(''),
}).passthrough();

const placesResponseSchema = z.object({
  places: z.array(placeSchema).optional().default([]),
  summary: z.string().optional().default('장소 추천이 완료되었습니다.'),
}).passthrough();

export type Place = z.infer<typeof placeSchema>;
export type PlacesResponse = z.infer<typeof placesResponseSchema>;

/**
 * AI를 사용하여 장소를 추천합니다.
 *
 * @param input - 추천 요청 정보
 * @returns 추천 장소 목록
 */
export async function recommendPlaces(input: PlacesInput): Promise<PlacesResponse> {
  try {
    checkAIRateLimit();

    const prompt = buildPlacesPrompt(input);

    const result = await retryAICall(async () => {
      return await withTimeout(async () => {
        return await generateText({
          model,
          prompt,
          temperature: 0.7,
          maxOutputTokens: 3000,
        });
      }, 45000); // Increased timeout for place recommendations
    }, 3, 2000);

    console.log('✅ AI 응답 받음, 길이:', result.text.length);

    const parsed = parseAIResponse<PlacesResponse>(result.text);

    console.log('✅ JSON 파싱 성공');
    console.log('📊 응답 구조:', {
      placesCount: parsed.places?.length || 0,
    });

    const validated = placesResponseSchema.parse(parsed);

    console.log('✅ 스키마 검증 성공');
    return validated;
  } catch (error) {
    console.error('recommendPlaces error:', error);

    if (error instanceof z.ZodError) {
      throw new AIServiceError('AI 응답 형식이 올바르지 않습니다');
    }

    if (error instanceof AIServiceError) {
      throw error;
    }

    throw new AIServiceError('장소 추천 중 오류가 발생했습니다');
  }
}
