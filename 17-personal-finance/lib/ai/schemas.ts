import { z } from 'zod'

// 지출 분석 스키마
export const spendingAnalysisSchema = z.object({
  summary: z.string(),
  topSpending: z.array(
    z.object({
      category: z.string(),
      amount: z.number(),
      percentage: z.number(),
    })
  ),
  unnecessarySpending: z.array(
    z.object({
      description: z.string(),
      amount: z.number(),
      suggestion: z.string(),
    })
  ),
  savingOpportunities: z.array(z.string()),
  trends: z.array(z.string()),
})

export type SpendingAnalysis = z.infer<typeof spendingAnalysisSchema>

// 예산 제안 스키마
export const budgetSuggestionSchema = z.object({
  totalBudget: z.number(),
  categoryBudgets: z.record(z.string(), z.number()),
  savingsTarget: z.number(),
  insights: z.array(z.string()),
})

export type BudgetSuggestion = z.infer<typeof budgetSuggestionSchema>

// 카테고리 분류 스키마
export const categorySuggestionSchema = z.object({
  suggestedCategory: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
})

export type CategorySuggestion = z.infer<typeof categorySuggestionSchema>

// 이상 거래 보고 스키마
export const anomalyReportSchema = z.object({
  anomalies: z.array(
    z.object({
      description: z.string(),
      amount: z.number(),
      date: z.string(),
      reason: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
    })
  ),
  summary: z.string(),
  recommendation: z.string(),
})

export type AnomalyReport = z.infer<typeof anomalyReportSchema>

// 저축 조언 스키마
export const savingsAdviceSchema = z.object({
  currentSavings: z.number(),
  requiredMonthlySavings: z.number(),
  gap: z.number(),
  feasibility: z.enum(['easy', 'moderate', 'challenging', 'difficult']),
  strategies: z.array(
    z.object({
      action: z.string(),
      potentialSavings: z.number(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
    })
  ),
  projectedSavings: z.record(z.string(), z.number()),
  motivation: z.string(),
})

export type SavingsAdvice = z.infer<typeof savingsAdviceSchema>
