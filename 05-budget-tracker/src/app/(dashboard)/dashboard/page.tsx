// src/app/(dashboard)/dashboard/page.tsx
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTransactions } from '@/lib/services/transaction.service';
import SummaryCards from '@/components/dashboard/SummaryCards';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const sp = await searchParams;
  const now = new Date();
  const year = sp.year ?? String(now.getFullYear());
  const month = sp.month ?? String(now.getMonth() + 1);

  // summary API 내부 로직 직접 호출 (Server Component)
  const txAll = await getTransactions(session.user.id, { year, month });
  const income = txAll.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = txAll.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const recent = txAll.slice(0, 5);

  const prevMonth = month === '1' ? { year: String(+year - 1), month: '12' } : { year, month: String(+month - 1) };
  const nextMonth = month === '12' ? { year: String(+year + 1), month: '1' } : { year, month: String(+month + 1) };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6 border-b-4 border-black pb-2">
        <Link href={`/dashboard?year=${prevMonth.year}&month=${prevMonth.month}`} className="font-black text-xl hover:bg-yellow-300 px-2 border-2 border-black">←</Link>
        <h1 className="text-3xl font-black">{year}년 {month}월</h1>
        <Link href={`/dashboard?year=${nextMonth.year}&month=${nextMonth.month}`} className="font-black text-xl hover:bg-yellow-300 px-2 border-2 border-black">→</Link>
      </div>

      <SummaryCards income={income} expense={expense} balance={income - expense} />
      <RecentTransactions transactions={recent} />
    </div>
  );
}
