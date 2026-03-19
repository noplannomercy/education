'use client'

import { useState } from 'react'
import { createHabit, updateHabit } from '@/lib/actions/habits'
import { categoryEnum, categoryLabels, categoryColors, frequencyLabels } from '@/lib/types'
import type { Habit } from '@/lib/db/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

type HabitFormProps = {
  habit?: Habit
  children: React.ReactNode
}

export function HabitForm({ habit, children }: HabitFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: habit?.name || '',
    description: habit?.description || '',
    category: habit?.category || 'health',
    color: habit?.color || categoryColors.health,
    targetFrequency: habit?.targetFrequency || 7,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = habit
        ? await updateHabit(habit.id, formData)
        : await createHabit(formData)

      if (result.success) {
        toast.success(habit ? '습관이 수정되었습니다' : '습관이 생성되었습니다')
        setOpen(false)
        if (!habit) {
          // Reset form only for new habit
          setFormData({
            name: '',
            description: '',
            category: 'health',
            color: categoryColors.health,
            targetFrequency: 7,
          })
        }
      } else {
        toast.error(result.error || '오류가 발생했습니다')
      }
    } catch (error) {
      toast.error('오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{habit ? '습관 수정' : '새 습관 만들기'}</DialogTitle>
          <DialogDescription>
            {habit
              ? '습관 정보를 수정하세요'
              : '새로운 습관을 만들어 목표를 달성하세요'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">습관명 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="예: 물 2L 마시기"
                required
                maxLength={100}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="습관에 대한 간단한 설명 (선택)"
                maxLength={500}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">카테고리 *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as any,
                    color: categoryColors[value as keyof typeof categoryColors],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryEnum.options.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color">색상 *</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-20 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="#3B82F6"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  maxLength={7}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="targetFrequency">목표 빈도 *</Label>
              <Select
                value={formData.targetFrequency.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, targetFrequency: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((freq) => (
                    <SelectItem key={freq} value={freq.toString()}>
                      {frequencyLabels[freq]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? '저장 중...' : habit ? '수정' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
