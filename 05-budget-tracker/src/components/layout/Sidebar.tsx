'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface Props {
  user: { name: string; email: string };
}

export default function Sidebar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push('/login');
    router.refresh();
  }

  const links = [
    { href: '/dashboard', label: '대시보드' },
    { href: '/transactions', label: '거래 내역' },
    { href: '/categories', label: '카테고리' },
  ];

  return (
    <aside className="w-56 bg-white border-r-4 border-black flex flex-col">
      <div className="p-4 border-b-4 border-black">
        <h1 className="text-xl font-black">가계부</h1>
        <p className="text-sm font-bold text-gray-600 truncate">{user.name}</p>
      </div>
      <nav className="flex-1 p-2 flex flex-col gap-1">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`p-3 font-black border-2 border-black transition-all ${
              pathname === link.href
                ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'hover:bg-yellow-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t-4 border-black">
        <button
          onClick={handleLogout}
          className="w-full p-3 font-black border-2 border-black hover:bg-red-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
