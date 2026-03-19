'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { CategoryDialog } from './category-dialog'
import { deleteCategory } from '@/app/actions/categories'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import type { Category } from '@/lib/db/schema'

interface CategoryListProps {
  categories: Category[]
}

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  )
}

function CategoryCard({ category }: { category: Category }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategory(category.id)
      if (result.success) {
        toast.success('카테고리가 삭제되었습니다')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm"
              style={{ backgroundColor: category.color }}
            >
              {category.icon.slice(0, 2)}
            </div>
            <div>
              <p className="font-medium">{category.name}</p>
              {category.monthlyBudget && (
                <p className="text-sm text-muted-foreground">
                  월 예산: {Number(category.monthlyBudget).toLocaleString()}원
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <CategoryDialog
              category={category}
              trigger={
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <ConfirmDialog
              title="카테고리 삭제"
              description="이 카테고리를 삭제하시겠습니까? 해당 카테고리를 사용하는 거래가 있으면 삭제할 수 없습니다."
              onConfirm={handleDelete}
            >
              <Button variant="ghost" size="icon" disabled={isPending}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </ConfirmDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
