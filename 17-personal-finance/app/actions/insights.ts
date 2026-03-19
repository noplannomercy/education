'use server'

import { generateText } from 'ai'
import { db } from '@/lib/db'
import { aiInsights, transactions, categories } from '@/lib/db/schema'
import { model, AI_CONFIG } from '@/lib/ai/config'
import { cleanAIResponse, callWithRetry } from '@/lib/ai/utils'
import {
  spendingAnalysisSchema,
  budgetSuggestionSchema,
  categorySuggestionSchema,
  anomalyReportSchema,
  savingsAdviceSchema,
  type SpendingAnalysis,
  type BudgetSuggestion,
  type CategorySuggestion,
  type AnomalyReport,
  type SavingsAdvice,
} from '@/lib/ai/schemas'
import {
  buildSpendingAnalysisPrompt,
  buildBudgetSuggestionPrompt,
  buildCategorizationPrompt,
  buildAnomalyDetectionPrompt,
  buildSavingsAdvicePrompt,
} from '@/lib/ai/prompts'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

type ActionResult<T> = { success: boolean; data?: T; error?: string }

// ========== 지출 분석 ==========
export async function analyzeSpending(
  month: string
): Promise<ActionResult<SpendingAnalysis>> {
  try {
    const startDate = `${month}-01`
    const endDate = `${month}-31`

    // 거래 조회
    const txList = await db
      .select()
      .from(transactions)
      .where(and(gte(transactions.date, startDate), lte(transactions.date, endDate)))
      .orderBy(desc(transactions.date))

    // 거래 없으면 에러
    if (txList.length === 0) {
      return { success: false, error: '분석할 거래 내역이 없습니다' }
    }

    // 월간 통계 계산
    const income = txList
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expense = txList
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const byCategory = txList
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
        return acc
      }, {} as Record<string, number>)

    const stats = { income, expense, byCategory }
    const transactionData = txList.map((t) => ({
      date: t.date,
      category: t.category,
      description: t.description,
      amount: Number(t.amount),
      type: t.type as 'income' | 'expense',
    }))

    const prompt = buildSpendingAnalysisPrompt(transactionData, stats)

    // AI 호출
    const result = await callWithRetry(
      async () =>
        generateText({
          model,
          prompt,
          maxOutputTokens: AI_CONFIG.maxOutputTokens,
        }),
      AI_CONFIG.retries,
      AI_CONFIG.retryDelay,
      AI_CONFIG.timeout
    )

    // 응답 파싱
    const parsed = cleanAIResponse(result.text, spendingAnalysisSchema)

    // DB 저장
    await db.insert(aiInsights).values({
      type: 'spending_pattern',
      title: `${month} 지출 분석`,
      content: JSON.stringify(parsed),
      metadata: { month, stats },
      month,
    })

    revalidatePath('/')
    return { success: true, data: parsed }
  } catch (error) {
    console.error('analyzeSpending error:', error)
    const message = (error as Error).message || ''
    if (message.includes('rate limit')) {
      return { success: false, error: 'API 한도 초과. 잠시 후 다시 시도해주세요.' }
    }
    return { success: false, error: 'AI 분석에 실패했습니다' }
  }
}

// ========== 예산 제안 ==========
export async function suggestBudget(
  income: number,
  month: string
): Promise<ActionResult<BudgetSuggestion>> {
  try {
    // 카테고리 목록 조회
    const categoryList = await db.select().from(categories)
    const categoryNames = categoryList.map((c) => c.name)

    if (categoryNames.length === 0) {
      return { success: false, error: '카테고리를 먼저 등록해주세요' }
    }

    // 과거 지출 조회 (이전 달)
    const prevMonth = getPreviousMonth(month)
    const prevStartDate = `${prevMonth}-01`
    const prevEndDate = `${prevMonth}-31`

    const prevTxList = await db
      .select()
      .from(transactions)
      .where(
        and(
          gte(transactions.date, prevStartDate),
          lte(transactions.date, prevEndDate),
          eq(transactions.type, 'expense')
        )
      )

    let historicalStats
    if (prevTxList.length > 0) {
      const expense = prevTxList.reduce((sum, t) => sum + Number(t.amount), 0)
      const byCategory = prevTxList.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
        return acc
      }, {} as Record<string, number>)
      historicalStats = { income: 0, expense, byCategory }
    }

    const prompt = buildBudgetSuggestionPrompt(income, categoryNames, historicalStats)

    // AI 호출
    const result = await callWithRetry(
      async () =>
        generateText({
          model,
          prompt,
          maxOutputTokens: AI_CONFIG.maxOutputTokens,
        }),
      AI_CONFIG.retries,
      AI_CONFIG.retryDelay,
      AI_CONFIG.timeout
    )

    // 응답 파싱
    const parsed = cleanAIResponse(result.text, budgetSuggestionSchema)

    // DB 저장
    await db.insert(aiInsights).values({
      type: 'budget_suggestion',
      title: `${month} 예산 제안`,
      content: JSON.stringify(parsed),
      metadata: { month, income },
      month,
    })

    revalidatePath('/')
    return { success: true, data: parsed }
  } catch (error) {
    console.error('suggestBudget error:', error)
    const message = (error as Error).message || ''
    if (message.includes('rate limit')) {
      return { success: false, error: 'API 한도 초과. 잠시 후 다시 시도해주세요.' }
    }
    return { success: false, error: '예산 제안에 실패했습니다' }
  }
}

// ========== 카테고리 분류 ==========
export async function categorizeTransaction(
  description: string
): Promise<ActionResult<CategorySuggestion>> {
  try {
    // 카테고리 목록 조회
    const categoryList = await db.select().from(categories)
    const categoryNames = categoryList.map((c) => c.name)

    if (categoryNames.length === 0) {
      return { success: false, error: '카테고리를 먼저 등록해주세요' }
    }

    const prompt = buildCategorizationPrompt(description, categoryNames)

    // AI 호출
    const result = await callWithRetry(
      async () =>
        generateText({
          model,
          prompt,
          maxOutputTokens: 500,
        }),
      AI_CONFIG.retries,
      AI_CONFIG.retryDelay,
      AI_CONFIG.timeout
    )

    // 응답 파싱
    const parsed = cleanAIResponse(result.text, categorySuggestionSchema)

    return { success: true, data: parsed }
  } catch (error) {
    console.error('categorizeTransaction error:', error)
    const message = (error as Error).message || ''
    if (message.includes('rate limit')) {
      return { success: false, error: 'API 한도 초과. 잠시 후 다시 시도해주세요.' }
    }
    return { success: false, error: '카테고리 분류에 실패했습니다' }
  }
}

// ========== 이상 거래 감지 ==========
export async function detectAnomalies(
  month: string
): Promise<ActionResult<AnomalyReport>> {
  try {
    const startDate = `${month}-01`
    const endDate = `${month}-31`

    // 이번 달 거래 조회
    const txList = await db
      .select()
      .from(transactions)
      .where(
        and(
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
          eq(transactions.type, 'expense')
        )
      )
      .orderBy(desc(transactions.date))

    if (txList.length === 0) {
      return { success: false, error: '분석할 거래 내역이 없습니다' }
    }

    // 지난 3개월 평균 계산
    const threeMonthsAgo = getMonthsAgo(month, 3)
    const avgStartDate = `${threeMonthsAgo}-01`

    const historicalTx = await db
      .select()
      .from(transactions)
      .where(
        and(
          gte(transactions.date, avgStartDate),
          lte(transactions.date, startDate),
          eq(transactions.type, 'expense')
        )
      )

    const averageByCategory: Record<string, number> = {}
    const countByCategory: Record<string, number> = {}

    historicalTx.forEach((t) => {
      averageByCategory[t.category] =
        (averageByCategory[t.category] || 0) + Number(t.amount)
      countByCategory[t.category] = (countByCategory[t.category] || 0) + 1
    })

    Object.keys(averageByCategory).forEach((cat) => {
      averageByCategory[cat] = Math.round(
        averageByCategory[cat] / (countByCategory[cat] || 1)
      )
    })

    const transactionData = txList.map((t) => ({
      date: t.date,
      category: t.category,
      description: t.description,
      amount: Number(t.amount),
      type: t.type as 'income' | 'expense',
    }))

    const prompt = buildAnomalyDetectionPrompt(transactionData, averageByCategory)

    // AI 호출
    const result = await callWithRetry(
      async () =>
        generateText({
          model,
          prompt,
          maxOutputTokens: AI_CONFIG.maxOutputTokens,
        }),
      AI_CONFIG.retries,
      AI_CONFIG.retryDelay,
      AI_CONFIG.timeout
    )

    // 응답 파싱
    const parsed = cleanAIResponse(result.text, anomalyReportSchema)

    // DB 저장
    await db.insert(aiInsights).values({
      type: 'anomaly_detection',
      title: `${month} 이상 거래 감지`,
      content: JSON.stringify(parsed),
      metadata: { month, averageByCategory },
      month,
    })

    revalidatePath('/')
    return { success: true, data: parsed }
  } catch (error) {
    console.error('detectAnomalies error:', error)
    const message = (error as Error).message || ''
    if (message.includes('rate limit')) {
      return { success: false, error: 'API 한도 초과. 잠시 후 다시 시도해주세요.' }
    }
    return { success: false, error: '이상 거래 감지에 실패했습니다' }
  }
}

// ========== 저축 조언 ==========
export async function provideSavingsAdvice(params: {
  income: number
  expenses: number
  savingsGoal: number
  timeframeMonths: number
  currentSavings?: number
}): Promise<ActionResult<SavingsAdvice>> {
  try {
    const prompt = buildSavingsAdvicePrompt(params)

    // AI 호출
    const result = await callWithRetry(
      async () =>
        generateText({
          model,
          prompt,
          maxOutputTokens: AI_CONFIG.maxOutputTokens,
        }),
      AI_CONFIG.retries,
      AI_CONFIG.retryDelay,
      AI_CONFIG.timeout
    )

    // 응답 파싱
    const parsed = cleanAIResponse(result.text, savingsAdviceSchema)

    // DB 저장
    const currentMonth = new Date().toISOString().slice(0, 7)
    await db.insert(aiInsights).values({
      type: 'savings_advice',
      title: '저축 조언',
      content: JSON.stringify(parsed),
      metadata: params,
      month: currentMonth,
    })

    revalidatePath('/')
    return { success: true, data: parsed }
  } catch (error) {
    console.error('provideSavingsAdvice error:', error)
    const message = (error as Error).message || ''
    if (message.includes('rate limit')) {
      return { success: false, error: 'API 한도 초과. 잠시 후 다시 시도해주세요.' }
    }
    return { success: false, error: '저축 조언 생성에 실패했습니다' }
  }
}

// ========== 인사이트 조회 ==========
export async function getInsights(month: string) {
  return db
    .select()
    .from(aiInsights)
    .where(eq(aiInsights.month, month))
    .orderBy(desc(aiInsights.createdAt))
}

// ========== 유틸리티 함수 ==========
function getPreviousMonth(month: string): string {
  const [year, m] = month.split('-').map(Number)
  const prevMonth = m === 1 ? 12 : m - 1
  const prevYear = m === 1 ? year - 1 : year
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`
}

function getMonthsAgo(month: string, months: number): string {
  const [year, m] = month.split('-').map(Number)
  let newMonth = m - months
  let newYear = year
  while (newMonth <= 0) {
    newMonth += 12
    newYear -= 1
  }
  return `${newYear}-${String(newMonth).padStart(2, '0')}`
}
