import { NextRequest, NextResponse } from 'next/server';
import { generateAITextWithRetry } from '@/lib/ai/openrouter';
import { generateStudyMethodPrompt } from '@/lib/ai/prompts';
import { db } from '@/db';
import { studySessions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const methodRequestSchema = z.object({
  subjectId: z.number(),
  subjectName: z.string().min(1),
  limit: z.number().min(1).max(20).optional().default(10),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = methodRequestSchema.parse(body);

    // Fetch recent sessions
    const recentSessions = await db
      .select({
        durationMinutes: studySessions.durationMinutes,
        comprehension: studySessions.comprehension,
        notes: studySessions.notes,
      })
      .from(studySessions)
      .where(eq(studySessions.subjectId, validatedData.subjectId))
      .orderBy(desc(studySessions.studiedAt))
      .limit(validatedData.limit);

    if (recentSessions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No study sessions found for this subject' },
        { status: 404 }
      );
    }

    // Generate AI method recommendations
    const prompt = generateStudyMethodPrompt(
      validatedData.subjectName,
      recentSessions.map(s => ({
        durationMinutes: s.durationMinutes,
        comprehension: s.comprehension,
        notes: s.notes || undefined,
      }))
    );

    const recommendations = await generateAITextWithRetry(prompt);

    return NextResponse.json({
      success: true,
      data: {
        subjectId: validatedData.subjectId,
        sessionsAnalyzed: recentSessions.length,
        recommendations,
      },
    });
  } catch (error) {
    console.error('Method recommendation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate method recommendations' },
      { status: 500 }
    );
  }
}
