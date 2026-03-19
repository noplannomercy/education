import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCategories } from '@/lib/services/category.service';
import CategoryList from '@/components/categories/CategoryList';
import CategoryForm from '@/components/categories/CategoryForm';

export default async function CategoriesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const allCategories = await getCategories(session.user.id);
  const incomeCategories = allCategories.filter(c => c.type === 'income');
  const expenseCategories = allCategories.filter(c => c.type === 'expense');

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black mb-6 border-b-4 border-black pb-2">카테고리</h1>

      <div className="mb-8 p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-lg font-black mb-4">카테고리 추가</h2>
        <CategoryForm />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-black mb-3 flex items-center gap-2">
            <span className="bg-green-300 border-2 border-black px-2">수입</span>
          </h2>
          <CategoryList categories={incomeCategories} />
        </div>
        <div>
          <h2 className="text-lg font-black mb-3 flex items-center gap-2">
            <span className="bg-red-300 border-2 border-black px-2">지출</span>
          </h2>
          <CategoryList categories={expenseCategories} />
        </div>
      </div>
    </div>
  );
}
