'use client';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) {
      setError(error.message ?? '회원가입 실패');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="이름"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        className="border-2 border-black p-3 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      />
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="border-2 border-black p-3 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      />
      <input
        type="password"
        placeholder="비밀번호 (6자 이상)"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={6}
        className="border-2 border-black p-3 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      />
      {error && <p className="text-red-600 font-bold">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white p-3 font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
      >
        {loading ? '처리 중...' : '회원가입'}
      </button>
    </form>
  );
}
