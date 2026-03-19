# AI Travel Planner - 배포 가이드

## 1. 배포 전 체크리스트

배포하기 전에 다음 항목을 확인하세요:

- [ ] **빌드 에러 0**: `npm run build` 성공
- [ ] **타입 체크 통과**: `npm run type-check` 또는 `tsc --noEmit` 성공
- [ ] **Lint 통과**: `npm run lint` 에러 없음
- [ ] **로컬 테스트 완료**: 모든 기능 정상 동작
- [ ] **환경 변수 확인**: `.env.local` 파일 존재 및 유효성
- [ ] **DB 마이그레이션 완료**: 스키마 적용 및 검증
- [ ] **AI API 키 유효**: Open Router API 키 정상 작동
- [ ] **Git 커밋**: 최신 변경사항 커밋 완료

---

## 2. Database 설정

### 2.1 로컬 개발 DB 생성

#### Docker PostgreSQL 컨테이너 사용

**1. 기존 컨테이너 확인**:
```bash
docker ps -a | grep budget-tracker-db
```

**2. 컨테이너 실행 중이 아니면 시작**:
```bash
docker start budget-tracker-db
```

**3. PostgreSQL 접속**:
```bash
docker exec -it budget-tracker-db psql -U budget -d budget_tracker
```

**4. travel_planner DB 생성**:
```sql
-- 기존 DB 확인
\l

-- travel_planner DB 생성
CREATE DATABASE travel_planner;

-- 생성 확인
\l

-- DB 변경
\c travel_planner

-- 종료
\q
```

#### 로컬 환경 변수 설정

`.env.local` 파일 생성:
```env
# Database
DATABASE_URL=postgresql://budget:budget123@localhost:5432/travel_planner

# AI API
OPENROUTER_API_KEY=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

# Node Environment
NODE_ENV=development
```

#### 마이그레이션 실행

```bash
# 1. 마이그레이션 파일 생성 (스키마 변경 시)
npx drizzle-kit generate

# 2. 마이그레이션 적용
npx drizzle-kit push

# 또는 migrate 사용
npx drizzle-kit migrate
```

#### DB 연결 테스트

```bash
# Node.js 스크립트로 테스트
node -e "
const postgres = require('postgres');
const sql = postgres('postgresql://budget:budget123@localhost:5432/travel_planner');
sql\`SELECT 1\`.then(() => {
  console.log('✅ DB 연결 성공');
  process.exit(0);
}).catch(err => {
  console.error('❌ DB 연결 실패:', err);
  process.exit(1);
});
"
```

---

### 2.2 개발계 (Hostinger) DB 생성

#### SSH 접속

```bash
# Hostinger 서버에 SSH 접속
ssh your-username@193.168.195.222

# 또는 VPS 접속 정보에 따라
```

#### PostgreSQL 컨테이너 접속

```bash
# 실행 중인 PostgreSQL 컨테이너 확인
docker ps | grep postgres

# PostgreSQL 컨테이너 접속
docker exec -it postgres-container psql -U budget -d budget_tracker
```

#### DB 생성

```sql
-- travel_planner DB 생성
CREATE DATABASE travel_planner;

-- 생성 확인
\l

-- DB 변경
\c travel_planner

-- 현재 DB 확인
SELECT current_database();

-- 종료
\q
```

#### 개발계 환경 변수 설정

**로컬에서 개발계로 마이그레이션 시**:

```bash
# 개발계 URL로 직접 마이그레이션
DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/travel_planner npx drizzle-kit push
```

**Vercel 환경 변수** (나중에 설정):
```env
DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/travel_planner
OPENROUTER_API_KEY=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
NODE_ENV=production
```

#### 원격 DB 연결 테스트

```bash
# 로컬에서 원격 DB 테스트
node -e "
const postgres = require('postgres');
const sql = postgres('postgresql://budget:budget123@193.168.195.222:5432/travel_planner');
sql\`SELECT 1\`.then(() => {
  console.log('✅ 원격 DB 연결 성공');
  process.exit(0);
}).catch(err => {
  console.error('❌ 원격 DB 연결 실패:', err);
  process.exit(1);
});
"
```

---

### 2.3 마이그레이션 체크리스트

#### 로컬 마이그레이션

```bash
# 1. .env.local 확인
cat .env.local

# 2. 마이그레이션 실행
npx drizzle-kit push

# 3. 테이블 생성 확인
docker exec -it budget-tracker-db psql -U budget -d travel_planner -c "\dt"

# 4. Enum 타입 확인
docker exec -it budget-tracker-db psql -U budget -d travel_planner -c "\dT+"
```

#### 개발계 마이그레이션

```bash
# 1. 환경 변수로 개발계 DB 지정
export DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/travel_planner

# 2. 마이그레이션 실행
npx drizzle-kit push

# 3. SSH로 접속하여 확인
ssh your-username@193.168.195.222
docker exec -it postgres-container psql -U budget -d travel_planner -c "\dt"
```

#### 마이그레이션 롤백 (필요 시)

```sql
-- 모든 테이블 삭제 (조심!)
DROP TABLE IF EXISTS ai_recommendations CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS itineraries CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;
DROP TABLE IF EXISTS trips CASCADE;

-- Enum 타입 삭제
DROP TYPE IF EXISTS ai_recommendation_type;
DROP TYPE IF EXISTS expense_category;
DROP TYPE IF EXISTS priority;
DROP TYPE IF EXISTS destination_category;
DROP TYPE IF EXISTS trip_status;
DROP TYPE IF EXISTS trip_type;
```

---

## 3. 빌드 자동화 및 스크립트

### 3.1 package.json 스크립트 강화

`package.json`에 다음 스크립트를 추가하세요:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",

    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",

    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:drop": "drizzle-kit drop",

    "build:analyze": "cross-env ANALYZE=true next build",
    "build:check": "npm run type-check && npm run lint && npm run build",

    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",

    "test": "echo \"No tests configured yet\" && exit 0",
    "test:e2e": "echo \"E2E tests not configured\" && exit 0"
  }
}
```

**스크립트 설명**:

| 스크립트 | 설명 |
|---------|------|
| `type-check` | TypeScript 타입 체크 (빌드 없이) |
| `type-check:watch` | 타입 체크 watch 모드 |
| `db:*` | Drizzle 데이터베이스 관리 명령어 |
| `build:analyze` | 번들 크기 분석 |
| `build:check` | 전체 빌드 검증 (타입 + Lint + 빌드) |
| `format` | Prettier 코드 포맷팅 |
| `format:check` | 포맷팅 검사만 수행 |

### 3.2 번들 분석 설정

번들 크기를 분석하려면 `@next/bundle-analyzer` 설치:

```bash
npm install -D @next/bundle-analyzer
```

`next.config.js` 수정:

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ... 기타 설정
};

module.exports = withBundleAnalyzer(nextConfig);
```

번들 분석 실행:

```bash
npm run build:analyze
```

실행 후 자동으로 브라우저에 번들 분석 리포트가 열립니다.

**최적화 목표**:
- First Load JS: < 500KB
- Recharts는 별도 청크로 분리 (dynamic import)
- 라이브러리 중복 제거

### 3.3 Git Hooks 설정

코드 품질을 자동으로 보장하기 위해 Husky + lint-staged 설정:

```bash
# Husky 및 lint-staged 설치
npm install -D husky lint-staged

# Husky 초기화
npx husky init
```

`.husky/pre-commit` 파일 생성:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint-staged
```

`package.json`에 lint-staged 설정 추가:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  },
  "scripts": {
    "prepare": "husky install"
  }
}
```

이제 `git commit` 시 자동으로:
1. ESLint로 코드 검사 및 자동 수정
2. Prettier로 코드 포맷팅
3. 타입 에러 확인 (선택적)

### 3.4 CI/CD 자동화 (선택)

GitHub Actions를 사용한 자동 빌드 검증:

`.github/workflows/ci.yml` 생성:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
```

### 3.5 빌드 검증 체크리스트

배포 전 다음 명령어를 순서대로 실행:

```bash
# 1. 타입 체크
npm run type-check

# 2. Lint 검사
npm run lint

# 3. 프로덕션 빌드
npm run build

# 4. 번들 분석 (선택)
npm run build:analyze

# 5. 로컬에서 프로덕션 모드 테스트
npm run start
```

모든 단계가 성공하면 배포 준비 완료!

---

## 4. Vercel 배포 설정

### 4.1 Vercel 프로젝트 생성

#### CLI를 통한 배포

```bash
# 1. Vercel CLI 설치 (글로벌)
npm install -g vercel

# 2. Vercel 로그인
vercel login

# 3. 프로젝트 연결 (첫 배포)
vercel

# 4. 환경 변수 설정 (대화형)
vercel env add DATABASE_URL
vercel env add OPENROUTER_API_KEY

# 5. 프로덕션 배포
vercel --prod
```

#### 대시보드를 통한 배포

1. **Vercel 대시보드** 접속: https://vercel.com
2. **New Project** 클릭
3. **Import Git Repository**: GitHub 저장소 선택
4. **Configure Project**:
   - Framework Preset: `Next.js`
   - Root Directory: `./` (프로젝트 루트)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)
   - Install Command: `npm install` (기본값)

### 4.2 환경 변수 설정

**Vercel Dashboard → Project → Settings → Environment Variables**:

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://budget:budget123@193.168.195.222:5432/travel_planner` | Production, Preview, Development |
| `OPENROUTER_API_KEY` | `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` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

**중요**:
- Production: 실제 배포 환경
- Preview: PR 미리보기
- Development: `vercel dev` 사용 시

### 4.3 빌드 설정

**vercel.json** (선택적, 기본 설정으로도 충분):
```json
{
  "buildCommand": "npm run build:check",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["icn1"]
}
```

**참고**: `buildCommand`를 `npm run build:check`로 설정하면 타입 체크 + Lint + 빌드를 한번에 실행합니다.

### 4.4 배포 확인

```bash
# 1. 빌드 성공 확인
# Vercel Dashboard → Deployments → 최신 배포 → Logs 확인

# 2. 배포된 URL 접속
# https://your-project.vercel.app

# 3. Health Check
curl https://your-project.vercel.app/api/health

# 4. DB 연결 확인
curl https://your-project.vercel.app/api/db-check
```

---

## 4. React/Next.js 배포 주의사항

### 4.1 Hydration 이슈

#### ❌ 잘못된 예: 서버/클라이언트 불일치

```tsx
// ❌ 서버와 클라이언트에서 다른 값 생성
function MyComponent() {
  const [date] = useState(new Date());

  return <div>{date.toISOString()}</div>;
}
```

**문제**: 서버에서 렌더링한 날짜와 클라이언트에서 하이드레이션할 때의 날짜가 다름.

#### ✅ 올바른 예: useEffect 사용

```tsx
// ✅ 클라이언트에서만 실행
'use client'

function MyComponent() {
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    setDate(new Date());
  }, []);

  if (!date) return <div>Loading...</div>;

  return <div>{date.toISOString()}</div>;
}
```

#### ✅ 대안: Suspense 사용

```tsx
'use client'

import { Suspense } from 'react';

function DateDisplay() {
  const date = new Date();
  return <div>{date.toISOString()}</div>;
}

export default function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DateDisplay />
    </Suspense>
  );
}
```

### 4.2 Dynamic Import (Recharts, 무거운 라이브러리)

#### ❌ 잘못된 예: SSR 사용

```tsx
// ❌ SSR 중 window 객체 접근 에러
import { LineChart, Line } from 'recharts';

export default function Chart() {
  return <LineChart data={data}>...</LineChart>;
}
```

**에러**: `ReferenceError: window is not defined`

#### ✅ 올바른 예: Dynamic Import with ssr: false

```tsx
// ✅ 클라이언트에서만 로드
'use client'

import dynamic from 'next/dynamic';

const LineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { ssr: false }
);

const Line = dynamic(
  () => import('recharts').then(mod => mod.Line),
  { ssr: false }
);

export default function Chart() {
  return (
    <LineChart data={data}>
      <Line dataKey="value" />
    </LineChart>
  );
}
```

#### ✅ 더 나은 방법: 차트 컴포넌트 분리

```tsx
// components/charts/BudgetChart.tsx
'use client'

import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

export default function BudgetChart({ data }) {
  return (
    <PieChart width={400} height={300}>
      <Pie data={data} dataKey="value" />
      <Tooltip />
      <Legend />
    </PieChart>
  );
}
```

```tsx
// app/budget/page.tsx
import dynamic from 'next/dynamic';

const BudgetChart = dynamic(() => import('@/components/charts/BudgetChart'), {
  ssr: false,
  loading: () => <div>차트 로딩 중...</div>
});

export default function BudgetPage() {
  return <BudgetChart data={budgetData} />;
}
```

### 4.3 localStorage/sessionStorage 사용

#### ❌ 잘못된 예: 직접 접근

```tsx
// ❌ SSR 중 localStorage 접근 에러
function MyComponent() {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));

  return <div>{user.name}</div>;
}
```

**에러**: `ReferenceError: localStorage is not defined`

#### ✅ 올바른 예: 클라이언트에서만 접근

```tsx
'use client'

import { useEffect, useState } from 'react';

function MyComponent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  return <div>{user.name}</div>;
}
```

#### ✅ 커스텀 훅 사용

```tsx
// hooks/useLocalStorage.ts
'use client'

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue, isLoading] as const;
}
```

```tsx
// 사용 예시
'use client'

function MyComponent() {
  const [user, setUser, isLoading] = useLocalStorage('user', null);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>No user</div>;

  return <div>{user.name}</div>;
}
```

### 4.4 환경 변수 접근

#### ❌ 잘못된 예: 클라이언트에서 서버 전용 변수 접근

```tsx
'use client'

function MyComponent() {
  // ❌ 클라이언트에서 DATABASE_URL 접근 불가
  const dbUrl = process.env.DATABASE_URL;

  return <div>{dbUrl}</div>;
}
```

#### ✅ 올바른 예: 클라이언트 변수는 NEXT_PUBLIC_ 접두사

```env
# .env.local

# 서버 전용 (클라이언트 접근 불가)
DATABASE_URL=postgresql://...
OPENROUTER_API_KEY=sk-or-v1-...

# 클라이언트 접근 가능
NEXT_PUBLIC_APP_NAME=AI Travel Planner
NEXT_PUBLIC_API_URL=https://api.example.com
```

```tsx
// 서버 컴포넌트에서만 접근 가능
export default function ServerComponent() {
  const dbUrl = process.env.DATABASE_URL; // ✅ OK

  return <div>Connected to DB</div>;
}
```

```tsx
'use client'

// 클라이언트 컴포넌트
export default function ClientComponent() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME; // ✅ OK

  return <div>{appName}</div>;
}
```

### 4.5 Image Optimization

#### ❌ 잘못된 예: 일반 img 태그

```tsx
// ❌ 최적화 없음
function MyComponent() {
  return <img src="/photo.jpg" alt="Photo" />;
}
```

#### ✅ 올바른 예: next/image 사용

```tsx
import Image from 'next/image';

function MyComponent() {
  return (
    <Image
      src="/photo.jpg"
      alt="Photo"
      width={800}
      height={600}
      quality={85}
      priority // LCP 이미지는 priority 설정
    />
  );
}
```

#### 외부 이미지 사용 시

**next.config.js**:
```js
module.exports = {
  images: {
    domains: ['example.com', 'cdn.example.com'],
    // 또는 remotePatterns 사용 (Next.js 13+)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],
  },
};
```

### 4.6 API Route 에러 처리

#### ✅ 표준 에러 응답

```typescript
// app/api/trips/route.ts

export async function GET(req: Request) {
  try {
    const trips = await db.query.trips.findMany();

    return Response.json(trips, { status: 200 });

  } catch (error) {
    console.error('GET /api/trips error:', error);

    return Response.json(
      {
        error: '여행 목록을 불러오는데 실패했습니다.',
        code: 'TRIPS_FETCH_ERROR',
      },
      { status: 500 }
    );
  }
}
```

### 4.7 Metadata (SEO)

#### Server Component Metadata

```tsx
// app/trips/page.tsx

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '여행 목록 | AI Travel Planner',
  description: 'AI 기반 여행 계획 및 일정 관리',
  openGraph: {
    title: '여행 목록',
    description: 'AI 기반 여행 계획 및 일정 관리',
    images: ['/og-image.jpg'],
  },
};

export default function TripsPage() {
  return <div>여행 목록</div>;
}
```

---

## 5. 환경별 설정 요약

### 5.1 로컬 개발 (.env.local)

```env
# Database (로컬 Docker)
DATABASE_URL=postgresql://budget:budget123@localhost:5432/travel_planner

# AI API
OPENROUTER_API_KEY=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

# Environment
NODE_ENV=development

# Public (선택)
NEXT_PUBLIC_APP_NAME=AI Travel Planner (Dev)
```

### 5.2 개발계 (Vercel Preview)

**Vercel 환경 변수**:
```env
DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/travel_planner
OPENROUTER_API_KEY=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
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=AI Travel Planner (Preview)
```

### 5.3 프로덕션 (Vercel Production)

**Vercel 환경 변수**:
```env
DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/travel_planner
OPENROUTER_API_KEY=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
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=AI Travel Planner
```

---

## 6. 배포 후 검증

### 6.1 자동 체크리스트

```bash
# 1. 빌드 성공 확인
# Vercel Dashboard → Deployments → 최신 배포 → Build Logs

# 2. 배포 URL 확인
echo "Deployment URL: https://your-project.vercel.app"

# 3. 홈페이지 로드 테스트
curl -I https://your-project.vercel.app

# 4. API Health Check
curl https://your-project.vercel.app/api/health
```

### 6.2 수동 테스트 체크리스트

#### 기본 기능

- [ ] 홈페이지 로드
- [ ] 여행 목록 페이지 접속
- [ ] 여행 생성 다이얼로그 열기
- [ ] 여행 생성 (DB 쓰기 테스트)
- [ ] 여행 상세 페이지 접속
- [ ] 일정 추가
- [ ] 지출 기록

#### AI 기능

- [ ] AI 일정 자동 생성 (5-10초 소요)
- [ ] AI 장소 추천
- [ ] AI 예산 최적화
- [ ] AI 일정 조정 제안
- [ ] AI 여행 인사이트

#### 차트 & 시각화

- [ ] 예산 차트 표시 (Recharts)
- [ ] 타임라인 뷰
- [ ] 통계 대시보드

#### 반응형

- [ ] 모바일 뷰 (< 768px)
- [ ] 태블릿 뷰 (768-1024px)
- [ ] 데스크톱 뷰 (> 1024px)

### 6.3 성능 테스트

#### Lighthouse 점수 (목표)

```bash
# Chrome DevTools → Lighthouse 실행
# 또는 CLI 사용
npm install -g lighthouse
lighthouse https://your-project.vercel.app --view
```

**목표 점수**:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

#### Core Web Vitals

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| LCP (Largest Contentful Paint) | < 2.5s | Vercel Analytics |
| FID (First Input Delay) | < 100ms | Vercel Analytics |
| CLS (Cumulative Layout Shift) | < 0.1 | Vercel Analytics |

---

## 7. 트러블슈팅

### 7.1 빌드 에러

#### 에러: "Module not found"

```bash
# 해결: 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 에러: "Type error: ..."

```bash
# 해결: 타입 체크
npm run type-check

# 또는
npx tsc --noEmit
```

#### 에러: "Cannot find module 'recharts'"

```bash
# 해결: recharts 설치
npm install recharts
```

### 7.2 데이터베이스 연결 실패

#### 에러: "Connection refused"

**원인**: DB 서버가 실행 중이 아니거나 방화벽 차단

**해결**:
```bash
# 로컬 Docker 컨테이너 확인
docker ps | grep budget-tracker-db

# 컨테이너 시작
docker start budget-tracker-db

# 원격 서버 확인
ping 193.168.195.222

# SSH 접속 테스트
ssh your-username@193.168.195.222
```

#### 에러: "Authentication failed"

**원인**: 잘못된 사용자명/비밀번호

**해결**:
```bash
# 환경 변수 확인
echo $DATABASE_URL

# 올바른 형식
postgresql://username:password@host:port/database
```

### 7.3 AI API 에러

#### 에러: "API key is invalid"

**해결**:
```bash
# 1. 환경 변수 확인
echo $OPENROUTER_API_KEY

# 2. Vercel 환경 변수 재설정
vercel env rm OPENROUTER_API_KEY
vercel env add OPENROUTER_API_KEY

# 3. 재배포
vercel --prod
```

#### 에러: "Rate limit exceeded"

**원인**: API 요청 한도 초과

**해결**:
- Open Router 대시보드에서 한도 확인
- Rate Limiting 미들웨어 추가 (ARCHITECTURE.md 참조)

### 7.4 Hydration Mismatch

#### 에러: "Text content does not match"

**원인**: 서버와 클라이언트 렌더링 불일치

**해결**:
```tsx
// ❌ 잘못된 코드
const [date] = useState(new Date());

// ✅ 수정된 코드
'use client'
const [date, setDate] = useState(null);
useEffect(() => setDate(new Date()), []);
```

### 7.5 환경 변수 누락

#### 에러: "DATABASE_URL is not defined"

**해결**:
```bash
# 로컬
# .env.local 파일 확인

# Vercel
vercel env ls
vercel env add DATABASE_URL
```

### 7.6 이미지 최적화 에러

#### 에러: "Invalid src prop"

**해결**:
```js
// next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com'],
  },
};
```

---

## 8. 배포 자동화 (선택)

### 8.1 GitHub Actions

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 8.2 Vercel for GitHub

**자동 배포 설정**:
1. Vercel Dashboard → Project → Settings → Git
2. GitHub 저장소 연결
3. Production Branch: `main`
4. 자동 배포 활성화

**PR 미리보기**:
- PR 생성 시 자동으로 Preview 배포
- PR 코멘트에 배포 URL 추가

---

## 9. 보안 체크리스트

### 배포 전 확인

- [ ] `.env.local` 파일이 `.gitignore`에 포함됨
- [ ] 민감한 정보가 코드에 하드코딩되지 않음
- [ ] API 키가 환경 변수로 관리됨
- [ ] CORS 설정 확인
- [ ] Rate Limiting 적용
- [ ] Input Validation (Zod) 적용
- [ ] SQL Injection 방지 (Drizzle ORM)
- [ ] XSS 방지 (입력 sanitization)

---

## 10. 롤백 절차

### Vercel 롤백

```bash
# 1. 이전 배포 버전 확인
vercel ls

# 2. 특정 배포로 롤백
vercel rollback [deployment-url]

# 또는 Vercel Dashboard에서
# Deployments → 이전 버전 → Promote to Production
```

### 데이터베이스 롤백

```sql
-- 마이그레이션 롤백 (수동)
-- 백업에서 복원 또는 ALTER TABLE로 되돌림

-- 예: 테이블 삭제
DROP TABLE IF EXISTS new_table;

-- 예: 컬럼 제거
ALTER TABLE trips DROP COLUMN new_column;
```

---

## 11. 모니터링 & 로깅

### Vercel Analytics

**활성화**:
1. Vercel Dashboard → Project → Analytics
2. Web Analytics 활성화

**지표**:
- 페이지 뷰
- 사용자 수
- Core Web Vitals
- 오류율

### Error Tracking (선택)

**Sentry 통합**:
```bash
# 설치
npm install @sentry/nextjs

# 설정
npx @sentry/wizard@latest -i nextjs
```

**sentry.client.config.ts**:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

---

## 12. 성능 최적화 팁

### 코드 스플리팅

```tsx
// 동적 import로 번들 크기 감소
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
});
```

### 이미지 최적화

```tsx
// WebP 형식 사용
<Image
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  quality={85}
  format="webp"
/>
```

### 캐싱 전략

```typescript
// Next.js 캐싱
export const revalidate = 3600; // 1시간마다 재검증

// fetch 캐싱
fetch(url, { next: { revalidate: 3600 } });
```

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-15
**작성자**: AI Travel Planner Team

**배포 성공을 기원합니다! 🚀**
