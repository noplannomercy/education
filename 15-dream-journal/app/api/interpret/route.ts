import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dreams, interpretations } from '@/lib/db/schema'
import { interpretDream } from '@/lib/ai/functions'
import { handleError } from '@/lib/error-handler'
import { ValidationError, NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const requestSchema = z.object({
  dreamId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { dreamId } = requestSchema.parse(body)

    // Fetch the dream
    const [dream] = await db
      .select()
      .from(dreams)
      .where(eq(dreams.id, dreamId))
      .limit(1)

    if (!dream) {
      throw new NotFoundError('꿈 기록을 찾을 수 없습니다')
    }

    // Check if interpretation already exists
    const [existingInterpretation] = await db
      .select()
      .from(interpretations)
      .where(eq(interpretations.dreamId, dreamId))
      .limit(1)

    if (existingInterpretation) {
      return NextResponse.json({ interpretation: existingInterpretation })
    }

    // Call AI to interpret the dream
    logger.info('Calling AI to interpret dream', { dreamId })
    const result = await interpretDream(
      dream.content,
      dream.emotion,
      dream.vividness
    )

    // Save interpretation to database
    const [newInterpretation] = await db
      .insert(interpretations)
      .values({
        dreamId,
        interpretation: result.interpretation,
        psychological: result.psychological,
        symbolic: result.symbolic,
        message: result.message,
      })
      .returning()

    logger.info('Dream interpretation saved successfully', { dreamId })

    return NextResponse.json({
      interpretation: newInterpretation,
    })
  } catch (error) {
    return handleError(error)
  }
}
