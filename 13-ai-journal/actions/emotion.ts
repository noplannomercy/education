'use server';

import { db } from '@/db';
import { emotionAnalyses, journalEntries } from '@/db/schema';
import type { EmotionAnalysis } from '@/db/schema';
import type { ActionResult } from '@/lib/types';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { analyzeEmotion } from '@/lib/ai/analyze-emotion';
import { summarizeJournal } from '@/lib/ai/summarize';

export async function analyzeJournalEmotion(
  journalId: string,
  content: string
): Promise<ActionResult<EmotionAnalysis>> {
  try {
    // Step 1: Content length validation (handled by analyzeEmotion)
    // Step 2: AI emotion analysis
    const emotionResult = await analyzeEmotion(content);

    // Step 3: Validate emotion score is 1-10
    if (emotionResult.emotionScore < 1 || emotionResult.emotionScore > 10) {
      throw new Error('감정 점수가 유효하지 않습니다 (1-10 범위)');
    }

    // Step 4: Generate summary
    const summary = await summarizeJournal(content);

    // Step 5: Check if emotion analysis already exists (UPSERT)
    const existing = await db.query.emotionAnalyses.findFirst({
      where: eq(emotionAnalyses.journalId, journalId),
    });

    let analysis: EmotionAnalysis;

    if (existing) {
      // Update existing analysis
      const [updated] = await db
        .update(emotionAnalyses)
        .set({
          primaryEmotion: emotionResult.primaryEmotion,
          emotionScore: emotionResult.emotionScore,
          emotions: emotionResult.emotions,
          keywords: emotionResult.keywords,
          analyzedAt: new Date(),
        })
        .where(eq(emotionAnalyses.journalId, journalId))
        .returning();

      analysis = updated;
    } else {
      // Insert new analysis
      const [inserted] = await db
        .insert(emotionAnalyses)
        .values({
          journalId,
          primaryEmotion: emotionResult.primaryEmotion,
          emotionScore: emotionResult.emotionScore,
          emotions: emotionResult.emotions,
          keywords: emotionResult.keywords,
        })
        .returning();

      analysis = inserted;
    }

    // Step 6: Update journal summary
    await db
      .update(journalEntries)
      .set({ summary })
      .where(eq(journalEntries.id, journalId));

    revalidatePath('/');
    return { success: true, data: analysis };
  } catch (error) {
    console.error('Analyze journal emotion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '감정 분석에 실패했습니다.',
    };
  }
}

export async function getEmotionByJournal(
  journalId: string
): Promise<EmotionAnalysis | null> {
  try {
    const emotion = await db.query.emotionAnalyses.findFirst({
      where: eq(emotionAnalyses.journalId, journalId),
    });

    return emotion || null;
  } catch (error) {
    console.error('Get emotion by journal error:', error);
    return null;
  }
}
