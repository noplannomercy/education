import { NextRequest, NextResponse } from 'next/server';
import { generateAITextWithRetry } from '@/lib/ai/openrouter';
import { generateLearningPlanPrompt } from '@/lib/ai/prompts';
import { db } from '@/db';
import { learningPlans } from '@/db/schema';
import { z } from 'zod';

const planRequestSchema = z.object({
  subjectId: z.number(),
  subjectName: z.string().min(1),
  studyGoal: z.string().min(1),
  weeksAvailable: z.number().min(1).max(52),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = planRequestSchema.parse(body);

    // Generate AI learning plan
    const prompt = generateLearningPlanPrompt(
      validatedData.subjectName,
      validatedData.studyGoal,
      validatedData.weeksAvailable
    );

    const aiPlan = await generateAITextWithRetry(prompt);

    // Save to database
    const [savedPlan] = await db.insert(learningPlans).values({
      subjectId: validatedData.subjectId,
      studyGoal: validatedData.studyGoal,
      weeksAvailable: validatedData.weeksAvailable,
      aiPlan,
      status: 'active',
    }).returning();

    return NextResponse.json({
      success: true,
      data: savedPlan,
    });
  } catch (error) {
    console.error('Plan generation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate learning plan' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json(
        { success: false, error: 'subjectId is required' },
        { status: 400 }
      );
    }

    const plans = await db.query.learningPlans.findMany({
      where: (plans, { eq }) => eq(plans.subjectId, parseInt(subjectId)),
      orderBy: (plans, { desc }) => [desc(plans.createdAt)],
    });

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Failed to fetch plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch learning plans' },
      { status: 500 }
    );
  }
}
