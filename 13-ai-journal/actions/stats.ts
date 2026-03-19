'use server';

import { db } from '@/db';
import { journalEntries, emotionAnalyses, journalTags, tags } from '@/db/schema';
import { and, gte, lte, eq, desc, count } from 'drizzle-orm';

export interface MonthlyWritingStats {
  daysWritten: number;
  currentStreak: number;
  totalJournals: number;
  averageEmotionScore: number;
}

export interface EmotionDistribution {
  emotion: string;
  count: number;
}

export interface EmotionTrend {
  date: string;
  score: number;
}

export interface TagUsageStats {
  tag: string;
  count: number;
  color: string;
}

/**
 * Get monthly writing statistics
 */
export async function getMonthlyWritingStats(
  year: number,
  month: number
): Promise<MonthlyWritingStats> {
  // Calculate date range for the month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  // Get journals for the month
  const journals = await db
    .select()
    .from(journalEntries)
    .where(
      and(
        gte(journalEntries.date, startDate),
        lte(journalEntries.date, endDate)
      )
    )
    .orderBy(journalEntries.date);

  // Days written
  const daysWritten = journals.length;

  // Calculate current streak (consecutive days from today backwards)
  let currentStreak = 0;
  if (journals.length > 0) {
    const sortedDates = journals.map(j => j.date).sort().reverse();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let checkDate = new Date(todayStr);
    for (const dateStr of sortedDates) {
      const journalDate = dateStr;
      const checkDateStr = checkDate.toISOString().split('T')[0];

      if (journalDate === checkDateStr) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (journalDate < checkDateStr) {
        // Check if there's a gap
        const dayDiff = Math.floor((checkDate.getTime() - new Date(journalDate).getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff > 1) {
          break; // Streak broken
        }
        checkDate = new Date(journalDate);
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
  }

  // Total journals (all time)
  const totalResult = await db
    .select({ count: count() })
    .from(journalEntries);
  const totalJournals = totalResult[0]?.count || 0;

  // Average emotion score
  const emotionScores = await db
    .select({ score: emotionAnalyses.emotionScore })
    .from(emotionAnalyses)
    .innerJoin(journalEntries, eq(emotionAnalyses.journalId, journalEntries.id))
    .where(
      and(
        gte(journalEntries.date, startDate),
        lte(journalEntries.date, endDate)
      )
    );

  const averageEmotionScore = emotionScores.length > 0
    ? emotionScores.reduce((sum, e) => sum + e.score, 0) / emotionScores.length
    : 0;

  return {
    daysWritten,
    currentStreak,
    totalJournals,
    averageEmotionScore: Math.round(averageEmotionScore * 10) / 10,
  };
}

/**
 * Get emotion distribution for date range (for Pie Chart)
 */
export async function getEmotionDistribution(
  startDate: string,
  endDate: string
): Promise<EmotionDistribution[]> {
  const results = await db
    .select({
      emotion: emotionAnalyses.primaryEmotion,
      count: count(),
    })
    .from(emotionAnalyses)
    .innerJoin(journalEntries, eq(emotionAnalyses.journalId, journalEntries.id))
    .where(
      and(
        gte(journalEntries.date, startDate),
        lte(journalEntries.date, endDate)
      )
    )
    .groupBy(emotionAnalyses.primaryEmotion)
    .orderBy(desc(count()));

  return results.map(r => ({
    emotion: r.emotion,
    count: Number(r.count),
  }));
}

/**
 * Get emotion trend over time (for Line Chart)
 */
export async function getEmotionTrend(
  startDate: string,
  endDate: string
): Promise<EmotionTrend[]> {
  const results = await db
    .select({
      date: journalEntries.date,
      score: emotionAnalyses.emotionScore,
    })
    .from(emotionAnalyses)
    .innerJoin(journalEntries, eq(emotionAnalyses.journalId, journalEntries.id))
    .where(
      and(
        gte(journalEntries.date, startDate),
        lte(journalEntries.date, endDate)
      )
    )
    .orderBy(journalEntries.date);

  return results.map(r => ({
    date: r.date,
    score: r.score,
  }));
}

/**
 * Get tag usage statistics
 */
export async function getTagUsageStats(): Promise<TagUsageStats[]> {
  const results = await db
    .select({
      tagId: journalTags.tagId,
      count: count(),
    })
    .from(journalTags)
    .groupBy(journalTags.tagId)
    .orderBy(desc(count()));

  // Get tag details
  const tagDetails = await db
    .select()
    .from(tags);

  const tagMap = new Map(tagDetails.map(t => [t.id, { name: t.name, color: t.color }]));

  return results.map(r => ({
    tag: tagMap.get(r.tagId)?.name || 'Unknown',
    count: Number(r.count),
    color: tagMap.get(r.tagId)?.color || '#3B82F6',
  }));
}
