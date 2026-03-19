import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, '이름을 입력하세요').max(50, '이름은 50자 이내'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 코드 (예: #FF5733)'),
  icon: z.string().min(1, '아이콘을 선택하세요'),
  monthlyBudget: z.number().nonnegative('예산은 0 이상').nullable(),
})

export type CategoryInput = z.infer<typeof categorySchema>
