import { generateText } from 'ai';
import { model, AI_CONFIG } from './client';
import { emotionResponseSchema, EmotionResponse } from './schemas';
import { EMOTION_ANALYSIS_PROMPT } from './prompts';
import { validateContentLength, parseAIResponseWithRetry } from './utils';

export async function analyzeEmotion(content: string): Promise<EmotionResponse> {
  // 콘텐츠 길이 검증
  const validation = validateContentLength(content);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 콘텐츠가 너무 길면 잘라서 처리
  const processedContent = validation.truncated || content;

  try {
    // AI 응답을 재시도 로직과 함께 파싱
    const result = await parseAIResponseWithRetry(
      async () => {
        const { text } = await generateText({
          model,
          prompt: EMOTION_ANALYSIS_PROMPT(processedContent),
          temperature: AI_CONFIG.temperature,
        });
        return text;
      },
      emotionResponseSchema,
      3 // 최대 3회 재시도
    );

    return result;
  } catch (error) {
    console.error('Emotion analysis error:', error);
    throw new Error(
      `감정 분석에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}
