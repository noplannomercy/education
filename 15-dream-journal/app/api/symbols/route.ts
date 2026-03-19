import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dreams, symbols } from '@/lib/db/schema'
import { extractSymbols } from '@/lib/ai/functions'
import { handleError } from '@/lib/error-handler'
import { NotFoundError } from '@/lib/errors'
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

    // Check if symbols already exist for this dream
    const existingSymbols = await db
      .select()
      .from(symbols)
      .where(eq(symbols.dreamId, dreamId))

    if (existingSymbols.length > 0) {
      return NextResponse.json({ symbols: existingSymbols })
    }

    // Call AI to extract symbols
    logger.info('Calling AI to extract symbols', { dreamId })
    const extractedSymbols = await extractSymbols(dream.content)

    // Save symbols to database
    const newSymbols = await db
      .insert(symbols)
      .values(
        extractedSymbols.map((s) => ({
          dreamId,
          symbol: s.symbol,
          category: s.category,
          meaning: s.meaning,
          frequency: 1,
        }))
      )
      .returning()

    logger.info('Symbols extracted and saved successfully', {
      dreamId,
      count: newSymbols.length,
    })

    return NextResponse.json({ symbols: newSymbols })
  } catch (error) {
    return handleError(error)
  }
}
