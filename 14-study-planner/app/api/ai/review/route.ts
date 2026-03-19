import { NextRequest, NextResponse } from 'next/server';
import { generateAITextWithRetry } from '@/lib/ai/openrouter';
import { generateReviewSchedulePrompt } from '@/lib/ai/prompts';
import { z } from 'zod';

const reviewRequestSchema = z.object({
  sessionId: z.number(),
  subjectName: z.string().min(1),
  durationMinutes: z.number().min(1),
  comprehension: z.number().min(1).max(5),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = reviewRequestSchema.parse(body);

    // Generate AI review recommendations
    const prompt = generateReviewSchedulePrompt({
      subjectName: validatedData.subjectName,
      durationMinutes: validatedData.durationMinutes,
      comprehension: validatedData.comprehension,
      notes: validatedData.notes,
    });

    const recommendations = await generateAITextWithRetry(prompt);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: validatedData.sessionId,
        recommendations,
      },
    });
  } catch (error) {
    console.error('Review recommendation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate review recommendations' },
      { status: 500 }
    );
  }
}
