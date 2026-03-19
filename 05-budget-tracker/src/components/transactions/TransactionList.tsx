// src/components/transactions/TransactionList.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  date: string;
  categoryName: string | null;
  categoryColor: string | null;
}

interface Props {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return;
    setDeleting(id);
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.map(tx => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-3 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="flex items-center gap-3">
            {tx.categoryColor && (
              <div className="w-3 h-3 border border-black shrink-0" style={{ backgroundColor: tx.categoryColor }} />
            )}
            <div>
              <p className="font-bold">{tx.description ?? tx.categoryName ?? '(메모 없음)'}</p>
              <p className="text-sm text-gray-500">{tx.date} {tx.categoryName && `· ${tx.categoryName}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-black text-lg ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('ko-KR')}
            </span>
            <button
              onClick={() => handleDelete(tx.id)}
              disabled={deleting === tx.id}
              className="text-sm font-black px-2 py-1 border-2 border-black hover:bg-red-100 transition-all disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
      {transactions.length === 0 && (
        <p className="font-bold text-gray-500 p-4 text-center">거래 내역이 없습니다.</p>
      )}
    </div>
  );
}
