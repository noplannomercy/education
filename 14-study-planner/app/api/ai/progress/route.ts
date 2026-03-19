import { NextRequest, NextResponse } from 'next/server';
import { generateAITextWithRetry } from '@/lib/ai/openrouter';
import { generateProgressAnalysisPrompt } from '@/lib/ai/prompts';
import { db } from '@/db';
import { studySessions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const progressRequestSchema = z.object({
  subjectId: z.number(),
  subjectName: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = progressRequestSchema.parse(body);

    // Fetch all sessions for the subject
    const sessions = await db
      .select({
        durationMinutes: studySessions.durationMinutes,
        comprehension: studySessions.comprehension,
        studiedAt: studySessions.studiedAt,
      })
      .from(studySessions)
      .where(eq(studySessions.subjectId, validatedData.subjectId))
      .orderBy(desc(studySessions.studiedAt));

    if (sessions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No study sessions found for this subject' },
        { status: 404 }
      );
    }

    // Generate AI progress analysis
    const prompt = generateProgressAnalysisPrompt(
      validatedData.subjectName,
      sessions.map(s => ({
        durationMinutes: s.durationMinutes,
        comprehension: s.comprehension,
        studiedAt: s.studiedAt,
      }))
    );

    const analysis = await generateAITextWithRetry(prompt);

    // Calculate basic stats
    const totalTime = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const avgComprehension = sessions.reduce((sum, s) => sum + s.comprehension, 0) / sessions.length;

    return NextResponse.json({
      success: true,
      data: {
        subjectId: validatedData.subjectId,
        stats: {
          totalSessions: sessions.length,
          totalMinutes: totalTime,
          avgComprehension: parseFloat(avgComprehension.toFixed(2)),
        },
        analysis,
      },
    });
  } catch (error) {
    console.error('Progress analysis error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate progress analysis' },
      { status: 500 }
    );
  }
}
