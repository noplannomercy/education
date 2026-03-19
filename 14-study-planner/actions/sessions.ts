'use server';

import { db } from '@/db';
import { studySessions, reviewSchedules, type NewStudySession, type NewReviewSchedule } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
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

export async function getStudySessions(subjectId?: number) {
  try {
    let query = db.select().from(studySessions).orderBy(desc(studySessions.studiedAt));

    if (subjectId) {
      query = query.where(eq(studySessions.subjectId, subjectId)) as typeof query;
    }

    const sessions = await query;
    return { success: true, data: sessions };
  } catch (error) {
    console.error('Failed to fetch study sessions:', error);
    return { success: false, error: 'Failed to fetch study sessions' };
  }
}

export async function getStudySessionById(id: number) {
  try {
    const [session] = await db.select().from(studySessions).where(eq(studySessions.id, id));
    if (!session) {
      return { success: false, error: 'Study session not found' };
    }
    return { success: true, data: session };
  } catch (error) {
    console.error('Failed to fetch study session:', error);
    return { success: false, error: 'Failed to fetch study session' };
  }
}

export async function createStudySession(data: NewStudySession) {
  try {
    // Create study session
    const [newSession] = await db.insert(studySessions).values(data).returning();

    // Create initial review schedule (set to today so it appears immediately)
    const today = new Date();
    const reviewSchedule: NewReviewSchedule = {
      sessionId: newSession.id,
      nextReviewDate: today.toISOString().split('T')[0], // Format as YYYY-MM-DD
      repetitionCount: 0,
      comprehension: data.comprehension,
    };

    await db.insert(reviewSchedules).values(reviewSchedule);

    revalidatePath('/');
    return { success: true, data: newSession };
  } catch (error) {
    console.error('Failed to create study session:', error);
    return { success: false, error: 'Failed to create study session' };
  }
}

export async function updateStudySession(id: number, data: Partial<NewStudySession>) {
  try {
    const [updatedSession] = await db
      .update(studySessions)
      .set(data)
      .where(eq(studySessions.id, id))
      .returning();

    if (!updatedSession) {
      return { success: false, error: 'Study session not found' };
    }

    revalidatePath('/');
    return { success: true, data: updatedSession };
  } catch (error) {
    console.error('Failed to update study session:', error);
    return { success: false, error: 'Failed to update study session' };
  }
}

export async function deleteStudySession(id: number) {
  try {
    const [deletedSession] = await db
      .delete(studySessions)
      .where(eq(studySessions.id, id))
      .returning();

    if (!deletedSession) {
      return { success: false, error: 'Study session not found' };
    }

    revalidatePath('/');
    return { success: true, data: deletedSession };
  } catch (error) {
    console.error('Failed to delete study session:', error);
    return { success: false, error: 'Failed to delete study session' };
  }
}
