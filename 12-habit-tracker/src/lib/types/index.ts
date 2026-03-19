import { z } from 'zod'

// Category enum
export const categoryEnum = z.enum(['health', 'learning', 'exercise', 'other'])

export type Category = z.infer<typeof categoryEnum>

// Habit validation schema
export const habitSchema = z.object({
  name: z.string().min(1, '습관명을 입력해주세요').max(100, '습관명은 100자 이내로 입력해주세요'),
  description: z.string().max(500, '설명은 500자 이내로 입력해주세요').optional(),
  category: categoryEnum,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, '올바른 색상 코드를 입력해주세요 (예: #3B82F6)'),
  targetFrequency: z.number().int().min(1, '최소 1회').max(7, '최대 7회'),
})

export type HabitInput = z.infer<typeof habitSchema>

// Category labels (for UI)
export const categoryLabels: Record<Category, string> = {
  health: '건강',
  learning: '학습',
  exercise: '운동',
  other: '기타',
}

// Frequency labels (for UI)
export const frequencyLabels: Record<number, string> = {
  1: '주 1회',
  2: '주 2회',
  3: '주 3회',
  4: '주 4회',
  5: '주 5회',
  6: '주 6회',
  7: '매일',
}

// Default colors for categories
export const categoryColors: Record<Category, string> = {
  health: '#10B981',    // green
  learning: '#3B82F6',  // blue
  exercise: '#F59E0B',  // amber
  other: '#8B5CF6',     // purple
}
