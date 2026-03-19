/**
 * Test Data Seeding Script
 * Run with: npx tsx scripts/seed-test-data.ts
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { subjects, studySessions, reviewSchedules } from '../db/schema';
import { lte, isNull, and } from 'drizzle-orm';
import { addDays } from 'date-fns';

// Load environment variables
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

// Spaced repetition intervals
const BASE_INTERVALS = [1, 3, 7, 14, 30, 60, 90];

function calculateNextReviewDate(comprehension: number, repetitionCount: number): string {
  const baseInterval = BASE_INTERVALS[Math.min(repetitionCount, BASE_INTERVALS.length - 1)];
  let multiplier = 1.0;
  if (comprehension >= 4) {
    multiplier = 1.5;
  } else if (comprehension <= 2) {
    multiplier = 0.5;
  }
  const adjustedInterval = Math.round(baseInterval * multiplier);
  return addDays(new Date(), adjustedInterval).toISOString().split('T')[0];
}

async function seed() {
  console.log('🌱 Seeding test data...\n');

  try {
    // 1. Create test subjects
    console.log('Creating subjects...');
    const testSubjects = [
      { name: 'Mathematics', color: '#3b82f6' },
      { name: 'Physics', color: '#10b981' },
      { name: 'Computer Science', color: '#f59e0b' },
      { name: 'English', color: '#ef4444' },
    ];

    const createdSubjects = [];
    for (const subject of testSubjects) {
      const [created] = await db.insert(subjects).values(subject).returning();
      createdSubjects.push(created);
      console.log(`  ✓ Created: ${created.name} (ID: ${created.id})`);
    }

    // 2. Create test study sessions (past 14 days)
    console.log('\nCreating study sessions...');
    const sessionCount = 20;
    let totalMinutes = 0;

    for (let i = 0; i < sessionCount; i++) {
      const subject = createdSubjects[Math.floor(Math.random() * createdSubjects.length)];
      const daysAgo = Math.floor(Math.random() * 14);
      const studiedAt = new Date();
      studiedAt.setDate(studiedAt.getDate() - daysAgo);
      studiedAt.setHours(9 + Math.floor(Math.random() * 10), 0, 0, 0);

      const durationMinutes = 30 + Math.floor(Math.random() * 90); // 30-120 minutes
      const comprehension = 1 + Math.floor(Math.random() * 5); // 1-5
      totalMinutes += durationMinutes;

      const notes = comprehension >= 4
        ? 'Good understanding, key concepts clear'
        : comprehension <= 2
        ? 'Need more practice, some confusion'
        : 'Average understanding';

      const [session] = await db.insert(studySessions).values({
        subjectId: subject.id,
        durationMinutes,
        comprehension,
        notes,
        studiedAt,
      }).returning();

      // Create review schedule
      const nextReviewDate = calculateNextReviewDate(comprehension, 0);
      await db.insert(reviewSchedules).values({
        sessionId: session.id,
        nextReviewDate,
        repetitionCount: 0,
        comprehension,
      });

      console.log(`  ✓ Session ${i + 1}: ${subject.name} - ${durationMinutes}min, Comprehension: ${comprehension}/5`);
    }

    // 3. Print statistics
    console.log('\n📊 Test Data Summary:');
    console.log(`  Subjects: ${createdSubjects.length}`);
    console.log(`  Study Sessions: ${sessionCount}`);
    console.log(`  Total Study Time: ${totalMinutes} minutes (${(totalMinutes / 60).toFixed(1)} hours)`);
    console.log(`  Average Session: ${(totalMinutes / sessionCount).toFixed(0)} minutes`);

    // Get today's reviews
    const today = new Date().toISOString().split('T')[0];
    const todayReviews = await db
      .select()
      .from(reviewSchedules)
      .where(
        and(
          lte(reviewSchedules.nextReviewDate, today),
          isNull(reviewSchedules.completedAt)
        )
      );

    console.log(`  Today's Reviews: ${todayReviews.length}`);

    console.log('\n✅ Seeding complete!\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed();
