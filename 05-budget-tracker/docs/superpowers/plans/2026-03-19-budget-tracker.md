# Budget Tracker Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 수입/지출 관리, 카테고리별 분류, 월별 요약 기능을 갖춘 가계부 웹앱 구현

**Architecture:** Next.js 15 App Router + better-auth + Drizzle ORM + SQLite. 서비스 레이어 분리, Server Component 우선, Client Component는 폼/인터랙션만.

**Tech Stack:** Next.js 15, better-auth, Drizzle ORM, better-sqlite3, Zod, Tailwind CSS v4

---

## Chunk 1: 인증 + 미들웨어

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/auth/RegisterForm.tsx`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx` (임시 placeholder)

### 미들웨어

- [ ] **Step 1: middleware.ts 작성**

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/transactions', '/categories'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));
  if (!isProtected) return NextResponse.next();

  const sessionToken =
    request.cookies.get('better-auth.session_token') ??
    request.cookies.get('__Secure-better-auth.session_token');

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

- [ ] **Step 2: 빌드 확인**

```bash
cd C:/workspace/prj20060203/3.4.budget-tracker && npx dotenv -e .env.local -- next build 2>&1 | tail -5
```
Expected: `✓ Compiled successfully`

### 인증 UI

- [ ] **Step 3: LoginForm.tsx 작성**

```tsx
// src/components/auth/LoginForm.tsx
'use client';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setError(error.message ?? '로그인 실패');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        placeholder="비밀번호"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="border-2 border-black p-3 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      />
      {error && <p className="text-red-600 font-bold">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white p-3 font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: RegisterForm.tsx 작성** (auth signup + redirect만. 기본 카테고리 생성은 auth.ts databaseHooks에서 처리)

```tsx
// src/components/auth/RegisterForm.tsx
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
```

- [ ] **Step 4.5: auth.ts 수정** (CAT-06: databaseHooks로 회원가입 후 기본 카테고리 DB 직접 삽입)

```ts
// src/lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: { enabled: true },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const defaultCategories = [
            { name: '급여', type: 'income' as const, color: '#22c55e' },
            { name: '식비', type: 'expense' as const, color: '#ef4444' },
            { name: '교통', type: 'expense' as const, color: '#3b82f6' },
            { name: '주거', type: 'expense' as const, color: '#f59e0b' },
          ];
          await db.insert(schema.categories).values(
            defaultCategories.map(cat => ({
              id: crypto.randomUUID(),
              userId: user.id,
              name: cat.name,
              type: cat.type,
              color: cat.color,
              createdAt: new Date(),
              updatedAt: new Date(),
            }))
          );
        },
      },
    },
  },
});
```

- [ ] **Step 5: login/page.tsx 작성**

```tsx
// src/app/(auth)/login/page.tsx
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
```

- [ ] **Step 6: register/page.tsx 작성**

```tsx
// src/app/(auth)/register/page.tsx
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
```

- [ ] **Step 7: (dashboard)/layout.tsx 작성**

```tsx
// src/app/(dashboard)/layout.tsx
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
```

- [ ] **Step 8: Sidebar.tsx 작성**

```tsx
// src/components/layout/Sidebar.tsx
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
```

- [ ] **Step 9: (dashboard)/dashboard/page.tsx placeholder 작성**

```tsx
// src/app/(dashboard)/dashboard/page.tsx
export default function DashboardPage() {
  return <div className="font-black text-2xl">대시보드 (구현 예정)</div>;
}
```

- [ ] **Step 10: 빌드 확인**

```bash
cd C:/workspace/prj20060203/3.4.budget-tracker && npx dotenv -e .env.local -- next build 2>&1 | tail -8
```
Expected: `✓ Compiled successfully`

- [ ] **Step 11: smoke test** (필수 — 인증 흐름은 공통 레이어)

```bash
# 1. 서버 확인
curl -s -X POST http://localhost:3012/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3012" \
  -d '{"name":"testuser","email":"smoke_chunk1@test.com","password":"password123"}' \
  | grep -o '"emailVerified"'
# → "emailVerified" 출력 시 OK

# 2. 회원가입 후 로그인 확인 (쿠키 저장)
curl -s -c /tmp/c1.txt -X POST http://localhost:3012/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3012" \
  -d '{"email":"smoke_chunk1@test.com","password":"password123"}' \
  | grep -o '"token"'
# → "token" 출력 시 OK

# CAT-06 검증은 Chunk 2 smoke test에서 수행 (categories API 생성 후)
```

- [ ] **Step 12: dev-log 작성** `docs/dev-log/chunk1.md` (생략 불가)
  - TDD 적용 여부 + 근거
  - 빌드 검증 시점 + 근거
  - smoke test 실행 여부 + 근거 + 결과

- [ ] **Step 13: git commit**

```bash
git add -A && git commit -m "feat: chunk1 — 인증 + 미들웨어 + 레이아웃"
```

---

## Chunk 2: 카테고리 API + 카테고리 관리 페이지

**Files:**
- Create: `src/lib/services/category.service.ts`
- Create: `src/app/api/categories/route.ts`
- Create: `src/app/api/categories/[id]/route.ts`
- Create: `src/components/categories/CategoryList.tsx`
- Create: `src/components/categories/CategoryForm.tsx`
- Create: `src/app/(dashboard)/categories/page.tsx`

- [ ] **Step 1: category.service.ts 작성**

```ts
// src/lib/services/category.service.ts
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export type CreateCategoryData = {
  name: string;
  type: 'income' | 'expense';
  color: string;
};

export async function getCategories(userId: string, type?: 'income' | 'expense') {
  const conditions = type
    ? and(eq(categories.userId, userId), eq(categories.type, type))
    : eq(categories.userId, userId);
  return db.select().from(categories).where(conditions);
}

export async function createCategory(userId: string, data: CreateCategoryData) {
  const [cat] = await db.insert(categories).values({ ...data, userId }).returning();
  return cat;
}

export async function updateCategory(id: string, userId: string, data: Partial<CreateCategoryData>) {
  const [cat] = await db.update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();
  return cat ?? null;
}

export async function deleteCategory(id: string, userId: string) {
  const [cat] = await db.delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();
  return cat ?? null;
}
```

- [ ] **Step 2: /api/categories/route.ts 작성**

```ts
// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getCategories, createCategory } from '@/lib/services/category.service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['income', 'expense']),
  color: z.string().default('#6366f1'),
});

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'income' | 'expense' | null;

    const data = await getCategories(session.user.id, type ?? undefined);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const data = await createCategory(session.user.id, parsed.data);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 3: /api/categories/[id]/route.ts 작성**

```ts
// src/app/api/categories/[id]/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { updateCategory, deleteCategory } from '@/lib/services/category.service';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const data = await updateCategory(id, session.user.id, parsed.data);
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await deleteCategory(id, session.user.id);
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 4: CategoryForm.tsx 작성**

```tsx
// src/components/categories/CategoryForm.tsx
'use client';
import { useState } from 'react';

interface Props {
  onSuccess: () => void;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];

export default function CategoryForm({ onSuccess }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, color }),
    });
    setLoading(false);
    setName('');
    onSuccess();
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
```

- [ ] **Step 5: CategoryList.tsx 작성**

```tsx
// src/components/categories/CategoryList.tsx
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
}

export default function CategoryList({ categories }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return;
    setDeleting(id);
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {categories.map(cat => (
        <div
          key={cat.id}
          className="flex items-center justify-between p-3 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-black" style={{ backgroundColor: cat.color }} />
            <span className="font-bold">{cat.name}</span>
            <span className={`text-sm font-black px-2 py-0.5 border border-black ${cat.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
              {cat.type === 'income' ? '수입' : '지출'}
            </span>
          </div>
          <button
            onClick={() => handleDelete(cat.id)}
            disabled={deleting === cat.id}
            className="text-sm font-black px-2 py-1 border-2 border-black hover:bg-red-100 transition-all disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      ))}
      {categories.length === 0 && (
        <p className="font-bold text-gray-500 p-4 text-center">카테고리가 없습니다.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 6: categories/page.tsx 작성**

```tsx
// src/app/(dashboard)/categories/page.tsx
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCategories } from '@/lib/services/category.service';
import CategoryList from '@/components/categories/CategoryList';
import CategoryForm from '@/components/categories/CategoryForm';

export default async function CategoriesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const allCategories = await getCategories(session.user.id);
  const incomeCategories = allCategories.filter(c => c.type === 'income');
  const expenseCategories = allCategories.filter(c => c.type === 'expense');

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black mb-6 border-b-4 border-black pb-2">카테고리</h1>

      <div className="mb-8 p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-lg font-black mb-4">카테고리 추가</h2>
        <CategoryForm onSuccess={() => {}} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-black mb-3 flex items-center gap-2">
            <span className="bg-green-300 border-2 border-black px-2">수입</span>
          </h2>
          <CategoryList categories={incomeCategories} />
        </div>
        <div>
          <h2 className="text-lg font-black mb-3 flex items-center gap-2">
            <span className="bg-red-300 border-2 border-black px-2">지출</span>
          </h2>
          <CategoryList categories={expenseCategories} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: 빌드 확인**

```bash
cd C:/workspace/prj20060203/3.4.budget-tracker && npx dotenv -e .env.local -- next build 2>&1 | tail -8
```
Expected: `✓ Compiled successfully`

- [ ] **Step 8: smoke test** (필수 — 서비스 레이어 첫 도입)

```bash
# 1. 서버 확인
curl -s -X POST http://localhost:3012/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3012" \
  -d '{"name":"t","email":"smoke_c2@test.com","password":"password123"}' \
  | grep -o '"emailVerified"'

# 2. 로그인해서 쿠키 저장
curl -s -c /tmp/cookies.txt -X POST http://localhost:3012/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3012" \
  -d '{"email":"smoke_c2@test.com","password":"password123"}' | grep -o '"token"'

# 3. 카테고리 생성
curl -s -b /tmp/cookies.txt -X POST http://localhost:3012/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"식비","type":"expense","color":"#ef4444"}' | grep -o '"id"'

# 4. 카테고리 목록 조회
curl -s -b /tmp/cookies.txt http://localhost:3012/api/categories | grep -o '"name"'

# 5. CAT-06 검증: 신규 유저 회원가입 후 기본 카테고리 자동 생성 확인
curl -s -X POST http://localhost:3012/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3012" \
  -d '{"name":"cattest","email":"smoke_cat06@test.com","password":"password123"}' \
  | grep -o '"emailVerified"'
# → "emailVerified" 출력 시 OK

curl -s -c /tmp/cat06.txt -X POST http://localhost:3012/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3012" \
  -d '{"email":"smoke_cat06@test.com","password":"password123"}' \
  | grep -o '"token"'
# → "token" 출력 시 OK

curl -s -b /tmp/cat06.txt http://localhost:3012/api/categories \
  | grep -o '"급여"'
# → "급여" 출력 시 OK (databaseHooks로 자동 생성된 기본 카테고리 확인)
```

- [ ] **Step 9: dev-log 작성** `docs/dev-log/chunk2.md` (생략 불가)

- [ ] **Step 10: git commit**

```bash
git add -A && git commit -m "feat: chunk2 — 카테고리 API + 관리 페이지"
```

---

## Chunk 3: 거래 API + 거래 목록 페이지

**Files:**
- Create: `src/lib/services/transaction.service.ts`
- Create: `src/app/api/transactions/route.ts`
- Create: `src/app/api/transactions/[id]/route.ts`
- Create: `src/components/transactions/TransactionForm.tsx`
- Create: `src/components/transactions/TransactionList.tsx`
- Create: `src/app/(dashboard)/transactions/page.tsx`

- [ ] **Step 1: transaction.service.ts 작성**

```ts
// src/lib/services/transaction.service.ts
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, and, like, desc } from 'drizzle-orm';

export type CreateTransactionData = {
  amount: number;
  type: 'income' | 'expense';
  categoryId?: string;
  description?: string;
  date: string; // YYYY-MM-DD
};

export type TransactionFilters = {
  year?: string;
  month?: string;
  categoryId?: string;
  type?: 'income' | 'expense';
};

export async function getTransactions(userId: string, filters: TransactionFilters = {}) {
  const conditions = [eq(transactions.userId, userId)];

  if (filters.year && filters.month) {
    const mm = filters.month.padStart(2, '0');
    conditions.push(like(transactions.date, `${filters.year}-${mm}-%`));
  } else if (filters.year) {
    conditions.push(like(transactions.date, `${filters.year}-%`));
  }
  if (filters.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));
  if (filters.type) conditions.push(eq(transactions.type, filters.type));

  return db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      description: transactions.description,
      date: transactions.date,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date));
}

export async function createTransaction(userId: string, data: CreateTransactionData) {
  const [tx] = await db.insert(transactions).values({ ...data, userId }).returning();
  return tx;
}

export async function updateTransaction(id: string, userId: string, data: Partial<CreateTransactionData>) {
  const [tx] = await db.update(transactions)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning();
  return tx ?? null;
}

export async function deleteTransaction(id: string, userId: string) {
  const [tx] = await db.delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning();
  return tx ?? null;
}
```

- [ ] **Step 2: /api/transactions/route.ts 작성**

```ts
// src/app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getTransactions, createTransaction } from '@/lib/services/transaction.service';
import { z } from 'zod';

const createSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const filters = {
      year: searchParams.get('year') ?? undefined,
      month: searchParams.get('month') ?? undefined,
      categoryId: searchParams.get('categoryId') ?? undefined,
      type: (searchParams.get('type') as 'income' | 'expense') ?? undefined,
    };

    const data = await getTransactions(session.user.id, filters);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const data = await createTransaction(session.user.id, parsed.data);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 3: /api/transactions/[id]/route.ts 작성**

```ts
// src/app/api/transactions/[id]/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { updateTransaction, deleteTransaction } from '@/lib/services/transaction.service';
import { z } from 'zod';

const updateSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().nullable().optional(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const data = await updateTransaction(id, session.user.id, parsed.data);
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await deleteTransaction(id, session.user.id);
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 4: TransactionForm.tsx 작성**

```tsx
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
```

- [ ] **Step 5: TransactionList.tsx 작성**

```tsx
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
```

- [ ] **Step 6: transactions/page.tsx 작성**

```tsx
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
```

- [ ] **Step 7: 빌드 확인**

```bash
cd C:/workspace/prj20060203/3.4.budget-tracker && npx dotenv -e .env.local -- next build 2>&1 | tail -8
```

- [ ] **Step 8: smoke test** (필수 — 핵심 비즈니스 로직)

```bash
# 1. 서버 확인
curl -s -X POST http://localhost:3012/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3012" \
  -d '{"name":"t","email":"smoke_c3@test.com","password":"password123"}' \
  | grep -o '"emailVerified"'

# 2. 로그인
curl -s -c /tmp/c3.txt -X POST http://localhost:3012/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3012" \
  -d '{"email":"smoke_c3@test.com","password":"password123"}' | grep -o '"token"'

# 3. 거래 생성
curl -s -b /tmp/c3.txt -X POST http://localhost:3012/api/transactions \
  -H "Content-Type: application/json" \
  -d "{\"amount\":50000,\"type\":\"expense\",\"description\":\"점심\",\"date\":\"$(date +%Y-%m-%d)\"}" \
  | grep -o '"id"'

# 4. 거래 목록 조회
curl -s -b /tmp/c3.txt "http://localhost:3012/api/transactions?year=$(date +%Y)&month=$(date +%m)" \
  | grep -o '"amount"'
```

- [ ] **Step 9: dev-log 작성** `docs/dev-log/chunk3.md` (생략 불가)

- [ ] **Step 10: git commit**

```bash
git add -A && git commit -m "feat: chunk3 — 거래 API + 거래 목록 페이지"
```

---

## Chunk 4: 대시보드 (Summary API + 월별 요약 UI)

**Files:**
- Create: `src/app/api/summary/route.ts`
- Create: `src/components/dashboard/SummaryCards.tsx`
- Create: `src/components/dashboard/RecentTransactions.tsx`
- Modify: `src/app/(dashboard)/dashboard/page.tsx` (placeholder → 실제 구현)

- [ ] **Step 1: /api/summary/route.ts 작성**

```ts
// src/app/api/summary/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, and, like, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const year = searchParams.get('year') ?? String(now.getFullYear());
    const month = (searchParams.get('month') ?? String(now.getMonth() + 1)).padStart(2, '0');
    const datePattern = `${year}-${month}-%`;
    const userId = session.user.id;

    const dateCondition = and(eq(transactions.userId, userId), like(transactions.date, datePattern));

    // 수입/지출 합계
    const totals = await db
      .select({
        type: transactions.type,
        total: sql<number>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(dateCondition)
      .groupBy(transactions.type);

    const income = totals.find(t => t.type === 'income')?.total ?? 0;
    const expense = totals.find(t => t.type === 'expense')?.total ?? 0;

    // 카테고리별 집계
    const byCategory = await db
      .select({
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        type: transactions.type,
        total: sql<number>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(dateCondition)
      .groupBy(transactions.categoryId, transactions.type);

    return NextResponse.json({
      data: { income, expense, balance: income - expense, byCategory },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: SummaryCards.tsx 작성**

```tsx
// src/components/dashboard/SummaryCards.tsx
interface Props {
  income: number;
  expense: number;
  balance: number;
}

export default function SummaryCards({ income, expense, balance }: Props) {
  const cards = [
    { label: '총 수입', value: income, bg: 'bg-green-300', sign: '+' },
    { label: '총 지출', value: expense, bg: 'bg-red-300', sign: '-' },
    { label: '잔액', value: balance, bg: balance >= 0 ? 'bg-yellow-300' : 'bg-orange-300', sign: balance >= 0 ? '' : '-' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {cards.map(card => (
        <div
          key={card.label}
          className={`p-4 border-4 border-black ${card.bg} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
        >
          <p className="font-black text-sm mb-1">{card.label}</p>
          <p className="text-2xl font-black">
            {card.label === '잔액' && balance < 0 ? '-' : card.label !== '잔액' ? card.sign : ''}
            {Math.abs(card.value).toLocaleString('ko-KR')}
            <span className="text-sm ml-1">원</span>
          </p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: RecentTransactions.tsx 작성**

```tsx
// src/components/dashboard/RecentTransactions.tsx
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

export default function RecentTransactions({ transactions }: Props) {
  return (
    <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-lg font-black p-4 border-b-4 border-black bg-black text-white">최근 거래</h2>
      <div className="divide-y-2 divide-black">
        {transactions.map(tx => (
          <div key={tx.id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              {tx.categoryColor && (
                <div className="w-3 h-3 border border-black shrink-0" style={{ backgroundColor: tx.categoryColor }} />
              )}
              <div>
                <p className="font-bold text-sm">{tx.description ?? tx.categoryName ?? '(메모 없음)'}</p>
                <p className="text-xs text-gray-500">{tx.date}</p>
              </div>
            </div>
            <span className={`font-black ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('ko-KR')}
            </span>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="p-4 text-center font-bold text-gray-500">거래 내역이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: dashboard/page.tsx 실제 구현으로 교체**

```tsx
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
```

- [ ] **Step 5: 빌드 확인**

```bash
cd C:/workspace/prj20060203/3.4.budget-tracker && npx dotenv -e .env.local -- next build 2>&1 | tail -10
```
Expected: `✓ Compiled successfully`

- [ ] **Step 6: smoke test** (필수 — 집계 로직 신규)

```bash
# 1. 서버 확인
curl -s -X POST http://localhost:3012/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3012" \
  -d '{"name":"t","email":"smoke_c4@test.com","password":"password123"}' \
  | grep -o '"emailVerified"'

# 2. 로그인
curl -s -c /tmp/c4.txt -X POST http://localhost:3012/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3012" \
  -d '{"email":"smoke_c4@test.com","password":"password123"}' | grep -o '"token"'

# 3. 수입 거래 추가
curl -s -b /tmp/c4.txt -X POST http://localhost:3012/api/transactions \
  -H "Content-Type: application/json" \
  -d "{\"amount\":1000000,\"type\":\"income\",\"description\":\"월급\",\"date\":\"$(date +%Y-%m-01)\"}" | grep -o '"id"'

# 4. 지출 거래 추가
curl -s -b /tmp/c4.txt -X POST http://localhost:3012/api/transactions \
  -H "Content-Type: application/json" \
  -d "{\"amount\":50000,\"type\":\"expense\",\"description\":\"점심\",\"date\":\"$(date +%Y-%m-%d)\"}" | grep -o '"id"'

# 5. summary 확인 (income: 1000000, expense: 50000, balance: 950000)
curl -s -b /tmp/c4.txt "http://localhost:3012/api/summary?year=$(date +%Y)&month=$(date +%m)" | grep -o '"balance"'
```

- [ ] **Step 7: dev-log 작성** `docs/dev-log/chunk4.md` (생략 불가)

- [ ] **Step 8: git commit**

```bash
git add -A && git commit -m "feat: chunk4 — summary API + 대시보드"
```
