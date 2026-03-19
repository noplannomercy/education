// src/components/transactions/TransactionForm.tsx
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
  onSuccess?: () => void;
}

export default function TransactionForm({ categories, onSuccess }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter(c => c.type === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(amount),
        type,
        categoryId: categoryId || undefined,
        description: description || undefined,
        date,
      }),
    });
    setLoading(false);
    setAmount('');
    setDescription('');
    setCategoryId('');
    router.refresh();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setCategoryId(''); }}
            className={`flex-1 p-2 font-black border-2 border-black transition-all ${
              type === t
                ? t === 'expense' ? 'bg-red-400 text-black' : 'bg-green-400 text-black'
                : 'hover:bg-gray-100'
            }`}
          >
            {t === 'income' ? '수입' : '지출'}
          </button>
        ))}
      </div>
      <input
        type="number"
        placeholder="금액"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        required
        min="1"
        step="1"
        className="border-2 border-black p-2 font-bold focus:outline-none"
      />
      <select
        value={categoryId}
        onChange={e => setCategoryId(e.target.value)}
        className="border-2 border-black p-2 font-bold focus:outline-none bg-white"
      >
        <option value="">카테고리 선택 (선택사항)</option>
        {filteredCategories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="메모 (선택사항)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="border-2 border-black p-2 font-bold focus:outline-none"
      />
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
        className="border-2 border-black p-2 font-bold focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white p-2 font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
      >
        {loading ? '추가 중...' : '거래 추가'}
      </button>
    </form>
  );
}
