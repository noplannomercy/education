# AI Travel Planner - 구현 계획

> 이 문서는 프로젝트 구현을 단계별로 진행하기 위한 상세 체크리스트입니다.

**예상 소요 시간**: 120분 (2시간)

---

## ⚠️ CRITICAL: 반드시 지켜야 할 규칙

1. **Phase 순서대로 진행**: Phase 1 → 2 → 3 → 4 → 5
2. **각 Phase 완료 후 빌드 검증**: `npm run build`로 에러 0 확인
3. **빌드 성공 후 커밋**: `git commit -m "Phase X complete"`
4. **다음 Phase 진행**: 빌드 실패 시 다음 Phase 진행 금지
5. **체크리스트 업데이트**: 완료한 항목에 체크 표시

---

## Phase 1: 프로젝트 셋업 (15분)

**목표**: Next.js 14 프로젝트 생성 및 기본 설정

### 1.1 프로젝트 생성

- [ ] Next.js 14 프로젝트 생성
  ```bash
  npx create-next-app@latest day16-travel-planner
  # TypeScript: Yes
  # ESLint: Yes
  # Tailwind CSS: Yes
  # src/ directory: Yes
  # App Router: Yes
  # Turbopack: No
  # Import alias: Yes (@/*)
  ```

- [ ] 프로젝트 디렉토리 이동
  ```bash
  cd day16-travel-planner
  ```

### 1.2 의존성 설치

- [ ] 핵심 패키지 설치
  ```bash
  npm install drizzle-orm postgres drizzle-kit
  npm install ai @ai-sdk/openai
  npm install recharts
  npm install date-fns
  npm install lucide-react
  npm install zod
  npm install sonner
  ```

- [ ] 개발 의존성 설치
  ```bash
  npm install -D @types/node
  npm install -D tsx
  ```

### 1.3 shadcn/ui 설정

- [ ] shadcn/ui 초기화
  ```bash
  npx shadcn@latest init
  # Style: Default
  # Base color: Slate
  # CSS variables: Yes
  ```

- [ ] shadcn/ui 컴포넌트 설치
  ```bash
  npx shadcn@latest add button
  npx shadcn@latest add card
  npx shadcn@latest add input
  npx shadcn@latest add textarea
  npx shadcn@latest add select
  npx shadcn@latest add tabs
  npx shadcn@latest add calendar
  npx shadcn@latest add badge
  npx shadcn@latest add dialog
  npx shadcn@latest add alert
  npx shadcn@latest add toast
  npx shadcn@latest add sheet
  npx shadcn@latest add checkbox
  npx shadcn@latest add label
  ```

### 1.4 데이터베이스 생성

#### 로컬 DB

- [ ] Docker 컨테이너 확인
  ```bash
  docker ps | grep budget-tracker-db
  ```

- [ ] 컨테이너 시작 (필요시)
  ```bash
  docker start budget-tracker-db
  ```

- [ ] PostgreSQL 접속 후 DB 생성
  ```bash
  docker exec -it budget-tracker-db psql -U budget -d budget_tracker
  ```
  ```sql
  CREATE DATABASE travel_planner;
  \l
  \q
  ```

#### 개발 DB (Hostinger)

- [ ] SSH 접속
  ```bash
  ssh your-username@193.168.195.222
  ```

- [ ] PostgreSQL 컨테이너 접속 후 DB 생성
  ```bash
  docker exec -it postgres-container psql -U budget -d budget_tracker
  ```
  ```sql
  CREATE DATABASE travel_planner;
  \l
  \q
  ```

- [ ] SSH 종료
  ```bash
  exit
  ```

### 1.5 환경 변수 설정

- [ ] `.env.local` 파일 생성
  ```env
  # Database
  DATABASE_URL=postgresql://budget:budget123@localhost:5432/travel_planner

  # AI API
  OPENROUTER_API_KEY=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

  # Environment
  NODE_ENV=development
  ```

- [ ] `.gitignore` 확인 (`.env.local` 포함 확인)

### 1.6 Drizzle 설정

- [ ] `drizzle.config.ts` 파일 생성
  ```typescript
  import type { Config } from 'drizzle-kit';
  import * as dotenv from 'dotenv';

  dotenv.config({ path: '.env.local' });

  const getDatabaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return process.env.DATABASE_URL!;
    } else if (process.env.NODE_ENV === 'development') {
      return process.env.DEV_DATABASE_URL || process.env.DATABASE_URL!;
    } else {
      return process.env.DATABASE_URL || 'postgresql://budget:budget123@localhost:5432/travel_planner';
    }
  };

  export default {
    schema: './src/lib/db/schema.ts',
    out: './src/lib/db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
      url: getDatabaseUrl(),
    },
    verbose: true,
    strict: true,
  } satisfies Config;
  ```

### 1.7 디렉토리 구조 생성

- [ ] 필요한 디렉토리 생성
  ```bash
  mkdir -p src/lib/db
  mkdir -p src/lib/ai/prompts
  mkdir -p src/lib/ai/services
  mkdir -p src/lib/validations
  mkdir -p src/lib/utils
  mkdir -p src/components/trips
  mkdir -p src/components/itinerary
  mkdir -p src/components/budget
  mkdir -p src/components/recommendations
  mkdir -p src/components/charts
  mkdir -p src/app/api/trips
  mkdir -p src/app/api/destinations
  mkdir -p src/app/api/itineraries
  mkdir -p src/app/api/expenses
  mkdir -p src/app/api/ai/generate-itinerary
  mkdir -p src/app/api/ai/recommend-places
  mkdir -p src/app/api/ai/optimize-budget
  mkdir -p src/app/api/ai/optimize-itinerary
  mkdir -p src/app/api/ai/analyze-insights
  mkdir -p src/app/(dashboard)/trips
  mkdir -p src/app/(dashboard)/itinerary
  mkdir -p src/app/(dashboard)/budget
  mkdir -p src/app/(dashboard)/recommendations
  mkdir -p src/app/(dashboard)/insights
  mkdir -p docs
  ```

### 1.8 빌드 검증

- [ ] **CRITICAL: 빌드 에러 0 확인**
  ```bash
  npm run build
  ```

- [ ] 타입 체크
  ```bash
  npm run type-check
  # 또는
  npx tsc --noEmit
  ```

- [ ] Lint 체크
  ```bash
  npm run lint
  ```

### 1.9 Git 커밋

- [ ] Git 커밋
  ```bash
  git add .
  git commit -m "Phase 1 complete: Project setup with Next.js 14, shadcn/ui, and DB configuration"
  ```

### 1.10 테스트

- [ ] 개발 서버 실행
  ```bash
  npm run dev
  ```

- [ ] 브라우저에서 확인: http://localhost:3000

- [ ] DB 연결 테스트
  ```bash
  node -e "const postgres = require('postgres'); const sql = postgres(process.env.DATABASE_URL || 'postgresql://budget:budget123@localhost:5432/travel_planner'); sql\`SELECT 1\`.then(() => { console.log('✅ DB 연결 성공'); process.exit(0); }).catch(err => { console.error('❌ DB 연결 실패:', err); process.exit(1); });"
  ```

**Phase 1 완료 기준**:
- ✅ 프로젝트 생성 완료
- ✅ 모든 의존성 설치 완료
- ✅ 로컬 & 개발 DB 생성 완료
- ✅ 환경 변수 설정 완료
- ✅ 빌드 에러 0
- ✅ Git 커밋 완료

---

## Phase 2: DB & 기본 CRUD (25분)

**목표**: 데이터베이스 스키마 정의 및 기본 CRUD 구현

### 2.1 데이터베이스 스키마 작성

- [ ] `src/lib/db/schema.ts` 파일 생성

#### Enums 정의

- [ ] tripTypeEnum
  ```typescript
  export const tripTypeEnum = pgEnum('trip_type', [
    'vacation',
    'business',
    'adventure',
    'backpacking',
  ]);
  ```

- [ ] tripStatusEnum
  ```typescript
  export const tripStatusEnum = pgEnum('trip_status', [
    'planning',
    'ongoing',
    'completed',
  ]);
  ```

- [ ] destinationCategoryEnum
  ```typescript
  export const destinationCategoryEnum = pgEnum('destination_category', [
    'attraction',
    'restaurant',
    'accommodation',
    'shopping',
    'activity',
  ]);
  ```

- [ ] priorityEnum
  ```typescript
  export const priorityEnum = pgEnum('priority', [
    'high',
    'medium',
    'low',
  ]);
  ```

- [ ] expenseCategoryEnum
  ```typescript
  export const expenseCategoryEnum = pgEnum('expense_category', [
    'transport',
    'accommodation',
    'food',
    'activity',
    'shopping',
    'other',
  ]);
  ```

- [ ] aiRecommendationTypeEnum
  ```typescript
  export const aiRecommendationTypeEnum = pgEnum('ai_recommendation_type', [
    'itinerary',
    'place',
    'budget',
    'optimization',
    'insight',
  ]);
  ```

#### 테이블 정의

- [ ] `trips` 테이블 정의 (인덱스 포함)
  ```typescript
  export const trips = pgTable('trips', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 }).notNull(), // 멀티 유저 지원
    name: varchar('name', { length: 255 }).notNull(),
    destination: varchar('destination', { length: 255 }).notNull(),
    country: varchar('country', { length: 100 }).notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    budget: decimal('budget', { precision: 12, scale: 2 }).notNull().default('0'),
    actualSpent: decimal('actual_spent', { precision: 12, scale: 2 }).notNull().default('0'),
    travelers: integer('travelers').notNull().default(1),
    tripType: tripTypeEnum('trip_type').notNull(),
    status: tripStatusEnum('status').notNull().default('planning'),
    version: integer('version').notNull().default(1), // Optimistic locking
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
  }, (table) => ({
    userIdIdx: index('trips_user_id_idx').on(table.userId),
    startDateIdx: index('trips_start_date_idx').on(table.startDate),
    statusIdx: index('trips_status_idx').on(table.status),
    destinationIdx: index('trips_destination_idx').on(table.destination),
    tripTypeIdx: index('trips_trip_type_idx').on(table.tripType),
  }));
  ```

- [ ] `destinations` 테이블 정의 (인덱스 포함)

- [ ] `itineraries` 테이블 정의 (FK, 인덱스 포함)

- [ ] `expenses` 테이블 정의 (FK, 인덱스 포함)

- [ ] `ai_recommendations` 테이블 정의 (FK, 인덱스 포함)

#### Relations 정의

- [ ] tripsRelations
  ```typescript
  export const tripsRelations = relations(trips, ({ many }) => ({
    itineraries: many(itineraries),
    expenses: many(expenses),
    aiRecommendations: many(aiRecommendations),
  }));
  ```

- [ ] destinationsRelations

- [ ] itinerariesRelations

- [ ] expensesRelations

- [ ] aiRecommendationsRelations

#### Type Inference

- [ ] Select types (Trip, Destination, Itinerary, Expense, AIRecommendation)

- [ ] Insert types (NewTrip, NewDestination, NewItinerary, NewExpense, NewAIRecommendation)

- [ ] With relations types (TripWithRelations, ItineraryWithRelations)

### 2.2 TypeScript 타입 정의

#### API 타입 정의

- [ ] `src/types/api.ts` 파일 생성
  ```typescript
  import { z } from 'zod';

  // API 응답 래퍼
  export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    message?: string;
  }

  // 성공 응답
  export interface SuccessResponse<T> {
    data: T;
    message?: string;
  }

  // 에러 응답
  export interface ErrorResponse {
    error: string;
    code?: string;
    details?: unknown;
  }

  // 페이지네이션
  export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }

  // API 요청 타입
  export interface CreateTripRequest {
    name: string;
    destination: string;
    country: string;
    startDate: string;
    endDate: string;
    budget: number;
    travelers: number;
    tripType: 'vacation' | 'business' | 'adventure' | 'backpacking';
  }

  export interface UpdateTripRequest extends Partial<CreateTripRequest> {
    version: number; // Optimistic locking
  }

  // 타입 가드
  export function isErrorResponse(response: unknown): response is ErrorResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      'error' in response
    );
  }
  ```

#### 통합 Enum 타입

- [ ] `src/types/enums.ts` 파일 생성
  ```typescript
  // 단일 소스 진실 (Single Source of Truth)
  export const TRIP_TYPES = ['vacation', 'business', 'adventure', 'backpacking'] as const;
  export const TRIP_STATUSES = ['planning', 'ongoing', 'completed'] as const;
  export const DESTINATION_CATEGORIES = ['attraction', 'restaurant', 'accommodation', 'shopping', 'activity'] as const;
  export const PRIORITIES = ['high', 'medium', 'low'] as const;
  export const EXPENSE_CATEGORIES = ['transport', 'accommodation', 'food', 'activity', 'shopping', 'other'] as const;
  export const AI_RECOMMENDATION_TYPES = ['itinerary', 'place', 'budget', 'optimization', 'insight'] as const;

  // TypeScript 타입 추출
  export type TripType = typeof TRIP_TYPES[number];
  export type TripStatus = typeof TRIP_STATUSES[number];
  export type DestinationCategory = typeof DESTINATION_CATEGORIES[number];
  export type Priority = typeof PRIORITIES[number];
  export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
  export type AIRecommendationType = typeof AI_RECOMMENDATION_TYPES[number];

  // 라벨 매핑 (UI용)
  export const TRIP_TYPE_LABELS: Record<TripType, string> = {
    vacation: '휴양',
    business: '출장',
    adventure: '모험',
    backpacking: '배낭여행',
  };

  export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
    planning: '계획 중',
    ongoing: '진행 중',
    completed: '완료',
  };

  export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
    transport: '교통',
    accommodation: '숙박',
    food: '식비',
    activity: '활동',
    shopping: '쇼핑',
    other: '기타',
  };

  // Zod 스키마에서도 사용
  import { z } from 'zod';

  export const tripTypeSchema = z.enum(TRIP_TYPES);
  export const tripStatusSchema = z.enum(TRIP_STATUSES);
  export const expenseCategorySchema = z.enum(EXPENSE_CATEGORIES);
  ```

- [ ] `src/lib/db/schema.ts`에서 새로운 enum 타입 import 사용
  ```typescript
  import { TRIP_TYPES, TRIP_STATUSES, EXPENSE_CATEGORIES, /* ... */ } from '@/types/enums';

  export const tripTypeEnum = pgEnum('trip_type', TRIP_TYPES);
  export const tripStatusEnum = pgEnum('trip_status', TRIP_STATUSES);
  // ... 나머지 enums도 동일하게
  ```

### 2.3 데이터베이스 연결

- [ ] `src/lib/db/index.ts` 파일 생성
  ```typescript
  import { drizzle } from 'drizzle-orm/postgres-js';
  import postgres from 'postgres';
  import * as schema from './schema';

  const getDatabaseUrl = (): string => {
    const env = process.env.NODE_ENV;

    if (env === 'production') {
      return process.env.DATABASE_URL!;
    } else if (env === 'development') {
      return process.env.DEV_DATABASE_URL || process.env.DATABASE_URL!;
    } else {
      return process.env.DATABASE_URL || 'postgresql://budget:budget123@localhost:5432/travel_planner';
    }
  };

  const connectionString = getDatabaseUrl();
  const client = postgres(connectionString, {
    max: process.env.NODE_ENV === 'production' ? 10 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  export const db = drizzle(client, { schema });

  export async function checkDatabaseConnection(): Promise<boolean> {
    try {
      await client`SELECT 1`;
      console.log('✅ Database connected');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }
  ```

### 2.3 마이그레이션

#### 로컬 DB 마이그레이션

- [ ] 마이그레이션 파일 생성
  ```bash
  npx drizzle-kit generate
  ```

- [ ] 마이그레이션 실행
  ```bash
  npx drizzle-kit push
  ```

- [ ] Drizzle Studio로 확인
  ```bash
  npx drizzle-kit studio
  ```
  - 브라우저에서 https://local.drizzle.studio 접속
  - 5개 테이블 생성 확인
  - Enums 확인

#### 개발 DB 마이그레이션

- [ ] 개발 DB로 마이그레이션
  ```bash
  DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/travel_planner npx drizzle-kit push
  ```

### 2.5 Server Actions 작성

#### Trips CRUD

- [ ] `src/app/api/trips/route.ts` 파일 생성

- [ ] GET (목록 조회)
  ```typescript
  import { db } from '@/lib/db';
  import { trips } from '@/lib/db/schema';
  import type { ApiResponse, SuccessResponse } from '@/types/api';
  import type { Trip } from '@/lib/db/schema';

  export async function GET(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get('userId') || 'default-user'; // TODO: 인증 구현 후 실제 userId 사용

      const tripsList = await db.query.trips.findMany({
        where: (trips, { eq }) => eq(trips.userId, userId),
        orderBy: (trips, { desc }) => [desc(trips.startDate)],
      });

      return Response.json<SuccessResponse<Trip[]>>({ data: tripsList });
    } catch (error) {
      console.error('GET /api/trips error:', error);
      return Response.json<ApiResponse>({ error: '여행 목록 조회 실패' }, { status: 500 });
    }
  }
  ```

- [ ] POST (생성)
  ```typescript
  import { z } from 'zod';
  import { tripTypeSchema } from '@/types/enums';

  const createTripSchema = z.object({
    name: z.string().min(1).max(255),
    destination: z.string().min(1).max(255),
    country: z.string().min(1).max(100),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    budget: z.number().min(0),
    travelers: z.number().int().min(1).max(100),
    tripType: tripTypeSchema,
  }).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
    message: '종료일은 시작일 이후여야 합니다',
    path: ['endDate'],
  });

  export async function POST(req: Request) {
    try {
      const body = await req.json();
      const validated = createTripSchema.parse(body);

      // TODO: 인증 구현 후 실제 userId 사용
      const userId = 'default-user';

      const [trip] = await db.insert(trips).values({
        ...validated,
        userId,
      }).returning();

      return Response.json<SuccessResponse<Trip>>({ data: trip }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json<ApiResponse>({
          error: '입력 데이터 검증 실패',
          details: error.errors,
        }, { status: 400 });
      }
      console.error('POST /api/trips error:', error);
      return Response.json<ApiResponse>({ error: '여행 생성 실패' }, { status: 400 });
    }
  }
  ```

- [ ] `src/app/api/trips/[id]/route.ts` 파일 생성

- [ ] GET (단일 조회)

- [ ] PUT (수정 - Optimistic Locking 포함)
  ```typescript
  import { eq, and } from 'drizzle-orm';

  export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const body = await req.json();
      const { version, ...updates } = body;

      if (typeof version !== 'number') {
        return Response.json<ApiResponse>({
          error: 'version 필드가 필요합니다',
        }, { status: 400 });
      }

      // Optimistic locking: version 확인
      const [updated] = await db
        .update(trips)
        .set({
          ...updates,
          version: version + 1,
        })
        .where(and(
          eq(trips.id, params.id),
          eq(trips.version, version)
        ))
        .returning();

      if (!updated) {
        return Response.json<ApiResponse>({
          error: '다른 사용자가 이미 수정했습니다. 새로고침 후 다시 시도하세요.',
          code: 'CONFLICT',
        }, { status: 409 });
      }

      return Response.json<SuccessResponse<Trip>>({ data: updated });
    } catch (error) {
      console.error('PUT /api/trips/[id] error:', error);
      return Response.json<ApiResponse>({ error: '여행 수정 실패' }, { status: 400 });
    }
  }
  ```

- [ ] DELETE (삭제)

#### Destinations CRUD

- [ ] `src/app/api/destinations/route.ts` 파일 생성

- [ ] GET, POST 구현 (API 타입 사용)

- [ ] `src/app/api/destinations/[id]/route.ts` 파일 생성

- [ ] GET, PUT, DELETE 구현

#### Itineraries CRUD

- [ ] `src/app/api/itineraries/route.ts` 파일 생성

- [ ] GET (여행별 일정 조회), POST 구현 (API 타입 사용)

- [ ] `src/app/api/itineraries/[id]/route.ts` 파일 생성

- [ ] GET, PUT, DELETE 구현

#### Expenses CRUD

- [ ] `src/app/api/expenses/route.ts` 파일 생성

- [ ] GET (여행별 지출 조회), POST 구현 (API 타입 사용)

- [ ] `src/app/api/expenses/[id]/route.ts` 파일 생성

- [ ] GET, PUT, DELETE 구현

### 2.6 유틸리티 함수

- [ ] `src/lib/utils/errors.ts` 파일 생성
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

  export class DatabaseError extends AppError {
    constructor(message: string) {
      super(500, message, 'DATABASE_ERROR');
    }
  }
  ```

- [ ] `src/lib/utils/format.ts` 파일 생성
  ```typescript
  import { format } from 'date-fns';
  import { ko } from 'date-fns/locale';

  export function formatDate(date: Date | string): string {
    return format(new Date(date), 'yyyy.MM.dd', { locale: ko });
  }

  export function formatCurrency(amount: number): string {
    return `₩${amount.toLocaleString('ko-KR')}`;
  }

  export function formatTime(time: string): string {
    return time.substring(0, 5); // "HH:MM"
  }
  ```

### 2.7 빌드 검증

- [ ] **CRITICAL: 빌드 에러 0 확인**
  ```bash
  npm run build
  ```

- [ ] 타입 체크
  ```bash
  npx tsc --noEmit
  ```

### 2.8 Git 커밋

- [ ] Git 커밋
  ```bash
  git add .
  git commit -m "Phase 2 complete: Database schema and basic CRUD APIs"
  ```

### 2.9 테스트

- [ ] Drizzle Studio에서 테이블 확인
  ```bash
  npx drizzle-kit studio
  ```

- [ ] API 테스트 (Thunder Client, Postman, curl)
  ```bash
  # 여행 생성
  curl -X POST http://localhost:3000/api/trips \
    -H "Content-Type: application/json" \
    -d '{
      "name": "파리 여행",
      "destination": "파리",
      "country": "프랑스",
      "startDate": "2026-03-15",
      "endDate": "2026-03-20",
      "budget": "2500000",
      "travelers": 2,
      "tripType": "vacation"
    }'

  # 여행 목록 조회
  curl http://localhost:3000/api/trips
  ```

**Phase 2 완료 기준**:
- ✅ 5개 테이블 스키마 완료
- ✅ 로컬 & 개발 DB 마이그레이션 완료
- ✅ CRUD API 4개 완료 (trips, destinations, itineraries, expenses)
- ✅ 빌드 에러 0
- ✅ Git 커밋 완료

---

## Phase 3: AI 기능 (35분)

**목표**: 5개 AI 함수 구현 및 API 엔드포인트 생성

### 3.1 AI SDK 설정

- [ ] `src/lib/ai/client.ts` 파일 생성
  ```typescript
  import { createOpenAI } from '@ai-sdk/openai';

  export const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  export const model = openrouter('anthropic/claude-haiku-4.5');
  ```

### 3.2 AI 유틸리티 함수

#### JSON 파싱 유틸리티

- [ ] `src/lib/ai/utils/parseJSON.ts` 파일 생성
  ```typescript
  import { z } from 'zod';

  /**
   * AI 응답에서 JSON을 추출하고 검증
   * - 마크다운 코드 블록 제거
   * - 후행 쉼표 제거
   * - 따옴표 정규화
   */
  export function parseAIResponse<T>(
    text: string,
    schema: z.ZodSchema<T>
  ): T {
    let cleaned = text.trim();

    // 1. 마크다운 코드 블록 제거
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = cleaned.match(jsonBlockRegex);
    if (match) {
      cleaned = match[1].trim();
    }

    // 2. 프리앰블 제거 (JSON 앞의 텍스트)
    const jsonStartIndex = cleaned.indexOf('{') !== -1 ? cleaned.indexOf('{') : cleaned.indexOf('[');
    if (jsonStartIndex > 0) {
      cleaned = cleaned.substring(jsonStartIndex);
    }

    // 3. JSON 끝 이후 텍스트 제거
    const jsonEndIndex = cleaned.lastIndexOf('}') !== -1 ? cleaned.lastIndexOf('}') : cleaned.lastIndexOf(']');
    if (jsonEndIndex !== -1 && jsonEndIndex < cleaned.length - 1) {
      cleaned = cleaned.substring(0, jsonEndIndex + 1);
    }

    // 4. 후행 쉼표 제거
    cleaned = cleaned
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');

    // 5. 작은따옴표를 큰따옴표로 변환 (JSON 표준)
    // 주의: 문자열 내부의 작은따옴표는 보존
    cleaned = cleaned.replace(/'/g, '"');

    // 6. 파싱 시도
    try {
      const parsed = JSON.parse(cleaned);
      return schema.parse(parsed);
    } catch (error) {
      console.error('JSON 파싱 실패:', {
        original: text.substring(0, 500),
        cleaned: cleaned.substring(0, 500),
        error,
      });
      throw new Error(`AI 응답을 파싱하는데 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 안전한 JSON 파싱 (에러 시 기본값 반환)
   */
  export function parseAIResponseSafe<T>(
    text: string,
    schema: z.ZodSchema<T>,
    defaultValue: T
  ): T {
    try {
      return parseAIResponse(text, schema);
    } catch (error) {
      console.error('JSON 파싱 실패, 기본값 반환:', error);
      return defaultValue;
    }
  }
  ```

#### 재시도 유틸리티

- [ ] `src/lib/ai/utils/retry.ts` 파일 생성
  ```typescript
  /**
   * 지수 백오프를 사용한 재시도 로직
   */
  export async function retryWithExponentialBackoff<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      initialDelayMs?: number;
      maxDelayMs?: number;
      backoffFactor?: number;
      onRetry?: (error: Error, attempt: number) => void;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelayMs = 1000,
      maxDelayMs = 10000,
      backoffFactor = 2,
      onRetry,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          throw lastError;
        }

        // 재시도 가능한 에러인지 확인
        if (!isRetriableError(lastError)) {
          throw lastError;
        }

        // 지수 백오프 계산
        const delay = Math.min(
          initialDelayMs * Math.pow(backoffFactor, attempt),
          maxDelayMs
        );

        console.warn(`재시도 ${attempt + 1}/${maxRetries} (${delay}ms 대기):`, lastError.message);

        if (onRetry) {
          onRetry(lastError, attempt + 1);
        }

        await sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * 재시도 가능한 에러인지 확인
   */
  function isRetriableError(error: Error): boolean {
    const retriableMessages = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'rate limit',
      'too many requests',
      '429',
      '503',
      '502',
      'network',
      'timeout',
    ];

    const message = error.message.toLowerCase();
    return retriableMessages.some(msg => message.includes(msg));
  }

  function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * AI 호출 전용 재시도 래퍼
   */
  export async function retryAICall<T>(
    fn: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return retryWithExponentialBackoff(fn, {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      onRetry: (error, attempt) => {
        console.warn(`[${operationName}] 재시도 ${attempt}/3:`, error.message);
      },
    });
  }
  ```

#### Rate Limiting 유틸리티

- [ ] `src/lib/ai/utils/rateLimit.ts` 파일 생성
  ```typescript
  /**
   * LRU 캐시 기반 Rate Limiter
   * 메모리에서 요청 횟수 추적
   */
  class RateLimiter {
    private requests: Map<string, number[]> = new Map();
    private readonly maxRequests: number;
    private readonly windowMs: number;

    constructor(maxRequests: number = 10, windowMs: number = 60000) {
      this.maxRequests = maxRequests;
      this.windowMs = windowMs;
    }

    /**
     * Rate limit 확인
     * @returns true면 허용, false면 거부
     */
    checkLimit(key: string): boolean {
      const now = Date.now();
      const userRequests = this.requests.get(key) || [];

      // 윈도우 밖의 요청 제거
      const validRequests = userRequests.filter(
        timestamp => now - timestamp < this.windowMs
      );

      if (validRequests.length >= this.maxRequests) {
        return false;
      }

      // 새 요청 추가
      validRequests.push(now);
      this.requests.set(key, validRequests);

      // 메모리 정리 (1000개 이상 키가 쌓이면 오래된 것 제거)
      if (this.requests.size > 1000) {
        this.cleanup();
      }

      return true;
    }

    /**
     * 다음 요청 가능 시간 (ms)
     */
    getRetryAfter(key: string): number {
      const now = Date.now();
      const userRequests = this.requests.get(key) || [];
      const validRequests = userRequests.filter(
        timestamp => now - timestamp < this.windowMs
      );

      if (validRequests.length === 0) {
        return 0;
      }

      const oldestRequest = Math.min(...validRequests);
      return Math.max(0, this.windowMs - (now - oldestRequest));
    }

    /**
     * 오래된 키 정리
     */
    private cleanup() {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, timestamps] of this.requests.entries()) {
        const validRequests = timestamps.filter(
          timestamp => now - timestamp < this.windowMs
        );

        if (validRequests.length === 0) {
          keysToDelete.push(key);
        } else {
          this.requests.set(key, validRequests);
        }
      }

      keysToDelete.forEach(key => this.requests.delete(key));
    }

    reset(key: string) {
      this.requests.delete(key);
    }
  }

  // AI API용 Rate Limiter (10 요청/분)
  export const aiRateLimiter = new RateLimiter(10, 60000);

  /**
   * Rate limit 미들웨어
   */
  export function checkAIRateLimit(userId: string): {
    allowed: boolean;
    retryAfter?: number;
  } {
    const allowed = aiRateLimiter.checkLimit(userId);

    if (!allowed) {
      const retryAfter = Math.ceil(aiRateLimiter.getRetryAfter(userId) / 1000);
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }
  ```

#### 프롬프트 버전 관리

- [ ] `src/lib/ai/prompts/versions.ts` 파일 생성
  ```typescript
  /**
   * AI 프롬프트 버전 관리
   * 프롬프트 변경 이력 추적 및 A/B 테스트 지원
   */
  export const PROMPT_VERSIONS = {
    itinerary: {
      current: 'v1.0',
      versions: {
        'v1.0': {
          date: '2026-01-15',
          description: '초기 버전 - 날짜별 일정, 예산 배분, 우선순위',
          changes: [],
        },
      },
    },
    places: {
      current: 'v1.0',
      versions: {
        'v1.0': {
          date: '2026-01-15',
          description: '초기 버전 - 필수 방문지, 숨은 명소, 레스토랑 추천',
          changes: [],
        },
      },
    },
    budget: {
      current: 'v1.0',
      versions: {
        'v1.0': {
          date: '2026-01-15',
          description: '초기 버전 - 지출 분석, 절약 제안, 재배분 계획',
          changes: [],
        },
      },
    },
    optimization: {
      current: 'v1.0',
      versions: {
        'v1.0': {
          date: '2026-01-15',
          description: '초기 버전 - 일정 충돌 감지, 이동 시간 최적화',
          changes: [],
        },
      },
    },
    insights: {
      current: 'v1.0',
      versions: {
        'v1.0': {
          date: '2026-01-15',
          description: '초기 버전 - 여행 스타일 분석, 패턴 인식',
          changes: [],
        },
      },
    },
  } as const;

  /**
   * 프롬프트 메타데이터 추가
   */
  export function addPromptMetadata(promptType: keyof typeof PROMPT_VERSIONS): {
    version: string;
    timestamp: string;
  } {
    const config = PROMPT_VERSIONS[promptType];
    return {
      version: config.current,
      timestamp: new Date().toISOString(),
    };
  }
  ```

### 3.3 AI 프롬프트 템플릿 작성

#### 1. 일정 생성 프롬프트

- [ ] `src/lib/ai/prompts/itinerary.ts` 파일 생성
  ```typescript
  import { addPromptMetadata } from './versions';

  export function buildItineraryPrompt(input: {
    destination: string;
    startDate: string;
    endDate: string;
    days: number;
    budget: number;
    travelers: number;
    preferences: string[];
  }): string {
    const metadata = addPromptMetadata('itinerary');

    return `당신은 여행 계획 전문가입니다.

  다음 정보를 바탕으로 최적의 여행 일정을 생성해주세요:

  [여행 정보]
  목적지: ${input.destination}
  기간: ${input.startDate} ~ ${input.endDate} (${input.days}일)
  예산: ${input.budget}원
  인원: ${input.travelers}명
  선호도: ${input.preferences.join(', ')}

  요구사항:
  1. 날짜별 일정 (활동, 시간, 장소, 예상 비용)
  2. 이동 시간 고려 (활동 간 30분-1시간 여유 확보)
  3. 예산 배분 (교통, 숙박, 식비, 활동)
  4. 체력 분산 (피곤하지 않게, 하루 3-5개 활동 권장)
  5. 우선순위 설정 (high: 필수, medium: 권장, low: 선택)
  6. 실용적인 팁

  # 예시 1 (도쿄 3일):
  입력:
  - 목적지: 도쿄
  - 기간: 2026-03-15 ~ 2026-03-17 (3일)
  - 예산: 1000000원
  - 인원: 2명
  - 선호도: 미술관, 카페, 야경

  출력:
  {
    "dailyPlans": [
      {
        "date": "2026-03-15",
        "theme": "도심 문화 탐방",
        "activities": [
          {
            "time": "09:00-11:30",
            "activity": "센소지 참배 및 나카미세 쇼핑",
            "location": "아사쿠사 센소지",
            "estimatedCost": 20000,
            "priority": "high",
            "tips": "아침 일찍 가면 사람이 적음. 오마모리(부적) 추천"
          },
          {
            "time": "12:00-13:30",
            "activity": "전통 소바 맛집 점심",
            "location": "나카미세 거리",
            "estimatedCost": 30000,
            "priority": "medium",
            "tips": "츠유(소스)는 3분의 1만 적셔 먹기"
          },
          {
            "time": "14:30-17:00",
            "activity": "우에노 국립박물관",
            "location": "우에노 공원",
            "estimatedCost": 12000,
            "priority": "high",
            "tips": "월요일 휴관. 사전 예약 권장"
          },
          {
            "time": "18:00-20:00",
            "activity": "도쿄 스카이트리 야경",
            "location": "오시아게",
            "estimatedCost": 50000,
            "priority": "high",
            "tips": "일몰 1시간 전 입장 추천. 해질녘 → 야경 함께 감상"
          }
        ],
        "totalCost": 112000,
        "notes": "걸음 많으니 편한 신발 필수. 교통카드(Suica) 충전 권장"
      },
      {
        "date": "2026-03-16",
        "theme": "현대 예술과 카페 투어",
        "activities": [
          {
            "time": "10:00-12:30",
            "activity": "모리 미술관",
            "location": "롯폰기 힐스 53층",
            "estimatedCost": 38000,
            "priority": "high",
            "tips": "도쿄 시티뷰 입장권 포함. 360도 파노라마"
          },
          {
            "time": "13:00-14:30",
            "activity": "블루 보틀 커피",
            "location": "롯폰기점",
            "estimatedCost": 20000,
            "priority": "medium",
            "tips": "핸드드립 추천. 점심시간 피하면 대기 짧음"
          },
          {
            "time": "15:00-17:30",
            "activity": "팀랩 보더리스",
            "location": "오다이바",
            "estimatedCost": 70000,
            "priority": "high",
            "tips": "사전 예약 필수. 어두운 복장 추천. 2-3시간 소요"
          },
          {
            "time": "18:30-20:00",
            "activity": "오다이바 해변 산책 및 저녁",
            "location": "오다이바 해변 공원",
            "estimatedCost": 50000,
            "priority": "medium",
            "tips": "레인보우 브릿지 야경 촬영 명소"
          }
        ],
        "totalCost": 178000,
        "notes": "팀랩은 체력 소모 많음. 중간에 휴식 권장"
      }
    ],
    "budgetBreakdown": {
      "transport": 100000,
      "accommodation": 300000,
      "food": 250000,
      "activities": 350000
    },
    "tips": [
      "JR 패스 구매 시 교통비 30% 절약 가능",
      "편의점 ATM에서 현금 인출 가능 (수수료 약 200엔)",
      "구글맵 오프라인 지도 다운로드 필수",
      "식당은 점심이 저녁보다 30-50% 저렴"
    ]
  }

  이제 위 예시를 참고하여 입력된 여행 정보로 일정을 생성하세요.

  CRITICAL RULES:
  1. YOU MUST respond with ONLY valid JSON
  2. NO markdown code blocks (no \`\`\`json)
  3. NO explanatory text before or after JSON
  4. Just pure, valid JSON starting with { and ending with }

  Respond now with JSON:`;
  }
  ```

#### 2. 장소 추천 프롬프트

- [ ] `src/lib/ai/prompts/places.ts` 파일 생성

#### 3. 예산 최적화 프롬프트

- [ ] `src/lib/ai/prompts/budget.ts` 파일 생성

#### 4. 일정 조정 프롬프트

- [ ] `src/lib/ai/prompts/optimization.ts` 파일 생성

#### 5. 여행 인사이트 프롬프트

- [ ] `src/lib/ai/prompts/insights.ts` 파일 생성

### 3.3 Zod 스키마 (입력/출력 검증)

- [ ] `src/lib/validations/schemas.ts` 파일 생성

- [ ] AI 입력 스키마
  ```typescript
  import { z } from 'zod';

  export const aiItineraryInputSchema = z.object({
    tripId: z.string().uuid(),
    destination: z.string().min(1).max(100),
    startDate: z.string(),
    endDate: z.string(),
    budget: z.number().min(0),
    travelers: z.number().int().min(1).max(100),
    preferences: z.array(z.string()).max(10),
  });
  ```

- [ ] AI 응답 스키마
  ```typescript
  export const aiItineraryResponseSchema = z.object({
    dailyPlans: z.array(z.object({
      date: z.string(),
      theme: z.string(),
      activities: z.array(z.object({
        time: z.string(),
        activity: z.string(),
        location: z.string(),
        estimatedCost: z.number().min(0),
        priority: z.enum(['high', 'medium', 'low']),
        tips: z.string().optional(),
      })),
      totalCost: z.number().min(0),
      notes: z.string().optional(),
    })),
    budgetBreakdown: z.object({
      transport: z.number().min(0),
      accommodation: z.number().min(0),
      food: z.number().min(0),
      activities: z.number().min(0),
    }),
    tips: z.array(z.string()),
  });
  ```

### 3.4 AI 서비스 함수 구현

#### 1. generateItinerary

- [ ] `src/lib/ai/services/generateItinerary.ts` 파일 생성
  ```typescript
  import { generateText } from 'ai';
  import { model } from '../client';
  import { buildItineraryPrompt } from '../prompts/itinerary';
  import { parseAIResponse } from '../utils/parseJSON';
  import { retryAICall } from '../utils/retry';
  import { checkAIRateLimit } from '../utils/rateLimit';
  import { aiItineraryInputSchema, aiItineraryResponseSchema } from '@/lib/validations/schemas';
  import { db } from '@/lib/db';
  import { aiRecommendations } from '@/lib/db/schema';
  import { RateLimitError } from '@/lib/utils/errors';

  export async function generateItinerary(input: unknown) {
    // 1. 입력 검증
    const validated = aiItineraryInputSchema.parse(input);

    // 2. Rate Limiting 확인
    const userId = 'default-user'; // TODO: 인증 구현 후 실제 userId 사용
    const rateLimitCheck = checkAIRateLimit(userId);

    if (!rateLimitCheck.allowed) {
      throw new RateLimitError(
        `요청 한도를 초과했습니다. ${rateLimitCheck.retryAfter}초 후 다시 시도하세요.`
      );
    }

    // 3. 프롬프트 생성
    const days = Math.ceil(
      (new Date(validated.endDate).getTime() - new Date(validated.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    const prompt = buildItineraryPrompt({
      ...validated,
      days,
    });

    // 4. AI 호출 (재시도 로직 포함)
    const result = await retryAICall(async () => {
      return await generateText({
        model,
        prompt,
        temperature: 0.7,
        maxTokens: 4000,
      });
    }, 'generateItinerary');

    // 5. JSON 파싱 & 검증 (향상된 파서 사용)
    const parsed = parseAIResponse(result.text, aiItineraryResponseSchema);

    // 6. DB 저장
    await db.insert(aiRecommendations).values({
      tripId: validated.tripId,
      type: 'itinerary',
      title: 'AI 일정 생성',
      content: JSON.stringify(parsed),
      metadata: {
        model: 'anthropic/claude-haiku-4.5',
        tokensUsed: result.usage?.totalTokens || 0,
        promptVersion: 'v1.0',
        generatedAt: new Date().toISOString(),
      },
    });

    // 7. 결과 반환
    return parsed;
  }
  ```

#### 2. recommendPlaces

- [ ] `src/lib/ai/services/recommendPlaces.ts` 파일 생성
  - generateItinerary와 동일한 패턴 적용:
    - `parseAIResponse` 사용
    - `retryAICall` 사용
    - `checkAIRateLimit` 사용
    - 프롬프트에 few-shot 예시 추가
    - metadata에 promptVersion 저장

#### 3. optimizeBudget

- [ ] `src/lib/ai/services/optimizeBudget.ts` 파일 생성
  - 동일한 유틸리티 패턴 적용

#### 4. optimizeItinerary

- [ ] `src/lib/ai/services/optimizeItinerary.ts` 파일 생성
  - 동일한 유틸리티 패턴 적용

#### 5. analyzeTravelInsights

- [ ] `src/lib/ai/services/analyzeTravelInsights.ts` 파일 생성
  - 동일한 유틸리티 패턴 적용

**참고**: 모든 AI 서비스 함수는 위 generateItinerary와 동일한 구조를 따라야 합니다:
1. Zod 입력 검증
2. Rate limiting 확인
3. 프롬프트 생성 (few-shot 예시 포함)
4. AI 호출 (재시도 로직)
5. 향상된 JSON 파싱
6. DB 저장 (metadata 포함)
7. 결과 반환

### 3.5 AI API 엔드포인트 생성

#### 1. 일정 생성 API

- [ ] `src/app/api/ai/generate-itinerary/route.ts` 파일 생성
  ```typescript
  import { generateItinerary } from '@/lib/ai/services/generateItinerary';
  import { RateLimitError, ValidationError, AIServiceError } from '@/lib/utils/errors';
  import type { ApiResponse, SuccessResponse } from '@/types/api';
  import { z } from 'zod';

  export async function POST(req: Request) {
    try {
      const body = await req.json();
      const result = await generateItinerary(body);

      return Response.json<SuccessResponse<typeof result>>({
        data: result,
        message: 'AI 일정이 성공적으로 생성되었습니다.',
      });
    } catch (error) {
      console.error('[AI API] generate-itinerary error:', error);

      // Rate Limit 에러
      if (error instanceof RateLimitError) {
        return Response.json<ApiResponse>(
          {
            error: error.message,
            code: 'RATE_LIMIT_ERROR',
          },
          {
            status: 429,
            headers: {
              'Retry-After': error.message.match(/\d+/)?.[0] || '60',
            },
          }
        );
      }

      // 입력 검증 에러 (Zod)
      if (error instanceof z.ZodError) {
        return Response.json<ApiResponse>(
          {
            error: '입력 데이터 검증 실패',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
          { status: 400 }
        );
      }

      // JSON 파싱 에러
      if (error instanceof Error && error.message.includes('파싱')) {
        return Response.json<ApiResponse>(
          {
            error: 'AI 응답을 처리하는데 실패했습니다. 다시 시도해주세요.',
            code: 'PARSING_ERROR',
          },
          { status: 500 }
        );
      }

      // 일반 AI 서비스 에러
      if (error instanceof AIServiceError) {
        return Response.json<ApiResponse>(
          {
            error: error.message,
            code: 'AI_SERVICE_ERROR',
          },
          { status: 500 }
        );
      }

      // 알 수 없는 에러
      return Response.json<ApiResponse>(
        {
          error: 'AI 일정 생성 중 오류가 발생했습니다.',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  }
  ```

#### 2. 장소 추천 API

- [ ] `src/app/api/ai/recommend-places/route.ts` 파일 생성
  - 동일한 에러 핸들링 패턴 적용
  - Rate Limiting, Zod validation, AI 에러 모두 처리

#### 3. 예산 최적화 API

- [ ] `src/app/api/ai/optimize-budget/route.ts` 파일 생성
  - 동일한 에러 핸들링 패턴 적용

#### 4. 일정 조정 API

- [ ] `src/app/api/ai/optimize-itinerary/route.ts` 파일 생성
  - 동일한 에러 핸들링 패턴 적용

#### 5. 여행 인사이트 API

- [ ] `src/app/api/ai/analyze-insights/route.ts` 파일 생성
  - 동일한 에러 핸들링 패턴 적용

**참고**: 모든 AI API는 위 generate-itinerary와 동일한 에러 핸들링을 적용해야 합니다:
- RateLimitError → 429 상태 코드, Retry-After 헤더
- ZodError → 400 상태 코드, 검증 에러 상세 정보
- 파싱 에러 → 500 상태 코드, 재시도 안내
- AIServiceError → 500 상태 코드
- 모든 응답에 ApiResponse 타입 사용

### 3.6 에러 핸들링

- [ ] `src/lib/utils/errors.ts`에 AIServiceError 추가
  ```typescript
  export class AIServiceError extends AppError {
    constructor(message: string) {
      super(500, message, 'AI_SERVICE_ERROR');
    }
  }

  export class RateLimitError extends AppError {
    constructor(message: string) {
      super(429, message, 'RATE_LIMIT_ERROR');
    }
  }
  ```

### 3.7 빌드 검증

- [ ] **CRITICAL: 빌드 에러 0 확인**
  ```bash
  npm run build
  ```

- [ ] 타입 체크
  ```bash
  npx tsc --noEmit
  ```

### 3.8 Git 커밋

- [ ] Git 커밋
  ```bash
  git add .
  git commit -m "Phase 3 complete: AI features with 5 functions implemented"
  ```

### 3.9 테스트

- [ ] AI API 테스트 (curl)
  ```bash
  curl -X POST http://localhost:3000/api/ai/generate-itinerary \
    -H "Content-Type: application/json" \
    -d '{
      "tripId": "trip-uuid-here",
      "destination": "파리",
      "startDate": "2026-03-15",
      "endDate": "2026-03-20",
      "budget": 2500000,
      "travelers": 2,
      "preferences": ["미술관", "카페", "야경"]
    }'
  ```

- [ ] AI 응답 시간 확인 (5-10초 예상)

- [ ] Drizzle Studio에서 ai_recommendations 테이블 확인

**Phase 3 완료 기준**:
- ✅ 5개 AI 프롬프트 템플릿 완료
- ✅ 5개 AI 서비스 함수 완료
- ✅ 5개 AI API 엔드포인트 완료
- ✅ 입력/출력 검증 (Zod) 완료
- ✅ 에러 핸들링 완료
- ✅ 빌드 에러 0
- ✅ Git 커밋 완료

---

## Phase 4: UI 구현 (30분)

**목표**: 5개 페이지 UI 구현 및 컴포넌트 작성

### 4.1 레이아웃 설정

- [ ] `src/app/layout.tsx` 루트 레이아웃 수정
  ```tsx
  import './globals.css';
  import { Inter } from 'next/font/google';
  import { Toaster } from '@/components/ui/sonner';

  const inter = Inter({ subsets: ['latin'] });

  export const metadata = {
    title: 'AI Travel Planner',
    description: 'AI 기반 여행 계획 및 일정 관리',
  };

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="ko">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    );
  }
  ```

- [ ] `src/app/(dashboard)/layout.tsx` 대시보드 레이아웃 생성
  ```tsx
  import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
  import Link from 'next/link';

  export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">✈️ AI Travel Planner</h1>
              <Link href="/trips/new">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  + 새 여행
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="border-b bg-white">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="trips" className="w-full">
              <TabsList>
                <Link href="/trips">
                  <TabsTrigger value="trips">여행 목록</TabsTrigger>
                </Link>
                <Link href="/itinerary">
                  <TabsTrigger value="itinerary">일정</TabsTrigger>
                </Link>
                <Link href="/budget">
                  <TabsTrigger value="budget">예산</TabsTrigger>
                </Link>
                <Link href="/recommendations">
                  <TabsTrigger value="recommendations">추천</TabsTrigger>
                </Link>
                <Link href="/insights">
                  <TabsTrigger value="insights">인사이트</TabsTrigger>
                </Link>
              </TabsList>
            </Tabs>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    );
  }
  ```

### 4.2 커스텀 컴포넌트 작성

#### TripCard

- [ ] `src/components/trips/TripCard.tsx` 파일 생성
  ```tsx
  'use client'

  import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
  import { Badge } from '@/components/ui/badge';
  import { CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react';
  import { formatDate, formatCurrency } from '@/lib/utils/format';

  interface TripCardProps {
    trip: {
      id: string;
      name: string;
      destination: string;
      country: string;
      startDate: string;
      endDate: string;
      budget: string;
      actualSpent: string;
      travelers: number;
      status: string;
    };
    onClick?: () => void;
  }

  export function TripCard({ trip, onClick }: TripCardProps) {
    const budgetUsage = (Number(trip.actualSpent) / Number(trip.budget)) * 100;

    return (
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{trip.name}</CardTitle>
            <Badge variant={
              trip.status === 'ongoing' ? 'default' :
              trip.status === 'completed' ? 'secondary' :
              'outline'
            }>
              {trip.status === 'planning' ? '계획 중' :
               trip.status === 'ongoing' ? '진행 중' :
               '완료'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 목적지 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4" />
            <span>{trip.destination}, {trip.country}</span>
          </div>

          {/* 날짜 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4" />
            <span>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
          </div>

          {/* 인원 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UsersIcon className="w-4 h-4" />
            <span>{trip.travelers}명</span>
          </div>

          {/* 예산 사용률 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">예산 사용</span>
              <span className={budgetUsage > 100 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                {budgetUsage.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${budgetUsage > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(budgetUsage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatCurrency(Number(trip.actualSpent))}</span>
              <span>{formatCurrency(Number(trip.budget))}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  ```

#### TimelineItem

- [ ] `src/components/itinerary/TimelineItem.tsx` 파일 생성

#### BudgetChart

- [ ] `src/components/budget/BudgetChart.tsx` 파일 생성
  ```tsx
  'use client'

  import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
  import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
  import { Component, type ReactNode } from 'react';

  const CATEGORY_COLORS = {
    transport: '#3b82f6',
    accommodation: '#10b981',
    food: '#f59e0b',
    activity: '#8b5cf6',
    shopping: '#ec4899',
    other: '#6b7280',
  };

  const CATEGORY_LABELS = {
    transport: '교통',
    accommodation: '숙박',
    food: '식비',
    activity: '활동',
    shopping: '쇼핑',
    other: '기타',
  };

  interface BudgetChartProps {
    expenses: Array<{
      category: string;
      amount: string;
    }>;
  }

  // Error Boundary for Recharts
  class ChartErrorBoundary extends Component<
    { children: ReactNode; fallback: ReactNode },
    { hasError: boolean }
  > {
    constructor(props: { children: ReactNode; fallback: ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: Error) {
      console.error('Chart rendering error:', error);
    }

    render() {
      if (this.state.hasError) {
        return this.props.fallback;
      }

      return this.props.children;
    }
  }

  export function BudgetChart({ expenses }: BudgetChartProps) {
    // 카테고리별 집계
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category as keyof typeof CATEGORY_COLORS;
      acc[category] = (acc[category] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    // 차트 데이터 변환
    const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
      name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
      value: amount,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
    }));

    const totalSpent = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 지출</CardTitle>
        </CardHeader>

        <CardContent>
          {/* 총 지출 */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">총 지출</p>
            <p className="text-3xl font-bold text-gray-900">
              ₩{totalSpent.toLocaleString()}
            </p>
          </div>

          {/* 파이 차트 with Error Boundary */}
          <ChartErrorBoundary
            fallback={
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>차트를 표시할 수 없습니다.</p>
              </div>
            }
          >
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>지출 데이터가 없습니다.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${((entry.value / totalSpent) * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `₩${value.toLocaleString()}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartErrorBoundary>
        </CardContent>
      </Card>
    );
  }
  ```

- [ ] `src/components/budget/BudgetChartWrapper.tsx` 파일 생성 (SSR 방지)
  ```tsx
  'use client'

  import dynamic from 'next/dynamic';
  import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

  // Recharts SSR 이슈 방지: dynamic import with ssr: false
  const BudgetChart = dynamic(
    () => import('./BudgetChart').then(mod => ({ default: mod.BudgetChart })),
    {
      ssr: false,
      loading: () => (
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[400px]">
              <div className="animate-pulse space-y-4 w-full">
                <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto"></div>
                <div className="h-[300px] bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    }
  );

  interface BudgetChartWrapperProps {
    expenses: Array<{
      category: string;
      amount: string;
    }>;
  }

  export function BudgetChartWrapper({ expenses }: BudgetChartWrapperProps) {
    return <BudgetChart expenses={expenses} />;
  }
  ```

**참고**: 예산 페이지에서는 `BudgetChartWrapper`를 import하여 사용:
```tsx
import { BudgetChartWrapper } from '@/components/budget/BudgetChartWrapper';
// ...
<BudgetChartWrapper expenses={expenses} />
```

#### RecommendationCard

- [ ] `src/components/recommendations/RecommendationCard.tsx` 파일 생성

### 4.3 페이지 구현

#### 1. 여행 목록 페이지

- [ ] `src/app/(dashboard)/trips/page.tsx` 파일 생성
  ```tsx
  import { db } from '@/lib/db';
  import { TripCard } from '@/components/trips/TripCard';
  import Link from 'next/link';

  export default async function TripsPage() {
    const trips = await db.query.trips.findMany({
      orderBy: (trips, { desc }) => [desc(trips.startDate)],
    });

    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">여행 목록</h2>

        {trips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">아직 여행이 없습니다.</p>
            <Link href="/trips/new">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                첫 여행 만들기
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`}>
                <TripCard trip={trip} />
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }
  ```

#### 2. 일정 페이지

- [ ] `src/app/(dashboard)/itinerary/page.tsx` 파일 생성

#### 3. 예산 페이지

- [ ] `src/app/(dashboard)/budget/page.tsx` 파일 생성

#### 4. AI 추천 페이지

- [ ] `src/app/(dashboard)/recommendations/page.tsx` 파일 생성

#### 5. AI 인사이트 페이지

- [ ] `src/app/(dashboard)/insights/page.tsx` 파일 생성

### 4.4 다이얼로그 컴포넌트

#### 여행 생성 다이얼로그

- [ ] `src/components/trips/CreateTripDialog.tsx` 파일 생성
  ```tsx
  'use client'

  import { useState } from 'react';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
  import { Calendar } from '@/components/ui/calendar';
  import { toast } from 'sonner';

  interface CreateTripDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  export function CreateTripDialog({ open, onOpenChange }: CreateTripDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      try {
        const formData = new FormData(e.currentTarget);
        const data = {
          name: formData.get('name'),
          destination: formData.get('destination'),
          country: formData.get('country'),
          startDate: formData.get('startDate'),
          endDate: formData.get('endDate'),
          budget: Number(formData.get('budget')),
          travelers: Number(formData.get('travelers')),
          tripType: formData.get('tripType'),
        };

        const res = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error('여행 생성 실패');

        toast.success('여행이 생성되었습니다.');
        onOpenChange(false);
        window.location.reload();
      } catch (error) {
        toast.error('여행 생성 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 여행 만들기</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">여행 이름</Label>
              <Input id="name" name="name" required />
            </div>

            <div>
              <Label htmlFor="destination">목적지</Label>
              <Input id="destination" name="destination" required />
            </div>

            <div>
              <Label htmlFor="country">국가</Label>
              <Input id="country" name="country" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">출발일</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div>
                <Label htmlFor="endDate">종료일</Label>
                <Input id="endDate" name="endDate" type="date" required />
              </div>
            </div>

            <div>
              <Label htmlFor="budget">예산 (원)</Label>
              <Input id="budget" name="budget" type="number" required />
            </div>

            <div>
              <Label htmlFor="travelers">인원</Label>
              <Input id="travelers" name="travelers" type="number" defaultValue={1} required />
            </div>

            <div>
              <Label htmlFor="tripType">여행 유형</Label>
              <Select name="tripType" required>
                <SelectTrigger>
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">휴양</SelectItem>
                  <SelectItem value="business">출장</SelectItem>
                  <SelectItem value="adventure">배낭여행</SelectItem>
                  <SelectItem value="backpacking">배낭여행</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '생성 중...' : '생성'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
  ```

#### AI 일정 생성 다이얼로그

- [ ] `src/components/ai/GenerateItineraryDialog.tsx` 파일 생성

### 4.5 빌드 검증

- [ ] **CRITICAL: 빌드 에러 0 확인**
  ```bash
  npm run build
  ```

- [ ] 타입 체크
  ```bash
  npx tsc --noEmit
  ```

### 4.6 Git 커밋

- [ ] Git 커밋
  ```bash
  git add .
  git commit -m "Phase 4 complete: UI implementation with 5 pages and components"
  ```

### 4.7 테스트

- [ ] 개발 서버 실행
  ```bash
  npm run dev
  ```

- [ ] 브라우저에서 각 페이지 확인
  - [ ] http://localhost:3000/trips
  - [ ] http://localhost:3000/itinerary
  - [ ] http://localhost:3000/budget
  - [ ] http://localhost:3000/recommendations
  - [ ] http://localhost:3000/insights

- [ ] 여행 생성 플로우 테스트

- [ ] 반응형 디자인 확인 (모바일/태블릿/데스크톱)

**Phase 4 완료 기준**:
- ✅ 5개 페이지 UI 완료
- ✅ 4개 커스텀 컴포넌트 완료
- ✅ 레이아웃 완료
- ✅ 다이얼로그 완료
- ✅ 반응형 디자인 적용
- ✅ 빌드 에러 0
- ✅ Git 커밋 완료

---

## Phase 5: 통합 & 테스트 (15분)

**목표**: 전체 기능 통합 및 E2E 테스트

### 5.1 검색 & 필터 구현

- [ ] `src/components/trips/TripFilters.tsx` 파일 생성
  ```tsx
  'use client'

  import { Input } from '@/components/ui/input';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

  interface TripFiltersProps {
    onSearch: (query: string) => void;
    onFilterStatus: (status: string) => void;
    onFilterType: (type: string) => void;
  }

  export function TripFilters({ onSearch, onFilterStatus, onFilterType }: TripFiltersProps) {
    return (
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="여행 이름 또는 목적지 검색..."
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1"
        />

        <Select onValueChange={onFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="planning">계획 중</SelectItem>
            <SelectItem value="ongoing">진행 중</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={onFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="유형 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="vacation">휴양</SelectItem>
            <SelectItem value="business">출장</SelectItem>
            <SelectItem value="adventure">배낭여행</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
  ```

- [ ] 여행 목록 페이지에 필터 적용

### 5.2 전체 통합 테스트

#### 여행 관리 테스트

- [ ] 여행 생성
  - [ ] 폼 입력
  - [ ] 유효성 검증
  - [ ] API 호출
  - [ ] DB 저장 확인

- [ ] 여행 수정
  - [ ] 수정 다이얼로그 열기
  - [ ] 데이터 수정
  - [ ] 저장 확인

- [ ] 여행 삭제
  - [ ] 삭제 확인 다이얼로그
  - [ ] API 호출
  - [ ] 목록에서 제거 확인

- [ ] 여행 목록 조회
  - [ ] 정렬 확인 (최신순)
  - [ ] 필터 동작 확인
  - [ ] 검색 동작 확인

#### 일정 관리 테스트

- [ ] 일정 추가
  - [ ] 날짜/시간 선택
  - [ ] 목적지 연결
  - [ ] 우선순위 설정
  - [ ] 저장 확인

- [ ] 일정 수정 & 삭제

- [ ] 타임라인 뷰 확인

#### 지출 기록 테스트

- [ ] 지출 추가
  - [ ] 카테고리 선택
  - [ ] 금액 입력
  - [ ] 날짜 선택
  - [ ] 저장 확인

- [ ] 예산 차트 표시 확인 (Recharts)

- [ ] 카테고리별 집계 확인

#### AI 기능 테스트

- [ ] AI 일정 자동 생성
  - [ ] 입력 폼 작성
  - [ ] "✨ AI 일정 생성" 버튼 클릭
  - [ ] 로딩 상태 표시 확인 (5-10초)
  - [ ] 생성된 일정 미리보기
  - [ ] 일정 적용

- [ ] AI 장소 추천
  - [ ] 목적지 선택
  - [ ] 추천 요청
  - [ ] 필수 방문지, 숨은 명소, 레스토랑 표시 확인

- [ ] AI 예산 최적화
  - [ ] 현재 지출 분석
  - [ ] 절약 제안 표시
  - [ ] 재배분 예산 확인

- [ ] AI 일정 조정 제안
  - [ ] 현재 일정 분석
  - [ ] 최적화 제안 표시
  - [ ] 개선 사항 확인

- [ ] AI 여행 인사이트
  - [ ] 여행 스타일 분석
  - [ ] 다음 여행 추천
  - [ ] 패턴 분석 확인

### 5.3 Edge Cases 유틸리티 구현

#### 날짜 검증 유틸리티

- [ ] `src/lib/utils/dateValidation.ts` 파일 생성
  ```typescript
  import { addDays, differenceInDays, isBefore, isAfter, parseISO, isValid } from 'date-fns';

  /**
   * 날짜 범위 검증
   */
  export function validateDateRange(
    startDate: string | Date,
    endDate: string | Date
  ): { valid: boolean; error?: string } {
    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

      if (!isValid(start) || !isValid(end)) {
        return { valid: false, error: '유효하지 않은 날짜 형식입니다.' };
      }

      if (isAfter(start, end)) {
        return { valid: false, error: '시작일은 종료일보다 이전이어야 합니다.' };
      }

      // 최대 여행 기간 (예: 365일)
      const maxDays = 365;
      const daysDiff = differenceInDays(end, start);

      if (daysDiff > maxDays) {
        return { valid: false, error: `여행 기간은 최대 ${maxDays}일까지 가능합니다.` };
      }

      // 과거 날짜 경고 (선택적)
      const today = new Date();
      if (isBefore(start, today) && differenceInDays(today, start) > 1) {
        return { valid: false, error: '과거 날짜는 선택할 수 없습니다.' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: '날짜 검증 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 일정 날짜가 여행 기간 내인지 확인
   */
  export function isWithinTripDates(
    itineraryDate: string | Date,
    tripStartDate: string | Date,
    tripEndDate: string | Date
  ): boolean {
    const date = typeof itineraryDate === 'string' ? parseISO(itineraryDate) : itineraryDate;
    const start = typeof tripStartDate === 'string' ? parseISO(tripStartDate) : tripStartDate;
    const end = typeof tripEndDate === 'string' ? parseISO(tripEndDate) : tripEndDate;

    return !isBefore(date, start) && !isAfter(date, end);
  }
  ```

#### 통화 변환 유틸리티

- [ ] `src/lib/utils/currency.ts` 파일 생성
  ```typescript
  /**
   * 간단한 통화 변환 (실제 프로덕션에서는 API 사용 권장)
   */
  const EXCHANGE_RATES: Record<string, number> = {
    USD: 1300,  // 1 USD = 1300 KRW
    EUR: 1400,  // 1 EUR = 1400 KRW
    JPY: 9,     // 1 JPY = 9 KRW
    CNY: 180,   // 1 CNY = 180 KRW
    KRW: 1,     // 1 KRW = 1 KRW
  };

  export function convertToKRW(amount: number, fromCurrency: string): number {
    const rate = EXCHANGE_RATES[fromCurrency.toUpperCase()];
    if (!rate) {
      throw new Error(`지원하지 않는 통화: ${fromCurrency}`);
    }
    return Math.round(amount * rate);
  }

  export function convertFromKRW(amount: number, toCurrency: string): number {
    const rate = EXCHANGE_RATES[toCurrency.toUpperCase()];
    if (!rate) {
      throw new Error(`지원하지 않는 통화: ${toCurrency}`);
    }
    return Math.round((amount / rate) * 100) / 100;
  }

  /**
   * 통화 포맷팅
   */
  export function formatCurrencyWithCode(
    amount: number,
    currency: string = 'KRW'
  ): string {
    const formats: Record<string, Intl.NumberFormatOptions> = {
      KRW: { style: 'currency', currency: 'KRW', minimumFractionDigits: 0 },
      USD: { style: 'currency', currency: 'USD' },
      EUR: { style: 'currency', currency: 'EUR' },
      JPY: { style: 'currency', currency: 'JPY', minimumFractionDigits: 0 },
      CNY: { style: 'currency', currency: 'CNY' },
    };

    const format = formats[currency] || formats.KRW;
    return new Intl.NumberFormat('ko-KR', format).format(amount);
  }

  /**
   * 실시간 환율 API 호출 (선택적)
   */
  export async function fetchRealTimeRate(from: string, to: string): Promise<number> {
    // TODO: 실제 API 연동 (예: exchangerate-api.com)
    // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
    // const data = await response.json();
    // return data.rates[to];

    // 임시로 고정 환율 반환
    return EXCHANGE_RATES[to] / EXCHANGE_RATES[from];
  }
  ```

#### 타임존 처리 유틸리티

- [ ] `src/lib/utils/timezone.ts` 파일 생성
  ```typescript
  import { format, toZonedTime, fromZonedTime } from 'date-fns-tz';
  import { parseISO } from 'date-fns';

  /**
   * 목적지별 타임존 매핑
   */
  const DESTINATION_TIMEZONES: Record<string, string> = {
    '도쿄': 'Asia/Tokyo',
    '서울': 'Asia/Seoul',
    '파리': 'Europe/Paris',
    '뉴욕': 'America/New_York',
    '런던': 'Europe/London',
    '방콕': 'Asia/Bangkok',
    '싱가포르': 'Asia/Singapore',
    '홍콩': 'Asia/Hong_Kong',
    '로스앤젤레스': 'America/Los_Angeles',
    '시드니': 'Australia/Sydney',
  };

  /**
   * 목적지 타임존으로 변환
   */
  export function toDestinationTime(
    date: string | Date,
    destinationCity: string
  ): Date {
    const timezone = DESTINATION_TIMEZONES[destinationCity] || 'Asia/Seoul';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return toZonedTime(dateObj, timezone);
  }

  /**
   * 목적지 타임존으로 포맷팅
   */
  export function formatInDestinationTimezone(
    date: string | Date,
    destinationCity: string,
    formatStr: string = 'yyyy-MM-dd HH:mm:ss zzz'
  ): string {
    const timezone = DESTINATION_TIMEZONES[destinationCity] || 'Asia/Seoul';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const zonedDate = toZonedTime(dateObj, timezone);
    return format(zonedDate, formatStr, { timeZone: timezone });
  }

  /**
   * 시차 계산 (시간 단위)
   */
  export function getTimeDifference(
    city1: string,
    city2: string
  ): number {
    const tz1 = DESTINATION_TIMEZONES[city1] || 'Asia/Seoul';
    const tz2 = DESTINATION_TIMEZONES[city2] || 'Asia/Seoul';

    const now = new Date();
    const time1 = toZonedTime(now, tz1);
    const time2 = toZonedTime(now, tz2);

    return (time1.getTime() - time2.getTime()) / (1000 * 60 * 60);
  }

  /**
   * 현지 시간 표시 (UI용)
   */
  export function getLocalTimeDisplay(destinationCity: string): string {
    const timezone = DESTINATION_TIMEZONES[destinationCity] || 'Asia/Seoul';
    return format(toZonedTime(new Date(), timezone), 'HH:mm', { timeZone: timezone });
  }
  ```

#### 일정 충돌 감지 유틸리티

- [ ] `src/lib/utils/scheduleConflict.ts` 파일 생성
  ```typescript
  import { parseISO, isWithinInterval } from 'date-fns';

  export interface TimeSlot {
    id: string;
    date: string;
    startTime: string; // "HH:MM" 형식
    endTime: string;   // "HH:MM" 형식
    title: string;
  }

  /**
   * 시간 문자열을 분 단위로 변환
   */
  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * 두 일정이 시간적으로 겹치는지 확인
   */
  export function hasTimeOverlap(
    slot1: TimeSlot,
    slot2: TimeSlot
  ): boolean {
    // 날짜가 다르면 겹치지 않음
    if (slot1.date !== slot2.date) {
      return false;
    }

    const start1 = timeToMinutes(slot1.startTime);
    const end1 = timeToMinutes(slot1.endTime);
    const start2 = timeToMinutes(slot2.startTime);
    const end2 = timeToMinutes(slot2.endTime);

    // 겹침 조건: start1 < end2 && start2 < end1
    return start1 < end2 && start2 < end1;
  }

  /**
   * 새 일정과 기존 일정들 간의 충돌 감지
   */
  export function detectScheduleConflicts(
    newSlot: TimeSlot,
    existingSlots: TimeSlot[]
  ): TimeSlot[] {
    return existingSlots.filter(slot =>
      slot.id !== newSlot.id && hasTimeOverlap(newSlot, slot)
    );
  }

  /**
   * 충돌 메시지 생성
   */
  export function generateConflictMessage(conflicts: TimeSlot[]): string {
    if (conflicts.length === 0) {
      return '';
    }

    if (conflicts.length === 1) {
      const conflict = conflicts[0];
      return `"${conflict.title}" (${conflict.startTime}-${conflict.endTime})와 시간이 겹칩니다.`;
    }

    return `${conflicts.length}개의 일정과 시간이 겹칩니다: ${conflicts.map(c => c.title).join(', ')}`;
  }

  /**
   * 여유 시간 확인 (이동 시간 고려)
   */
  export function hasBufferTime(
    slot1: TimeSlot,
    slot2: TimeSlot,
    bufferMinutes: number = 30
  ): boolean {
    if (slot1.date !== slot2.date) {
      return true;
    }

    const end1 = timeToMinutes(slot1.endTime);
    const start2 = timeToMinutes(slot2.startTime);

    return start2 - end1 >= bufferMinutes;
  }
  ```

### 5.4 Edge Cases 테스트

- [ ] 예산 초과 경고
  - [ ] 지출이 예산을 초과할 때 빨간색 표시
  - [ ] 알림 표시

- [ ] 일정 충돌 감지
  - [ ] 같은 시간대 일정 추가 시도
  - [ ] `detectScheduleConflicts` 함수로 충돌 감지
  - [ ] 경고 메시지 확인

- [ ] AI API 에러 처리
  - [ ] 네트워크 오류 시뮬레이션
  - [ ] Rate limiting 에러 확인 (429 상태)
  - [ ] 에러 메시지 표시 확인
  - [ ] 재시도 버튼 동작 확인

- [ ] 빈 상태 처리
  - [ ] 여행이 없을 때 메시지 표시
  - [ ] 일정이 없을 때 메시지 표시
  - [ ] 지출이 없을 때 메시지 표시

- [ ] 날짜 검증
  - [ ] 과거 날짜 입력 방지
  - [ ] 시작일 > 종료일 입력 방지
  - [ ] 최대 여행 기간 (365일) 초과 방지

- [ ] 통화 변환
  - [ ] KRW ↔ USD 변환 테스트
  - [ ] 환율 적용 확인

- [ ] 타임존 처리
  - [ ] 목적지별 현지 시간 표시
  - [ ] 시차 계산 정확성 확인

### 5.5 성능 테스트

- [ ] Lighthouse 실행
  ```bash
  npm install -g lighthouse
  lighthouse http://localhost:3000 --view
  ```

- [ ] 목표 점수 확인
  - [ ] Performance: > 90
  - [ ] Accessibility: > 95
  - [ ] Best Practices: > 90
  - [ ] SEO: > 90

- [ ] Core Web Vitals 확인
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

### 5.6 반응형 테스트

- [ ] 모바일 (< 768px)
  - [ ] 단일 컬럼 레이아웃
  - [ ] 하단 네비게이션
  - [ ] 터치 영역 크기 확인

- [ ] 태블릿 (768-1024px)
  - [ ] 2컬럼 레이아웃
  - [ ] 사이드바 표시

- [ ] 데스크톱 (> 1024px)
  - [ ] 3컬럼 그리드
  - [ ] 고정 사이드바

### 5.7 브라우저 호환성 테스트

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### 5.8 최종 빌드 검증

- [ ] **CRITICAL: 프로덕션 빌드**
  ```bash
  npm run build
  ```

- [ ] **CRITICAL: 빌드 에러 0 확인**

- [ ] 빌드 크기 확인
  ```bash
  # 빌드 결과에서 파일 크기 확인
  # First Load JS: 목표 < 500KB
  ```

### 5.9 최종 Git 커밋

- [ ] Git 커밋
  ```bash
  git add .
  git commit -m "Phase 5 complete: Integration, testing, and final optimizations"
  ```

- [ ] Git 태그
  ```bash
  git tag -a v1.0.0 -m "AI Travel Planner v1.0.0 - Initial release"
  ```

### 5.10 문서 업데이트

- [ ] README.md 작성
  - [ ] 프로젝트 소개
  - [ ] 기술 스택
  - [ ] 설치 방법
  - [ ] 실행 방법
  - [ ] 환경 변수 설정
  - [ ] 스크린샷

- [ ] IMPLEMENTATION.md 최종 업데이트
  - [ ] 모든 체크박스 확인
  - [ ] 완료 날짜 기록

### 5.11 배포 준비

- [ ] Vercel 환경 변수 설정 확인

- [ ] 개발 DB 마이그레이션 최종 확인

- [ ] `.gitignore` 확인

- [ ] `.env.example` 파일 생성
  ```env
  # Database
  DATABASE_URL=postgresql://user:password@host:port/database

  # AI API
  OPENROUTER_API_KEY=your_api_key_here

  # Environment
  NODE_ENV=development
  ```

**Phase 5 완료 기준**:
- ✅ 검색 & 필터 완료
- ✅ 12개 기능 모두 동작
- ✅ AI 기능 5개 완료
- ✅ Edge Cases 처리 완료
- ✅ 성능 목표 달성
- ✅ 반응형 디자인 검증
- ✅ 빌드 에러 0
- ✅ 문서 최종 업데이트
- ✅ Git 커밋 & 태그 완료

---

## 🎉 프로젝트 완료 체크리스트

### 기능 완성도 (12개 기능)

- [ ] 1. 여행 관리 CRUD
- [ ] 2. 목적지 데이터베이스
- [ ] 3. 일정 관리
- [ ] 4. 예산 추적
- [ ] 5. 타임라인 뷰
- [ ] 6. 통계 대시보드 (Recharts)
- [ ] 7. 검색 & 필터
- [ ] 8. AI 일정 자동 생성 ⭐
- [ ] 9. AI 장소 추천 ⭐
- [ ] 10. AI 예산 최적화 ⭐
- [ ] 11. AI 일정 조정 제안 ⭐
- [ ] 12. AI 여행 인사이트 ⭐

### 품질 기준

- [ ] 빌드 에러 0
- [ ] 타입 에러 0
- [ ] Lint 에러 0
- [ ] AI 응답 시간 < 10초
- [ ] 페이지 로드 < 2초
- [ ] Lighthouse Performance > 90
- [ ] 반응형 디자인 완료
- [ ] 에러 핸들링 완료

### 문서화

- [ ] README.md 작성
- [ ] IMPLEMENTATION.md 완료
- [ ] docs/PRD.md 최종 검토
- [ ] docs/ARCHITECTURE.md 최종 검토
- [ ] docs/DATABASE.md 최종 검토
- [ ] docs/DEPLOYMENT.md 최종 검토
- [ ] CLAUDE.md 최종 검토

### 배포

- [ ] 로컬 DB 마이그레이션 완료
- [ ] 개발 DB 마이그레이션 완료
- [ ] Vercel 배포 준비 완료
- [ ] 환경 변수 설정 완료

---

## 📝 진행 상황 기록

### Phase 1: 프로젝트 셋업
- 시작 시간: ___________
- 완료 시간: ___________
- 소요 시간: ___________
- 상태: ⬜ 진행 중 / ✅ 완료

### Phase 2: DB & 기본 CRUD
- 시작 시간: ___________
- 완료 시간: ___________
- 소요 시간: ___________
- 상태: ⬜ 진행 중 / ✅ 완료

### Phase 3: AI 기능
- 시작 시간: ___________
- 완료 시간: ___________
- 소요 시간: ___________
- 상태: ⬜ 진행 중 / ✅ 완료

### Phase 4: UI 구현
- 시작 시간: ___________
- 완료 시간: ___________
- 소요 시간: ___________
- 상태: ⬜ 진행 중 / ✅ 완료

### Phase 5: 통합 & 테스트
- 시작 시간: ___________
- 완료 시간: ___________
- 소요 시간: ___________
- 상태: ⬜ 진행 중 / ✅ 완료

### 전체 프로젝트
- 시작 시간: ___________
- 완료 시간: ___________
- 총 소요 시간: ___________

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-15
**작성자**: AI Travel Planner Team

**Happy Coding! 🚀**
