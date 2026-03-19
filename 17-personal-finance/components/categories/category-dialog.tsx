'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { createCategory, updateCategory } from '@/app/actions/categories'
import { Plus, Loader2 } from 'lucide-react'
import type { Category } from '@/lib/db/schema'

interface CategoryDialogProps {
  category?: Category
  trigger?: React.ReactNode
}

const DEFAULT_COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
]

const DEFAULT_ICONS = [
  'receipt',
  'shopping-bag',
  'car',
  'home',
  'utensils',
  'heart',
  'gift',
  'coffee',
]

export function CategoryDialog({ category, trigger }: CategoryDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    name: category?.name || '',
    color: category?.color || DEFAULT_COLORS[0],
    icon: category?.icon || DEFAULT_ICONS[0],
    monthlyBudget: category?.monthlyBudget ? Number(category.monthlyBudget) : null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const input = {
        name: formData.name,
        color: formData.color,
        icon: formData.icon,
        monthlyBudget: formData.monthlyBudget,
      }

      const result = category
        ? await updateCategory(category.id, input)
        : await createCategory(input)

      if (result.success) {
        toast.success(category ? '카테고리가 수정되었습니다' : '카테고리가 추가되었습니다')
        router.refresh()
        setOpen(false)
        // 폼 초기화
        if (!category) {
          setFormData({
            name: '',
            color: DEFAULT_COLORS[0],
            icon: DEFAULT_ICONS[0],
            monthlyBudget: null,
          })
        }
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v && !category) {
          // Dialog 닫힐 때 폼 초기화
          setFormData({
            name: '',
            color: DEFAULT_COLORS[0],
            icon: DEFAULT_ICONS[0],
            monthlyBudget: null,
          })
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            새 카테고리
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? '카테고리 수정' : '새 카테고리 추가'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="text-sm font-medium">이름</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="카테고리 이름"
              required
            />
          </div>

          {/* 색상 */}
          <div>
            <label className="text-sm font-medium">색상</label>
            <div className="flex gap-2 mt-2">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-900' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          {/* 아이콘 */}
          <div>
            <label className="text-sm font-medium">아이콘</label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {DEFAULT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`px-3 py-1.5 rounded border text-sm ${
                    formData.icon === icon
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200'
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* 월 예산 (선택) */}
          <div>
            <label className="text-sm font-medium">월 예산 (선택)</label>
            <Input
              type="number"
              value={formData.monthlyBudget || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  monthlyBudget: e.target.value ? Number(e.target.value) : null,
                }))
              }
              placeholder="0"
              min="0"
            />
          </div>

          {/* 제출 버튼 */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : category ? (
              '수정'
            ) : (
              '추가'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
