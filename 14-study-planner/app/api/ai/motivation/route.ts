import { NextRequest, NextResponse } from 'next/server';
import { generateAITextWithRetry } from '@/lib/ai/openrouter';
import { generateMotivationPrompt } from '@/lib/ai/prompts';
import { db } from '@/db';
import { studySessions, motivations } from '@/db/schema';
import { gte, desc } from 'drizzle-orm';
import { z } from 'zod';

const motivationRequestSchema = z.object({
  userName: z.string().optional().default('Student'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = motivationRequestSchema.parse(body);

    // Get sessions from the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentSessions = await db
      .select({
        durationMinutes: studySessions.durationMinutes,
        comprehension: studySessions.comprehension,
      })
      .from(studySessions)
      .where(gte(studySessions.studiedAt, oneWeekAgo));

    // Calculate stats
    const sessionsThisWeek = recentSessions.length;
    const totalMinutesThisWeek = recentSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const avgComprehension = sessionsThisWeek > 0
      ? recentSessions.reduce((sum, s) => sum + s.comprehension, 0) / sessionsThisWeek
      : 0;

    // Generate AI motivation message
    const prompt = generateMotivationPrompt(validatedData.userName, {
      sessionsThisWeek,
      totalMinutesThisWeek,
      avgComprehension,
    });

    const aiMessage = await generateAITextWithRetry(prompt);

    // Save to database
    const [savedMotivation] = await db.insert(motivations).values({
      aiMessage,
    }).returning();

    return NextResponse.json({
      success: true,
      data: {
        ...savedMotivation,
        stats: {
          sessionsThisWeek,
          totalMinutesThisWeek,
          avgComprehension: parseFloat(avgComprehension.toFixed(2)),
        },
      },
    });
  } catch (error) {
    console.error('Motivation generation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate motivation message' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get the most recent motivation message
    const [latestMotivation] = await db
      .select()
      .from(motivations)
      .orderBy(desc(motivations.createdAt))
      .limit(1);

    if (!latestMotivation) {
      return NextResponse.json(
        { success: false, error: 'No motivation messages found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: latestMotivation,
    });
  } catch (error) {
    console.error('Failed to fetch motivation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch motivation message' },
      { status: 500 }
    );
  }
}
