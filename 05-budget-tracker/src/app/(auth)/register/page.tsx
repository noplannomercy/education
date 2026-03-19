import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-yellow-300">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-md">
        <h1 className="text-3xl font-black mb-2">가계부</h1>
        <p className="font-bold mb-6 text-gray-600">회원가입</p>
        <RegisterForm />
        <p className="mt-4 text-center font-bold">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="underline font-black hover:text-blue-600">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
