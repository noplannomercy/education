'use server';

import { db } from '@/db';
import { journalEntries } from '@/db/schema';
import { and, gte, lte, desc } from 'drizzle-orm';

export async function exportToMarkdown(
  startDate: string,
  endDate: string
): Promise<string> {
  try {
    const journals = await db.query.journalEntries.findMany({
      where: and(
        gte(journalEntries.date, startDate),
        lte(journalEntries.date, endDate)
      ),
      with: {
        emotionAnalysis: true,
        journalTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(journalEntries.date)],
    });

    if (journals.length === 0) {
      return '선택한 기간에 작성된 일기가 없습니다.';
    }

    let markdown = `# 일기 내보내기\n\n`;
    markdown += `기간: ${startDate} ~ ${endDate}\n\n`;
    markdown += `총 ${journals.length}개의 일기\n\n`;
    markdown += `---\n\n`;

    for (const journal of journals) {
      markdown += `# ${journal.date}\n\n`;
      markdown += `## ${journal.title}\n\n`;
      markdown += `${journal.content}\n\n`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((journal as any).emotionAnalysis) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emotion = (journal as any).emotionAnalysis;
        markdown += `**감정**: ${emotion.primaryEmotion} (${emotion.emotionScore}/10)\n\n`;

        if (emotion.keywords && emotion.keywords.length > 0) {
          const keywords = (emotion.keywords as string[])
            .map(k => `#${k}`)
            .join(' ');
          markdown += `**키워드**: ${keywords}\n\n`;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((journal as any).journalTags && (journal as any).journalTags.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tags = (journal as any).journalTags
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((jt: any) => `#${jt.tag.name}`)
          .join(' ');
        markdown += `**태그**: ${tags}\n\n`;
      }

      markdown += `---\n\n`;
    }

    return markdown;
  } catch (error) {
    console.error('Export to markdown error:', error);
    return '내보내기에 실패했습니다.';
  }
}
