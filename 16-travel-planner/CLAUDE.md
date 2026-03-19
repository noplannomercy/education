# CLAUDE.md - AI Travel Planner 프로젝트 가이드

> 이 문서는 Claude가 프로젝트를 이해하고 효과적으로 작업하기 위한 가이드입니다.

---

## 📋 프로젝트 개요

**AI Travel Planner** - AI 기반 여행 계획 및 일정 관리 앱

### 핵심 기능 (12개)
1. ✅ 여행 관리 CRUD
2. ✅ 목적지 데이터베이스
3. ✅ 일정 관리
4. ✅ 예산 추적
5. ✅ 타임라인 뷰
6. ✅ 통계 대시보드 (Recharts)
7. ✅ 검색 & 필터
8. ⭐ **AI 일정 자동 생성**
9. ⭐ **AI 장소 추천**
10. ⭐ **AI 예산 최적화**
11. ⭐ **AI 일정 조정 제안**
12. ⭐ **AI 여행 인사이트**

### 주요 문서
- `docs/PRD.md` - 제품 요구사항 정의서
- `docs/ARCHITECTURE.md` - 시스템 아키텍처
- `docs/DATABASE.md` - 데이터베이스 설계
- `docs/DEPLOYMENT.md` - 배포 가이드
- `docs/UI_DESIGN.md` - UI 디자인 가이드

---

## 🛠 기술 스택

### 프론트엔드
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **State**: React hooks (useState, useEffect, useContext)

### 백엔드
- **Database**: PostgreSQL
  - 로컬: `localhost:5432/travel_planner`
  - 개발: `193.168.195.222:5432/travel_planner`
- **ORM**: Drizzle ORM
- **API**: Next.js API Routes (Server Actions)

### AI 통합
- **SDK**: AI SDK (`ai` package)
- **Provider**: Open Router
- **Model**: `anthropic/claude-haiku-4.5`
- **Features**: 5개 AI 함수 (일정 생성, 장소 추천, 예산 최적화, 일정 조정, 인사이트)

### 개발 도구
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier (선택)
- **Git**: Conventional Commits 권장

---

## 🚀 명령어

### 개발 서버
```bash
npm run dev              # 개발 서버 실행 (http://localhost:3000)
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버 실행
npm run lint             # ESLint 실행
npm run type-check       # TypeScript 타입 체크
```

### 데이터베이스
```bash
# 마이그레이션
npx drizzle-kit generate      # 마이그레이션 파일 생성
npx drizzle-kit push          # DB에 스키마 푸시
npx drizzle-kit migrate       # 마이그레이션 실행

# DB 관리 도구
npx drizzle-kit studio        # Drizzle Studio 실행 (GUI)

# DB 연결 테스트
node -e "const postgres = require('postgres'); const sql = postgres(process.env.DATABASE_URL); sql\`SELECT 1\`.then(() => console.log('✅ DB 연결 성공')).catch(err => console.error('❌ DB 연결 실패:', err));"
```

### 시드 데이터
```bash
npx tsx src/lib/db/seed.ts    # 샘플 데이터 삽입
```

---

## 📂 프로젝트 구조

```
day16-travel-planner/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (dashboard)/              # 대시보드 레이아웃 그룹
│   │   │   ├── trips/                # 여행 목록 페이지
│   │   │   ├── itinerary/            # 일정 페이지
│   │   │   ├── budget/               # 예산 페이지
│   │   │   ├── recommendations/      # AI 추천 페이지
│   │   │   └── insights/             # AI 인사이트 페이지
│   │   ├── api/                      # API Routes
│   │   │   ├── trips/                # 여행 CRUD
│   │   │   ├── itineraries/          # 일정 CRUD
│   │   │   ├── expenses/             # 지출 CRUD
│   │   │   └── ai/                   # AI 엔드포인트 ⭐
│   │   │       ├── generate-itinerary/
│   │   │       ├── recommend-places/
│   │   │       ├── optimize-budget/
│   │   │       ├── optimize-itinerary/
│   │   │       └── analyze-insights/
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   └── page.tsx                  # 홈페이지
│   │
│   ├── lib/
│   │   ├── db/                       # 데이터베이스
│   │   │   ├── schema.ts             # ⭐ Drizzle 스키마 (5개 테이블)
│   │   │   ├── index.ts              # DB 연결
│   │   │   ├── migrations/           # 마이그레이션 파일
│   │   │   └── seed.ts               # 시드 데이터
│   │   │
│   │   ├── ai/                       # ⭐ AI 서비스
│   │   │   ├── client.ts             # Open Router 클라이언트
│   │   │   ├── prompts/              # 프롬프트 템플릿
│   │   │   │   ├── itinerary.ts      # 일정 생성 프롬프트
│   │   │   │   ├── places.ts         # 장소 추천 프롬프트
│   │   │   │   ├── budget.ts         # 예산 최적화 프롬프트
│   │   │   │   ├── optimization.ts   # 일정 조정 프롬프트
│   │   │   │   └── insights.ts       # 여행 인사이트 프롬프트
│   │   │   └── services/             # AI 서비스 함수
│   │   │       ├── generateItinerary.ts
│   │   │       ├── recommendPlaces.ts
│   │   │       ├── optimizeBudget.ts
│   │   │       ├── optimizeItinerary.ts
│   │   │       └── analyzeTravelInsights.ts
│   │   │
│   │   ├── validations/              # 입력 검증
│   │   │   └── schemas.ts            # Zod 스키마
│   │   │
│   │   └── utils/                    # 유틸리티
│   │       ├── format.ts             # 날짜/금액 포맷팅
│   │       └── errors.ts             # 커스텀 에러 클래스
│   │
│   └── components/                   # UI 컴포넌트
│       ├── ui/                       # shadcn/ui 컴포넌트
│       ├── trips/                    # 여행 관련 컴포넌트
│       │   └── TripCard.tsx
│       ├── itinerary/                # 일정 관련 컴포넌트
│       │   └── TimelineItem.tsx
│       ├── budget/                   # 예산 관련 컴포넌트
│       │   └── BudgetChart.tsx
│       └── recommendations/          # AI 추천 컴포넌트
│           └── RecommendationCard.tsx
│
├── docs/                             # 문서
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── UI_DESIGN.md
│
├── .env.local                        # 환경 변수 (Git에 포함 안됨)
├── drizzle.config.ts                 # Drizzle 설정
├── next.config.js                    # Next.js 설정
├── tailwind.config.ts                # Tailwind CSS 설정
├── tsconfig.json                     # TypeScript 설정
└── CLAUDE.md                         # 이 파일
```

---

## 🔄 개발 워크플로우

### ⚠️ CRITICAL: Phase-based Workflow

**PRD Section 6 구현 계획을 반드시 따르세요:**

#### Phase 1: 프로젝트 셋업 (15분)
- [x] Next.js 프로젝트 생성
- [x] PostgreSQL 연결 (로컬 + 개발계)
- [x] Drizzle ORM 설정
- [x] shadcn/ui 설치
- [x] Recharts 설치
- [x] AI SDK + Open Router 설정

#### Phase 2: DB & 기본 CRUD (25분)
- [ ] 5개 테이블 스키마 (`src/lib/db/schema.ts`)
- [ ] Trip CRUD (`src/app/api/trips/`)
- [ ] Destination CRUD (`src/app/api/destinations/`)
- [ ] Itinerary CRUD (`src/app/api/itineraries/`)
- [ ] Expense CRUD (`src/app/api/expenses/`)

#### Phase 3: AI 기능 (35분) ⭐
- [ ] AI SDK 연동 (`src/lib/ai/client.ts`)
- [ ] 일정 자동 생성 API (`src/app/api/ai/generate-itinerary/`)
- [ ] 장소 추천 API (`src/app/api/ai/recommend-places/`)
- [ ] 예산 최적화 API (`src/app/api/ai/optimize-budget/`)
- [ ] 일정 조정 API (`src/app/api/ai/optimize-itinerary/`)
- [ ] 여행 인사이트 API (`src/app/api/ai/analyze-insights/`)

#### Phase 4: UI 구현 (30분)
- [ ] 여행 목록 탭 (`src/app/(dashboard)/trips/`)
- [ ] 일정 탭 (타임라인) (`src/app/(dashboard)/itinerary/`)
- [ ] 예산 탭 (차트) (`src/app/(dashboard)/budget/`)
- [ ] 추천 탭 (AI) (`src/app/(dashboard)/recommendations/`)
- [ ] 인사이트 탭 (AI) (`src/app/(dashboard)/insights/`)

#### Phase 5: 통합 & 테스트 (15분)
- [ ] 검색/필터 구현
- [ ] 전체 통합 테스트
- [ ] E2E 테스트 (12개 기능)

### 작업 흐름

**각 Phase마다:**

1. ✅ **Phase 완전히 완료**
   - 해당 Phase의 모든 작업 완료
   - 코드 리뷰 (자가)

2. ✅ **빌드 테스트**
   ```bash
   npm run build
   npm run type-check
   npm run lint
   ```

3. ✅ **테스트 통과 확인**
   - 빌드 에러 0
   - 타입 에러 0
   - Lint 에러 0

4. ✅ **Git 커밋**
   ```bash
   git add .
   git commit -m "Phase X complete: [설명]"
   ```

5. ✅ **IMPLEMENTATION.md 업데이트**
   - 완료된 작업 체크
   - 다음 단계 명시

6. ✅ **다음 Phase 진행**

### 🚨 금지 사항

- ❌ Phase를 건너뛰지 마세요
- ❌ 빌드 에러가 있는 상태로 다음 Phase 진행 금지
- ❌ 여러 Phase를 동시에 작업 금지
- ❌ 테스트 없이 커밋 금지

---

## 🤖 AI 통합 규칙

### IMPORTANT: Open Router 설정

**환경 변수 (.env.local)**:
```env
OPENROUTER_API_KEY=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
```

**AI 클라이언트 설정** (`src/lib/ai/client.ts`):
```typescript
import { createOpenAI } from '@ai-sdk/openai';

export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const model = openrouter('anthropic/claude-haiku-4.5');
```

### 5개 AI 함수 구현 (필수)

**PRD Section 4.3 AI 함수를 모두 구현하세요:**

#### 1. generateItinerary (일정 자동 생성)
**위치**: `src/lib/ai/services/generateItinerary.ts`

```typescript
import { generateText } from 'ai';
import { model } from '../client';
import { buildItineraryPrompt } from '../prompts/itinerary';

export async function generateItinerary(input: TripInput) {
  // 1. 입력 검증
  // 2. 프롬프트 생성
  // 3. AI 호출
  const result = await generateText({
    model,
    prompt: buildItineraryPrompt(input),
    temperature: 0.7,
  });

  // 4. JSON 파싱 & 검증
  // 5. DB 저장
  // 6. 결과 반환
}
```

#### 2. recommendPlaces (장소 추천)
**위치**: `src/lib/ai/services/recommendPlaces.ts`

#### 3. optimizeBudget (예산 최적화)
**위치**: `src/lib/ai/services/optimizeBudget.ts`

#### 4. optimizeItinerary (일정 조정)
**위치**: `src/lib/ai/services/optimizeItinerary.ts`

#### 5. analyzeTravelInsights (여행 인사이트)
**위치**: `src/lib/ai/services/analyzeTravelInsights.ts`

### YOU MUST:

✅ **AI 에러를 우아하게 처리**
```typescript
try {
  const result = await generateText({ model, prompt });
  return parseJSON(result.text);
} catch (error) {
  if (error instanceof AIServiceError) {
    // AI 서비스 에러
    return { error: 'AI 서비스 오류. 다시 시도해주세요.' };
  }
  // 예상치 못한 에러
  throw error;
}
```

✅ **로딩 상태 표시**
```tsx
const [loading, setLoading] = useState(false);

const handleGenerate = async () => {
  setLoading(true);
  try {
    const result = await generateItinerary(input);
    // 성공 처리
  } catch (error) {
    // 에러 처리
  } finally {
    setLoading(false);
  }
};
```

✅ **AI 응답 시간 고려 (5-10초)**
```tsx
<Button onClick={handleGenerate} disabled={loading}>
  {loading ? (
    <>
      <Spinner className="mr-2" />
      AI가 일정을 생성하는 중... (약 5-10초 소요)
    </>
  ) : (
    '✨ AI 일정 생성'
  )}
</Button>
```

✅ **프롬프트 템플릿 사용**

**위치**: `src/lib/ai/prompts/itinerary.ts`

```typescript
export function buildItineraryPrompt(input: TripInput): string {
  return `당신은 여행 계획 전문가입니다.

다음 정보를 바탕으로 최적의 여행 일정을 생성해주세요:

[여행 정보]
목적지: ${input.destination}
기간: ${input.startDate} ~ ${input.endDate}
예산: ${input.budget}원
인원: ${input.travelers}명

YOU MUST respond with ONLY valid JSON.
No markdown code blocks.
No preamble.
Just pure JSON.

JSON 형식:
{
  "dailyPlans": [...],
  "budgetBreakdown": {...},
  "tips": [...]
}`;
}
```

✅ **JSON 응답 검증**
```typescript
import { z } from 'zod';

const itinerarySchema = z.object({
  dailyPlans: z.array(z.object({
    date: z.string(),
    theme: z.string(),
    activities: z.array(z.object({
      time: z.string(),
      activity: z.string(),
      location: z.string(),
      estimatedCost: z.number(),
      priority: z.enum(['high', 'medium', 'low']),
    })),
  })),
  budgetBreakdown: z.object({
    transport: z.number(),
    accommodation: z.number(),
    food: z.number(),
    activities: z.number(),
  }),
  tips: z.array(z.string()),
});

// 사용
const parsed = itinerarySchema.parse(JSON.parse(result.text));
```

### ❌ 금지 사항

- ❌ AI 응답을 검증 없이 사용 금지
- ❌ 에러 핸들링 생략 금지
- ❌ 로딩 상태 없이 AI 호출 금지
- ❌ 하드코딩된 프롬프트 금지 (템플릿 사용)
- ❌ AI 응답을 동기적으로 처리 금지

---

## 💻 코딩 규칙

### TypeScript

✅ **Strict Mode 사용**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

✅ **타입 정의**
```typescript
// ✅ 올바른 예
interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
}

// ❌ 잘못된 예
const trip: any = {...}; // any 사용 금지
```

✅ **Enum 대신 Union Type**
```typescript
// ✅ 올바른 예
type TripStatus = 'planning' | 'ongoing' | 'completed';

// ❌ 잘못된 예 (불필요한 enum)
enum TripStatus {
  PLANNING = 'planning',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
}
```

### React

✅ **'use client' 디렉티브 명시**
```tsx
// 클라이언트 컴포넌트
'use client'

import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
}
```

✅ **Server Components 우선 사용**
```tsx
// 서버 컴포넌트 (기본)
export default async function TripsPage() {
  const trips = await db.query.trips.findMany();
  return <TripList trips={trips} />;
}
```

✅ **Props 타입 정의**
```tsx
interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  return <Card onClick={onClick}>...</Card>;
}
```

### Next.js

✅ **App Router 사용**
```
src/app/
├── (dashboard)/          # 레이아웃 그룹
│   ├── trips/
│   │   └── page.tsx      # /trips 경로
│   └── layout.tsx        # 공통 레이아웃
├── api/                  # API Routes
│   └── trips/
│       └── route.ts      # /api/trips 엔드포인트
└── page.tsx              # / 경로 (홈)
```

✅ **API Route 구조**
```typescript
// src/app/api/trips/route.ts

export async function GET(req: Request) {
  try {
    const trips = await db.query.trips.findMany();
    return Response.json(trips);
  } catch (error) {
    return Response.json({ error: '에러 메시지' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const trip = await db.insert(trips).values(body).returning();
    return Response.json(trip);
  } catch (error) {
    return Response.json({ error: '에러 메시지' }, { status: 400 });
  }
}
```

### Drizzle ORM

✅ **스키마 정의** (`src/lib/db/schema.ts`)
```typescript
import { pgTable, uuid, varchar, date } from 'drizzle-orm/pg-core';

export const trips = pgTable('trips', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  destination: varchar('destination', { length: 255 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
});
```

✅ **쿼리 작성**
```typescript
import { db } from '@/lib/db';
import { trips } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// SELECT
const allTrips = await db.query.trips.findMany();
const trip = await db.query.trips.findFirst({
  where: eq(trips.id, tripId),
});

// INSERT
const [newTrip] = await db
  .insert(trips)
  .values({ name: '파리 여행', destination: '파리' })
  .returning();

// UPDATE
await db
  .update(trips)
  .set({ name: '새 이름' })
  .where(eq(trips.id, tripId));

// DELETE
await db.delete(trips).where(eq(trips.id, tripId));
```

### Tailwind CSS

✅ **반응형 디자인**
```tsx
<div className="
  w-full                  /* 모바일: 전체 너비 */
  md:w-1/2                /* 태블릿: 50% 너비 */
  lg:w-1/3                /* 데스크톱: 33% 너비 */
  p-4                     /* 패딩 */
  bg-white                /* 배경색 */
  rounded-lg              /* 둥근 모서리 */
  shadow-md               /* 그림자 */
">
  콘텐츠
</div>
```

✅ **shadcn/ui 컴포넌트 사용**
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>제목</CardHeader>
  <CardContent>
    <Button variant="default">저장</Button>
  </CardContent>
</Card>
```

---

## 🛡️ 에러 핸들링

### 커스텀 에러 클래스 (`src/lib/utils/errors.ts`)

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class AIServiceError extends AppError {
  constructor(message: string) {
    super(500, message, 'AI_SERVICE_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(500, message, 'DATABASE_ERROR');
  }
}
```

### API Route 에러 처리

```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 입력 검증
    const validated = schema.parse(body);

    // 비즈니스 로직
    const result = await service(validated);

    return Response.json(result);

  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    if (error instanceof AIServiceError) {
      return Response.json(
        { error: 'AI 서비스 오류. 다시 시도하세요.', code: error.code },
        { status: 500 }
      );
    }

    // 예상치 못한 에러
    console.error('Unexpected error:', error);
    return Response.json(
      { error: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

### React 에러 바운더리 (선택)

```tsx
'use client'

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>에러가 발생했습니다.</div>;
    }

    return this.props.children;
  }
}
```

---

## 🧪 테스트 체크리스트 (PRD Section 8)

### 8.1 여행 관리
- [ ] 여행 생성/수정/삭제
- [ ] 목적지 추가
- [ ] 일정 CRUD
- [ ] 지출 기록

### 8.2 AI 기능 ⭐
- [ ] AI 일정 자동 생성 (5-10초)
- [ ] AI 장소 추천
- [ ] AI 예산 최적화
- [ ] AI 일정 조정
- [ ] AI 여행 인사이트

### 8.3 뷰
- [ ] 타임라인 표시
- [ ] 예산 차트 정확성 (Recharts)
- [ ] 검색/필터 동작

### 8.4 Edge Cases
- [ ] 예산 초과 경고
- [ ] 일정 충돌 감지
- [ ] AI API 에러 처리

---

## 📝 Git 커밋 규칙

### Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**:
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 추가
- `chore`: 빌드/설정 변경

**예시**:
```bash
git commit -m "feat(ai): implement AI itinerary generation"
git commit -m "fix(budget): correct expense calculation"
git commit -m "docs: update CLAUDE.md with AI integration rules"
```

---

## 🔍 주요 파일 위치

### 환경 변수
- `.env.local` (로컬 개발)
- Vercel 환경 변수 (프로덕션)

### 설정 파일
- `next.config.js` - Next.js 설정
- `tailwind.config.ts` - Tailwind CSS 설정
- `tsconfig.json` - TypeScript 설정
- `drizzle.config.ts` - Drizzle ORM 설정

### 데이터베이스
- `src/lib/db/schema.ts` - **5개 테이블 스키마**
- `src/lib/db/index.ts` - DB 연결
- `src/lib/db/migrations/` - 마이그레이션 파일

### AI 서비스 ⭐
- `src/lib/ai/client.ts` - Open Router 클라이언트
- `src/lib/ai/prompts/` - **프롬프트 템플릿 (5개)**
- `src/lib/ai/services/` - **AI 서비스 함수 (5개)**

### 검증
- `src/lib/validations/schemas.ts` - Zod 스키마

### 유틸리티
- `src/lib/utils/errors.ts` - 커스텀 에러 클래스
- `src/lib/utils/format.ts` - 포맷팅 함수
- `src/lib/utils/dateValidation.ts` - 날짜 검증
- `src/lib/utils/currency.ts` - 통화 변환
- `src/lib/utils/timezone.ts` - 타임존 처리
- `src/lib/utils/scheduleConflict.ts` - 일정 충돌 감지

### AI 유틸리티 ⭐
- `src/lib/ai/utils/parseJSON.ts` - **강화된 JSON 파싱**
- `src/lib/ai/utils/retry.ts` - **지수 백오프 재시도**
- `src/lib/ai/utils/rateLimit.ts` - **Rate Limiter (10 req/min)**
- `src/lib/ai/prompts/versions.ts` - **프롬프트 버전 관리**

### 타입 정의
- `src/types/api.ts` - API 응답 타입
- `src/types/enums.ts` - 통합 Enum 타입

---

## 🚨 주의사항

### DO (반드시 하세요)

#### 기본 원칙
✅ Phase-based workflow 준수
✅ 빌드 에러 0으로 유지
✅ TypeScript strict mode 사용
✅ Git 커밋 규칙 준수

#### 타입 안정성
✅ 통합 Enum 타입 사용 (`src/types/enums.ts`)
✅ API 응답에 타입 지정 (`ApiResponse<T>`)
✅ Zod 스키마로 입력 검증
✅ `z.infer<typeof schema>`로 타입 추출

#### AI 통합 ⭐
✅ `parseAIResponse()` 사용 (마크다운 제거, 후행 쉼표 처리)
✅ `retryAICall()` 사용 (최대 3회 재시도)
✅ `checkAIRateLimit()` 적용 (10 req/min)
✅ Few-shot examples 프롬프트 포함
✅ 프롬프트 버전 추적 (`addPromptMetadata()`)
✅ AI 로딩 상태 표시 (5-10초)
✅ Rate Limit 에러 시 Retry-After 헤더 반환

#### 데이터베이스
✅ Optimistic locking (`version` 필드)
✅ userId 필드로 멀티 유저 지원
✅ `$onUpdate(() => new Date())`로 자동 updatedAt
✅ Drizzle ORM 사용 (SQL Injection 방지)
✅ CASCADE DELETE 설정

#### UI/UX
✅ Recharts는 dynamic import (ssr: false)
✅ Error Boundary로 차트 래핑
✅ Loading skeleton 제공
✅ shadcn/ui 컴포넌트 사용
✅ 반응형 디자인 (모바일 우선)

#### Edge Cases
✅ 날짜 검증 (`validateDateRange()`)
✅ 일정 충돌 감지 (`detectScheduleConflicts()`)
✅ 통화 변환 지원 (`convertToKRW()`)
✅ 타임존 처리 (`toDestinationTime()`)
✅ 예산 초과 경고

### DON'T (금지 사항)

#### 기본 금지
❌ Phase 건너뛰기
❌ 빌드 에러 무시
❌ `any` 타입 사용
❌ 환경 변수 하드코딩

#### AI 통합 금지
❌ 단순 `JSON.parse()` 사용 (마크다운 처리 안됨)
❌ AI 응답 검증 생략
❌ Rate limiting 없이 AI 호출
❌ 재시도 로직 없이 AI 호출
❌ 에러 핸들링 생략
❌ 하드코딩된 프롬프트 (템플릿 사용)

#### 데이터베이스 금지
❌ 직접 SQL 쿼리 작성
❌ version 필드 없이 업데이트 (동시성 문제)
❌ updatedAt 수동 업데이트
❌ userId 없이 여행 생성

#### UI 금지
❌ localStorage SSR에서 접근
❌ Recharts SSR 활성화 (hydration error)
❌ Error Boundary 없이 차트 사용
❌ Date 객체 SSR에서 직접 생성 (hydration mismatch)

#### Edge Cases 금지
❌ 날짜 검증 생략
❌ 일정 충돌 확인 생략
❌ 통화 하드코딩 (KRW만)
❌ 타임존 무시

---

## 📞 도움 요청

막히는 부분이 있으면:

1. **문서 확인**:
   - `docs/PRD.md` - 기능 명세
   - `docs/ARCHITECTURE.md` - 아키텍처
   - `docs/DATABASE.md` - DB 설계
   - `docs/DEPLOYMENT.md` - 배포 가이드

2. **에러 로그 확인**:
   ```bash
   npm run build        # 빌드 에러
   npm run type-check   # 타입 에러
   npm run lint         # Lint 에러
   ```

3. **DB 연결 확인**:
   ```bash
   npx drizzle-kit studio  # DB GUI
   ```

4. **AI API 테스트**:
   ```bash
   curl https://openrouter.ai/api/v1/models
   ```

---

## ✅ 성공 기준 (PRD Section 9)

- ✅ 12개 피처 모두 동작
- ✅ AI 일정 생성 실용적 (5-10초)
- ✅ 예산 추적 정확
- ✅ 차트 시각화 명확 (Recharts)
- ✅ 반응형 UI (모바일/태블릿/데스크톱)
- ✅ 에러 핸들링 완벽
- ✅ 로컬/개발계 DB 분리
- ✅ Vercel 배포 성공
- ✅ 예상 시간: 120분

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-15
**작성자**: AI Travel Planner Team

**Happy Coding! 🚀**
