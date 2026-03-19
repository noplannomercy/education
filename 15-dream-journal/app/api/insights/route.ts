import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dreams } from '@/lib/db/schema'
import { generateWeeklyInsight } from '@/lib/ai/functions'
import { handleError } from '@/lib/error-handler'
import { ValidationError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { gte, desc } from 'drizzle-orm'

export async function POST(req: Request) {
  try {
    // Get dreams from the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const weeklyDreams = await db
      .select()
      .from(dreams)
      .where(gte(dreams.date, sevenDaysAgo.toISOString().split('T')[0]))
      .orderBy(desc(dreams.date))

    if (weeklyDreams.length === 0) {
      throw new ValidationError(
        '주간 인사이트를 생성하려면 최근 7일 내의 꿈 기록이 필요합니다'
      )
    }

    // Call AI to generate weekly insight
    logger.info('Calling AI to generate weekly insight', {
      count: weeklyDreams.length,
    })
    const insight = await generateWeeklyInsight(weeklyDreams)

    logger.info('Weekly insight generated successfully')

    return NextResponse.json({ insight })
  } catch (error) {
    return handleError(error)
  }
}
