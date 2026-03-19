import { generateText } from 'ai';
import { model, AI_CONFIG } from './client';
import { WEEKLY_INSIGHT_PROMPT } from './prompts';
import type { JournalEntry } from '@/db/schema';

export async function generateWeeklyInsight(journals: JournalEntry[]): Promise<string> {
  // Edge Case: 일기 0개
  if (journals.length === 0) {
    return '이번 주 작성된 일기가 없습니다';
  }

  try {
    // 일기를 문자열로 포맷
    const journalsText = journals
      .map((j, index) => {
        const date = new Date(j.date).toLocaleDateString('ko-KR');
        return `[${index + 1}] ${date} - ${j.title}\n${j.content}\n`;
      })
      .join('\n---\n\n');

    const { text } = await generateText({
      model,
      prompt: WEEKLY_INSIGHT_PROMPT(journalsText),
      temperature: AI_CONFIG.temperature,
    });

    return text.trim();
  } catch (error) {
    console.error('Weekly insight generation error:', error);
    throw new Error(
      `주간 인사이트 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}
