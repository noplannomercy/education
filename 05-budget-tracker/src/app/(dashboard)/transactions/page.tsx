// src/app/(dashboard)/transactions/page.tsx
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTransactions } from '@/lib/services/transaction.service';
import { getCategories } from '@/lib/services/category.service';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionForm from '@/components/transactions/TransactionForm';

interface Props {
  searchParams: Promise<{ year?: string; month?: string; type?: string; categoryId?: string }>;
}

export default async function TransactionsPage({ searchParams }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const sp = await searchParams;
  const now = new Date();
  const year = sp.year ?? String(now.getFullYear());
  const month = sp.month ?? String(now.getMonth() + 1);

  const [txList, catList] = await Promise.all([
    getTransactions(session.user.id, { year, month, type: sp.type as 'income' | 'expense' | undefined, categoryId: sp.categoryId }),
    getCategories(session.user.id),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-black mb-6 border-b-4 border-black pb-2">거래 내역</h1>

      <div className="mb-6 p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-lg font-black mb-4">거래 추가</h2>
        <TransactionForm categories={catList} />
      </div>

      <div className="mb-4 flex gap-2 items-center">
        <span className="font-black">{year}년 {month}월</span>
        <span className="font-bold text-gray-500">— {txList.length}건</span>
      </div>

      <TransactionList transactions={txList} />
    </div>
  );
}
