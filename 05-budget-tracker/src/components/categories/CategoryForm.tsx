'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  onSuccess?: () => void;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];

export default function CategoryForm({ onSuccess }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, color }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? '카테고리 추가에 실패했습니다.');
      return;
    }
    setName('');
    router.refresh();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="카테고리 이름"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        className="border-2 border-black p-2 font-bold focus:outline-none"
      />
      <div className="flex gap-2">
        {(['income', 'expense'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 p-2 font-black border-2 border-black transition-all ${
              type === t ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            {t === 'income' ? '수입' : '지출'}
          </button>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {COLORS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`w-8 h-8 border-2 ${color === c ? 'border-black scale-125' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      {error && <p className="text-red-600 font-bold text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white p-2 font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
      >
        {loading ? '추가 중...' : '카테고리 추가'}
      </button>
    </form>
  );
}
