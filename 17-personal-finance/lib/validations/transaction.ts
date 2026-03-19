import { z } from 'zod'

export const transactionSchema = z.object({
  amount: z.number().positive('금액은 양수여야 합니다'),
  category: z.string().min(1, '카테고리를 선택하세요'),
  description: z.string().min(1, '설명을 입력하세요').max(255, '설명은 255자 이내'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD')
    .refine((d) => new Date(d) <= new Date(), '미래 날짜는 입력할 수 없습니다'),
  type: z.enum(['income', 'expense']),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
})

export type TransactionInput = z.infer<typeof transactionSchema>
