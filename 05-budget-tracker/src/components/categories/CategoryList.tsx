'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

interface Props {
  categories: Category[];
}

export default function CategoryList({ categories }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return;
    setDeleting(id);
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {categories.map(cat => (
        <div
          key={cat.id}
          className="flex items-center justify-between p-3 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-black" style={{ backgroundColor: cat.color }} />
            <span className="font-bold">{cat.name}</span>
            <span className={`text-sm font-black px-2 py-0.5 border border-black ${cat.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
              {cat.type === 'income' ? '수입' : '지출'}
            </span>
          </div>
          <button
            onClick={() => handleDelete(cat.id)}
            disabled={deleting === cat.id}
            className="text-sm font-black px-2 py-1 border-2 border-black hover:bg-red-100 transition-all disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      ))}
      {categories.length === 0 && (
        <p className="font-bold text-gray-500 p-4 text-center">카테고리가 없습니다.</p>
      )}
    </div>
  );
}
