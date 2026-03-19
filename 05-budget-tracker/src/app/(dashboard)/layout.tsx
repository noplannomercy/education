import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={session.user} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
