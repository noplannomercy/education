'use server';

import { db } from '@/db';
import { journalEntries, weeklyInsights, emotionAnalyses } from '@/db/schema';
import { and, gte, lte, eq, desc } from 'drizzle-orm';
import { generateWeeklyInsight } from '@/lib/ai/weekly-insight';
import type { ActionResult } from '@/lib/types';
import type { WeeklyInsight } from '@/db/schema';

/**
 * Generate weekly insight for a date range
 */
export async function generateWeeklyInsightAction(
  weekStart: string,
  weekEnd: string
): Promise<ActionResult<WeeklyInsight>> {
  try {
    // Get journals for the week
    const journals = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          gte(journalEntries.date, weekStart),
          lte(journalEntries.date, weekEnd)
        )
      )
      .orderBy(journalEntries.date);

    // Edge Case: No journals
    if (journals.length === 0) {
      return {
        success: false,
        error: '이번 주 작성된 일기가 없습니다',
      };
    }

    // Generate insight using AI
    const insightText = await generateWeeklyInsight(journals);

    // Calculate emotion summary
    const emotionResults = await db
      .select({
        primaryEmotion: emotionAnalyses.primaryEmotion,
        emotionScore: emotionAnalyses.emotionScore,
      })
      .from(emotionAnalyses)
      .innerJoin(journalEntries, eq(emotionAnalyses.journalId, journalEntries.id))
      .where(
        and(
          gte(journalEntries.date, weekStart),
          lte(journalEntries.date, weekEnd)
        )
      );

    // Calculate emotion summary
    const emotionCounts: Record<string, number> = {};
    let totalScore = 0;

    for (const result of emotionResults) {
      emotionCounts[result.primaryEmotion] = (emotionCounts[result.primaryEmotion] || 0) + 1;
      totalScore += result.emotionScore;
    }

    const averageScore = emotionResults.length > 0 ? totalScore / emotionResults.length : 0;
    const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '없음';

    const emotionSummary = {
      averageScore: Math.round(averageScore * 10) / 10,
      dominantEmotion,
      emotionCounts,
    };

    // UPSERT weekly insight
    const existingInsight = await db
      .select()
      .from(weeklyInsights)
      .where(
        and(
          eq(weeklyInsights.weekStart, weekStart),
          eq(weeklyInsights.weekEnd, weekEnd)
        )
      )
      .limit(1);

    let insight: WeeklyInsight;

    if (existingInsight.length > 0) {
      // Update existing
      const [updated] = await db
        .update(weeklyInsights)
        .set({
          insight: insightText,
          emotionSummary,
          createdAt: new Date(),
        })
        .where(eq(weeklyInsights.id, existingInsight[0].id))
        .returning();

      insight = updated;
    } else {
      // Insert new
      const [created] = await db
        .insert(weeklyInsights)
        .values({
          weekStart,
          weekEnd,
          insight: insightText,
          emotionSummary,
        })
        .returning();

      insight = created;
    }

    return {
      success: true,
      data: insight,
    };
  } catch (error) {
    console.error('Generate weekly insight error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '주간 인사이트 생성에 실패했습니다',
    };
  }
}

/**
 * Get weekly insight for a date range
 */
export async function getWeeklyInsight(
  weekStart: string,
  weekEnd: string
): Promise<WeeklyInsight | null> {
  const results = await db
    .select()
    .from(weeklyInsights)
    .where(
      and(
        eq(weeklyInsights.weekStart, weekStart),
        eq(weeklyInsights.weekEnd, weekEnd)
      )
    )
    .limit(1);

  return results[0] || null;
}

/**
 * Get recent insights
 */
export async function getRecentInsights(limit: number = 5): Promise<WeeklyInsight[]> {
  const results = await db
    .select()
    .from(weeklyInsights)
    .orderBy(desc(weeklyInsights.weekStart))
    .limit(limit);

  return results;
}
