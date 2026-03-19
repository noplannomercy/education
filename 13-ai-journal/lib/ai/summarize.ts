import { generateText } from 'ai';
import { model, AI_CONFIG } from './client';
import { SUMMARY_PROMPT } from './prompts';
import { validateContentLength } from './utils';

export async function summarizeJournal(content: string): Promise<string> {
  // 콘텐츠 길이 검증
  const validation = validateContentLength(content);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 콘텐츠가 너무 길면 잘라서 처리
  const processedContent = validation.truncated || content;

  try {
    const { text } = await generateText({
      model,
      prompt: SUMMARY_PROMPT(processedContent),
      temperature: AI_CONFIG.temperature,
    });

    return text.trim();
  } catch (error) {
    console.error('Summary generation error:', error);
    throw new Error(
      `요약 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}
