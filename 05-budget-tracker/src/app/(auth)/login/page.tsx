import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-yellow-300">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-md">
        <h1 className="text-3xl font-black mb-2">가계부</h1>
        <p className="font-bold mb-6 text-gray-600">로그인</p>
        <LoginForm />
        <p className="mt-4 text-center font-bold">
          계정이 없으신가요?{' '}
          <Link href="/register" className="underline font-black hover:text-blue-600">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
