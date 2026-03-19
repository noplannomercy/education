import { getCategories } from '@/app/actions/categories'
import { CategoryDialog } from '@/components/categories/category-dialog'
import { CategoryList } from '@/components/categories/category-list'
import { EmptyState } from '@/components/shared/empty-state'
import { Tags } from 'lucide-react'

export async function CategoriesTab() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">카테고리 관리</h2>
        <CategoryDialog />
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="카테고리가 없습니다"
          description="새 카테고리를 추가해보세요"
        />
      ) : (
        <CategoryList categories={categories} />
      )}
    </div>
  )
}
