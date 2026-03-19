import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dreams, patterns } from '@/lib/db/schema'
import { detectPatterns } from '@/lib/ai/functions'
import { handleError } from '@/lib/error-handler'
import { ValidationError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { desc } from 'drizzle-orm'

export async function POST(req: Request) {
  try {
    // Get recent dreams (last 20)
    const recentDreams = await db
      .select()
      .from(dreams)
      .orderBy(desc(dreams.date))
      .limit(20)

    if (recentDreams.length < 3) {
      throw new ValidationError(
        '패턴 분석을 위해서는 최소 3개 이상의 꿈 기록이 필요합니다'
      )
    }

    // Call AI to detect patterns
    logger.info('Calling AI to detect patterns', { count: recentDreams.length })
    const detectedPatterns = await detectPatterns(recentDreams)

    // Save patterns to database
    const newPatterns = []
    for (const pattern of detectedPatterns) {
      const dreamIds = recentDreams.slice(0, pattern.occurrences).map((d) => d.id)

      const [savedPattern] = await db
        .insert(patterns)
        .values({
          type: pattern.type,
          name: pattern.name,
          description: pattern.description,
          occurrences: pattern.occurrences,
          dreamIds,
          significance: pattern.significance,
        })
        .returning()

      newPatterns.push(savedPattern)
    }

    logger.info('Patterns detected and saved successfully', {
      count: newPatterns.length,
    })

    return NextResponse.json({ patterns: newPatterns })
  } catch (error) {
    return handleError(error)
  }
}

// GET: Fetch all existing patterns
export async function GET() {
  try {
    const allPatterns = await db
      .select()
      .from(patterns)
      .orderBy(desc(patterns.updatedAt))

    return NextResponse.json({ patterns: allPatterns })
  } catch (error) {
    return handleError(error)
  }
}
