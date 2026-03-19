'use server';

import { db } from '@/db';
import { reviewSchedules } from '@/db/schema';
import { eq, lte, isNull, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { addDays } from 'date-fns';

// Spaced repetition intervals (in days)
const BASE_INTERVALS = [1, 3, 7, 14, 30, 60, 90];

function calculateNextReviewDate(comprehension: number, repetitionCount: number): Date {
  // Get base interval
  const baseInterval = BASE_INTERVALS[Math.min(repetitionCount, BASE_INTERVALS.length - 1)];

  // Apply comprehension multiplier
  let multiplier = 1.0;
  if (comprehension >= 4) {
    multiplier = 1.5; // Good comprehension: extend interval
  } else if (comprehension <= 2) {
    multiplier = 0.5; // Poor comprehension: shorten interval
  }

  const adjustedInterval = Math.round(baseInterval * multiplier);
  return addDays(new Date(), adjustedInterval);
}

export async function getUpcomingReviews() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const reviews = await db.query.reviewSchedules.findMany({
      where: (reviewSchedules, { lte, isNull, and }) =>
        and(
          lte(reviewSchedules.nextReviewDate, today),
          isNull(reviewSchedules.completedAt)
        ),
      with: {
        session: {
          with: {
            subject: true,
          },
        },
      },
    });

    return { success: true, data: reviews };
  } catch (error) {
    console.error('Failed to fetch upcoming reviews:', error);
    return { success: false, error: 'Failed to fetch upcoming reviews' };
  }
}

export async function completeReview(reviewId: number, newComprehension: number) {
  try {
    // Get current review
    const [currentReview] = await db
      .select()
      .from(reviewSchedules)
      .where(eq(reviewSchedules.id, reviewId));

    if (!currentReview) {
      return { success: false, error: 'Review not found' };
    }

    if (currentReview.completedAt) {
      return { success: false, error: 'Review already completed' };
    }

    // Mark current review as completed
    await db
      .update(reviewSchedules)
      .set({
        completedAt: new Date(),
        comprehension: newComprehension,
      })
      .where(eq(reviewSchedules.id, reviewId));

    // Create next review schedule
    const nextRepetitionCount = currentReview.repetitionCount + 1;
    const nextReviewDate = calculateNextReviewDate(newComprehension, nextRepetitionCount);

    // Only create next review if not at max repetitions
    if (nextRepetitionCount < BASE_INTERVALS.length) {
      await db.insert(reviewSchedules).values({
        sessionId: currentReview.sessionId,
        nextReviewDate: nextReviewDate.toISOString().split('T')[0],
        repetitionCount: nextRepetitionCount,
        comprehension: newComprehension,
      });
    }

    revalidatePath('/');
    return { success: true, data: { nextReviewDate, repetitionCount: nextRepetitionCount } };
  } catch (error) {
    console.error('Failed to complete review:', error);
    return { success: false, error: 'Failed to complete review' };
  }
}

export async function getReviewsBySession(sessionId: number) {
  try {
    const reviews = await db
      .select()
      .from(reviewSchedules)
      .where(eq(reviewSchedules.sessionId, sessionId));

    return { success: true, data: reviews };
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return { success: false, error: 'Failed to fetch reviews' };
  }
}
