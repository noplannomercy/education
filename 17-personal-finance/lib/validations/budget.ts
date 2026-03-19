import { z } from 'zod'

export const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, '올바른 월 형식: YYYY-MM'),
  totalBudget: z.number().positive('예산은 양수여야 합니다'),
  categoryBudgets: z.record(z.string(), z.number().nonnegative()),
})

export type BudgetInput = z.infer<typeof budgetSchema>
