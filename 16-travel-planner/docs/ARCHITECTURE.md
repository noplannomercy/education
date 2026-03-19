# AI Travel Planner - 아키텍처 문서

## 1. 시스템 개요

```mermaid
graph TB
    Client[클라이언트<br/>Next.js 14 App Router]
    API[API Routes<br/>Server Components]
    AI[AI Service<br/>Open Router + Claude Haiku 4.5]
    DB[(PostgreSQL<br/>+ Drizzle ORM)]

    Client --> API
    API --> AI
    API --> DB

    style Client fill:#e1f5ff
    style API fill:#fff4e1
    style AI fill:#ffe1f5
    style DB fill:#e1ffe1
```

## 2. 코드베이스 구조

```
day16-travel-planner/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/       # 대시보드 레이아웃 그룹
│   │   │   ├── trips/         # 여행 목록 페이지
│   │   │   ├── itinerary/     # 일정 페이지
│   │   │   ├── budget/        # 예산 페이지
│   │   │   ├── recommendations/ # AI 추천 페이지
│   │   │   └── insights/      # AI 인사이트 페이지
│   │   ├── api/               # API Routes
│   │   │   └── ai/            # AI 엔드포인트
│   │   │       ├── generate-itinerary/
│   │   │       ├── recommend-places/
│   │   │       ├── optimize-budget/
│   │   │       ├── optimize-itinerary/
│   │   │       └── analyze-insights/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── lib/
│   │   ├── db/                # 데이터베이스
│   │   │   ├── schema.ts      # Drizzle 스키마 정의
│   │   │   ├── index.ts       # DB 연결
│   │   │   └── migrations/    # 마이그레이션 파일
│   │   │
│   │   ├── ai/                # AI 서비스
│   │   │   ├── client.ts      # Open Router 클라이언트
│   │   │   ├── prompts/       # 프롬프트 템플릿
│   │   │   │   ├── versions.ts    # 프롬프트 버전 관리
│   │   │   │   ├── itinerary.ts
│   │   │   │   ├── places.ts
│   │   │   │   ├── budget.ts
│   │   │   │   ├── optimization.ts
│   │   │   │   └── insights.ts
│   │   │   ├── services/      # AI 서비스 함수
│   │   │   │   ├── generateItinerary.ts
│   │   │   │   ├── recommendPlaces.ts
│   │   │   │   ├── optimizeBudget.ts
│   │   │   │   ├── optimizeItinerary.ts
│   │   │   │   └── analyzeTravelInsights.ts
│   │   │   └── utils/         # AI 유틸리티
│   │   │       ├── parseJSON.ts      # 강화된 JSON 파싱
│   │   │       ├── retry.ts          # 지수 백오프 재시도
│   │   │       └── rateLimit.ts      # Rate Limiter
│   │   │
│   │   ├── validations/       # 입력 검증
│   │   │   └── schemas.ts     # Zod 스키마
│   │   │
│   │   └── utils/             # 유틸리티
│   │       ├── format.ts              # 포맷팅
│   │       ├── errors.ts              # 에러 클래스
│   │       ├── dateValidation.ts      # 날짜 검증
│   │       ├── currency.ts            # 통화 변환
│   │       ├── timezone.ts            # 타임존 처리
│   │       └── scheduleConflict.ts    # 일정 충돌 감지
│   │
│   ├── types/                 # TypeScript 타입
│   │   ├── api.ts             # API 응답 타입
│   │   └── enums.ts           # 통합 Enum 타입
│   │
│   └── components/            # UI 컴포넌트
│       ├── ui/                # shadcn/ui 컴포넌트
│       ├── trips/             # 여행 관련 컴포넌트
│       ├── itinerary/         # 일정 관련 컴포넌트
│       ├── budget/            # 예산 관련 컴포넌트
│       └── charts/            # Recharts 차트 컴포넌트
│
├── docs/                      # 문서
│   ├── PRD.md
│   └── ARCHITECTURE.md
│
├── .env.local                 # 로컬 환경 변수
├── drizzle.config.ts          # Drizzle 설정
├── next.config.js
├── package.json
└── tsconfig.json
```

## 3. AI 함수 구조

### 3.1 AI 서비스 아키텍처

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Service
    participant RateLimit
    participant Retry
    participant JSONParser
    participant Prompt
    participant OpenRouter
    participant DB

    Client->>API: POST /api/ai/generate-itinerary
    API->>API: 입력 검증 (Zod)
    API->>Service: generateItinerary(tripInfo)

    Service->>RateLimit: checkAIRateLimit(userId)
    alt Rate Limit 초과
        RateLimit-->>Service: { allowed: false, retryAfter: 60 }
        Service-->>API: RateLimitError
        API-->>Client: 429 Too Many Requests
    else 허용됨
        RateLimit-->>Service: { allowed: true }
        Service->>Prompt: buildPrompt(tripInfo)
        Prompt-->>Service: promptText (with few-shot examples)

        Service->>Retry: retryAICall()
        loop 최대 3회 재시도
            Retry->>OpenRouter: generateText(model, prompt)
            alt 성공
                OpenRouter-->>Retry: AI 응답 텍스트
            else 네트워크 오류
                OpenRouter-->>Retry: Error
                Retry->>Retry: 지수 백오프 대기
            end
        end
        Retry-->>Service: AI 응답 텍스트

        Service->>JSONParser: parseAIResponse(text, schema)
        JSONParser->>JSONParser: 마크다운 제거
        JSONParser->>JSONParser: 후행 쉼표 제거
        JSONParser->>JSONParser: JSON.parse()
        JSONParser->>JSONParser: Zod 검증
        JSONParser-->>Service: 검증된 데이터

        Service->>DB: saveRecommendation()
        Service-->>API: structured result
        API-->>Client: 200 OK + JSON
    end
```

### 3.2 5개 AI 함수

#### 1. generateItinerary()
**위치**: `src/lib/ai/services/generateItinerary.ts`

```typescript
import { parseAIResponse } from '../utils/parseJSON';
import { retryAICall } from '../utils/retry';
import { checkAIRateLimit } from '../utils/rateLimit';

export async function generateItinerary(input: TripInput): Promise<ItineraryResult> {
  // 1. 입력 검증 (Zod)
  const validated = tripSchema.parse(input);

  // 2. Rate Limiting 확인
  const rateLimitCheck = checkAIRateLimit(userId);
  if (!rateLimitCheck.allowed) {
    throw new RateLimitError(`요청 한도 초과. ${rateLimitCheck.retryAfter}초 후 재시도`);
  }

  // 3. 프롬프트 생성 (few-shot examples 포함)
  const prompt = buildItineraryPrompt(validated);

  // 4. AI 호출 (재시도 로직 포함)
  const result = await retryAICall(async () => {
    return await generateText({
      model: openrouter('anthropic/claude-haiku-4.5'),
      prompt,
      temperature: 0.7,
      maxTokens: 4000,
    });
  }, 'generateItinerary');

  // 5. 강화된 JSON 파싱 & 검증
  const parsed = parseAIResponse(result.text, itinerarySchema);

  // 6. DB 저장 (metadata 포함)
  await db.insert(aiRecommendations).values({
    tripId: input.tripId,
    type: 'itinerary',
    content: parsed,
  });

  return parsed;
}
```

#### 2. recommendPlaces()
**위치**: `src/lib/ai/services/recommendPlaces.ts`

```typescript
export async function recommendPlaces(input: PlaceInput): Promise<PlaceResult> {
  const validated = placeSchema.parse(input);
  const prompt = buildPlacePrompt(validated);

  const result = await generateText({
    model: openrouter('anthropic/claude-haiku-4.5'),
    prompt,
    temperature: 0.8, // 창의성 증가
  });

  const parsed = parseAndValidateJSON(result.text, placeSchema);

  await saveAIRecommendation({
    tripId: input.tripId,
    type: 'place',
    content: parsed,
  });

  return parsed;
}
```

#### 3. optimizeBudget()
**위치**: `src/lib/ai/services/optimizeBudget.ts`

```typescript
export async function optimizeBudget(input: BudgetInput): Promise<BudgetResult> {
  const validated = budgetSchema.parse(input);

  // 현재 지출 데이터 조회
  const expenses = await db.query.expenses.findMany({
    where: eq(expenses.tripId, input.tripId),
  });

  const prompt = buildBudgetPrompt({ ...validated, expenses });

  const result = await generateText({
    model: openrouter('anthropic/claude-haiku-4.5'),
    prompt,
    temperature: 0.5, // 정확성 중시
  });

  const parsed = parseAndValidateJSON(result.text, budgetResultSchema);

  await saveAIRecommendation({
    tripId: input.tripId,
    type: 'budget',
    content: parsed,
  });

  return parsed;
}
```

#### 4. optimizeItinerary()
**위치**: `src/lib/ai/services/optimizeItinerary.ts`

```typescript
export async function optimizeItinerary(input: OptimizeInput): Promise<OptimizeResult> {
  const validated = optimizeSchema.parse(input);

  // 기존 일정 조회
  const itineraries = await db.query.itineraries.findMany({
    where: eq(itineraries.tripId, input.tripId),
    orderBy: [asc(itineraries.date), asc(itineraries.startTime)],
  });

  const prompt = buildOptimizePrompt({ ...validated, itineraries });

  const result = await generateText({
    model: openrouter('anthropic/claude-haiku-4.5'),
    prompt,
    temperature: 0.6,
  });

  const parsed = parseAndValidateJSON(result.text, optimizeResultSchema);

  await saveAIRecommendation({
    tripId: input.tripId,
    type: 'optimization',
    content: parsed,
  });

  return parsed;
}
```

#### 5. analyzeTravelInsights()
**위치**: `src/lib/ai/services/analyzeTravelInsights.ts`

```typescript
export async function analyzeTravelInsights(userId: string): Promise<InsightsResult> {
  // 사용자의 모든 여행 데이터 조회
  const trips = await db.query.trips.findMany({
    where: eq(trips.userId, userId),
    with: {
      itineraries: true,
      expenses: true,
    },
  });

  if (trips.length === 0) {
    throw new Error('분석할 여행 데이터가 없습니다.');
  }

  const prompt = buildInsightsPrompt(trips);

  const result = await generateText({
    model: openrouter('anthropic/claude-haiku-4.5'),
    prompt,
    temperature: 0.7,
    maxTokens: 3000,
  });

  const parsed = parseAndValidateJSON(result.text, insightsSchema);

  return parsed;
}
```

## 4. 프롬프트 템플릿 위치

**디렉토리**: `src/lib/ai/prompts/`

### 4.1 파일 구조
```
src/lib/ai/prompts/
├── itinerary.ts        # 일정 생성 프롬프트
├── places.ts           # 장소 추천 프롬프트
├── budget.ts           # 예산 최적화 프롬프트
├── optimization.ts     # 일정 조정 프롬프트
├── insights.ts         # 여행 인사이트 프롬프트
└── common.ts           # 공통 프롬프트 유틸리티
```

### 4.2 템플릿 예시

**itinerary.ts**:
```typescript
export function buildItineraryPrompt(input: TripInput): string {
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
2. 이동 시간 고려
3. 예산 배분 (교통, 숙박, 식비, 활동)
4. 체력 분산 (피곤하지 않게)
5. 우선순위 설정
6. 실용적인 팁

${JSON_RESPONSE_INSTRUCTION}

${ITINERARY_JSON_SCHEMA}`;
}

const JSON_RESPONSE_INSTRUCTION = `YOU MUST respond with ONLY valid JSON.
No markdown code blocks.
No preamble.
Just pure JSON.`;

const ITINERARY_JSON_SCHEMA = `JSON 형식:
{
  "dailyPlans": [...],
  "budgetBreakdown": {...},
  "tips": [...]
}`;
```

## 5. 에러 핸들링

### 5.1 에러 타입

```typescript
// src/lib/utils/errors.ts

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

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(429, message, 'RATE_LIMIT_ERROR');
  }
}
```

### 5.2 에러 핸들링 전략

```mermaid
flowchart TD
    Start[AI 함수 호출] --> Validate[입력 검증]
    Validate -->|실패| ValidationErr[ValidationError]
    Validate -->|성공| CallAI[AI API 호출]
    CallAI -->|타임아웃| Retry{재시도<br/>3회 이하?}
    Retry -->|예| CallAI
    Retry -->|아니오| AIErr[AIServiceError]
    CallAI -->|실패| APIErr{에러 타입?}
    APIErr -->|429| RateLimitErr[RateLimitError]
    APIErr -->|5xx| AIErr
    CallAI -->|성공| Parse[JSON 파싱]
    Parse -->|실패| ParseErr[AIServiceError<br/>Invalid JSON]
    Parse -->|성공| ValidateJSON[JSON 검증]
    ValidateJSON -->|실패| SchemaErr[ValidationError]
    ValidateJSON -->|성공| SaveDB[DB 저장]
    SaveDB -->|실패| DBErr[DatabaseError]
    SaveDB -->|성공| Success[성공 반환]

    ValidationErr --> ErrorResponse[에러 응답]
    AIErr --> ErrorResponse
    RateLimitErr --> ErrorResponse
    ParseErr --> ErrorResponse
    SchemaErr --> ErrorResponse
    DBErr --> ErrorResponse

    style ValidationErr fill:#ff9999
    style AIErr fill:#ff9999
    style RateLimitErr fill:#ffcc99
    style ParseErr fill:#ff9999
    style SchemaErr fill:#ff9999
    style DBErr fill:#ff9999
    style Success fill:#99ff99
```

### 5.3 API Route 에러 핸들러

```typescript
// src/app/api/ai/[endpoint]/route.ts

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 비즈니스 로직
    const result = await aiService(body);

    return Response.json(result);

  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    if (error instanceof RateLimitError) {
      return Response.json(
        { error: '요청 한도 초과. 잠시 후 다시 시도하세요.', code: error.code },
        { status: 429 }
      );
    }

    if (error instanceof AIServiceError) {
      return Response.json(
        { error: 'AI 서비스 오류. 다시 시도하세요.', code: error.code },
        { status: 500 }
      );
    }

    if (error instanceof DatabaseError) {
      return Response.json(
        { error: '데이터베이스 오류', code: error.code },
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

### 5.4 재시도 로직

```typescript
// src/lib/ai/utils/retry.ts

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // 지수 백오프
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}
```

## 6. 성능 & 보안

### 6.1 데이터베이스 인덱스

```typescript
// src/lib/db/schema.ts

export const trips = pgTable('trips', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  destination: varchar('destination', { length: 255 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // 성능 최적화 인덱스
  userIdIdx: index('trips_user_id_idx').on(table.userId),
  statusIdx: index('trips_status_idx').on(table.status),
  startDateIdx: index('trips_start_date_idx').on(table.startDate),
  destinationIdx: index('trips_destination_idx').on(table.destination),

  // 복합 인덱스 (자주 함께 조회되는 컬럼)
  userStatusIdx: index('trips_user_status_idx').on(table.userId, table.status),
}));

export const itineraries = pgTable('itineraries', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  startTime: time('start_time').notNull(),
  order: integer('order').notNull(),
  // ...
}, (table) => ({
  tripIdIdx: index('itineraries_trip_id_idx').on(table.tripId),
  dateIdx: index('itineraries_date_idx').on(table.date),
  tripDateIdx: index('itineraries_trip_date_idx').on(table.tripId, table.date),
}));

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 50 }).notNull(),
  date: date('date').notNull(),
  // ...
}, (table) => ({
  tripIdIdx: index('expenses_trip_id_idx').on(table.tripId),
  categoryIdx: index('expenses_category_idx').on(table.category),
  dateIdx: index('expenses_date_idx').on(table.date),
}));

export const aiRecommendations = pgTable('ai_recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  applied: boolean('applied').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  // ...
}, (table) => ({
  tripIdIdx: index('ai_recs_trip_id_idx').on(table.tripId),
  typeIdx: index('ai_recs_type_idx').on(table.type),
  appliedIdx: index('ai_recs_applied_idx').on(table.applied),
}));
```

### 6.2 AI API 최적화

#### 6.2.1 토큰 사용 최적화

```typescript
// src/lib/ai/utils/optimize.ts

export function optimizePrompt(data: any): string {
  // 불필요한 데이터 제거
  const essential = extractEssentialData(data);

  // 프롬프트 압축
  return compressPrompt(essential);
}

// 예: 과거 여행 데이터에서 핵심만 추출
function extractEssentialData(trips: Trip[]) {
  return trips.map(trip => ({
    destination: trip.destination,
    type: trip.tripType,
    budget: trip.budget,
    // 상세 일정은 제외하고 요약만
    summary: summarizeItinerary(trip.itineraries),
  }));
}
```

#### 6.2.2 캐싱 전략

```typescript
// src/lib/ai/cache.ts

import { unstable_cache } from 'next/cache';

export const getCachedPlaceRecommendations = unstable_cache(
  async (destination: string, tripType: string) => {
    return await recommendPlaces({ destination, tripType });
  },
  ['place-recommendations'],
  {
    revalidate: 3600, // 1시간 캐시
    tags: ['ai', 'recommendations'],
  }
);
```

#### 6.2.3 요청 제한 (Rate Limiting)

```typescript
// src/lib/ai/rateLimit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const aiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 1분당 10회
  analytics: true,
});

// 사용 예시
export async function generateItineraryWithLimit(userId: string, input: TripInput) {
  const { success } = await aiRateLimit.limit(userId);

  if (!success) {
    throw new RateLimitError('요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.');
  }

  return await generateItinerary(input);
}
```

#### 6.2.4 스트리밍 응답

```typescript
// src/app/api/ai/generate-itinerary/route.ts

import { streamText } from 'ai';

export async function POST(req: Request) {
  const body = await req.json();

  const result = await streamText({
    model: openrouter('anthropic/claude-haiku-4.5'),
    prompt: buildItineraryPrompt(body),
  });

  // 스트리밍 응답으로 빠른 초기 응답
  return result.toDataStreamResponse();
}
```

### 6.3 입력 검증

```typescript
// src/lib/validations/schemas.ts

import { z } from 'zod';

// 여행 생성 스키마
export const createTripSchema = z.object({
  name: z.string()
    .min(1, '여행 이름을 입력하세요')
    .max(100, '여행 이름은 100자 이하여야 합니다'),

  destination: z.string()
    .min(1, '목적지를 입력하세요')
    .max(100),

  country: z.string()
    .min(1, '국가를 입력하세요')
    .max(50),

  startDate: z.string()
    .datetime()
    .refine(date => new Date(date) >= new Date(), {
      message: '시작일은 오늘 이후여야 합니다',
    }),

  endDate: z.string()
    .datetime(),

  budget: z.number()
    .min(0, '예산은 0 이상이어야 합니다')
    .max(1_000_000_000, '예산이 너무 큽니다'),

  travelers: z.number()
    .int()
    .min(1, '여행자는 최소 1명이어야 합니다')
    .max(100, '여행자는 최대 100명까지 가능합니다'),

  tripType: z.enum(['vacation', 'business', 'adventure', 'backpacking']),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: '종료일은 시작일 이후여야 합니다',
  path: ['endDate'],
});

// AI 일정 생성 입력 스키마
export const aiItineraryInputSchema = z.object({
  tripId: z.string().uuid(),
  destination: z.string().min(1).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  budget: z.number().min(0),
  travelers: z.number().int().min(1).max(100),
  preferences: z.array(z.string()).max(10, '선호도는 최대 10개까지 가능합니다'),
});

// AI 응답 검증 스키마
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

// SQL Injection 방지 (Drizzle ORM 사용으로 자동 방지)
// XSS 방지
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
```

### 6.4 환경별 DB 연결

```typescript
// src/lib/db/index.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 환경별 DB URL
const getDatabaseUrl = (): string => {
  const env = process.env.NODE_ENV;

  if (env === 'production') {
    // 프로덕션: Vercel Postgres
    return process.env.DATABASE_URL!;
  } else if (env === 'development') {
    // 개발계: 원격 개발 DB
    return process.env.DEV_DATABASE_URL || process.env.DATABASE_URL!;
  } else {
    // 로컬: Docker PostgreSQL
    return process.env.LOCAL_DATABASE_URL ||
           'postgresql://budget:budget123@localhost:5432/travel_planner';
  }
};

// 연결 풀 설정
const connectionString = getDatabaseUrl();

const client = postgres(connectionString, {
  max: process.env.NODE_ENV === 'production' ? 10 : 5, // 환경별 커넥션 풀 크기
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

// Health Check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
```

```typescript
// drizzle.config.ts

import type { Config } from 'drizzle-kit';

const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.DATABASE_URL!;
  } else if (process.env.NODE_ENV === 'development') {
    return process.env.DEV_DATABASE_URL || process.env.DATABASE_URL!;
  } else {
    return 'postgresql://budget:budget123@localhost:5432/travel_planner';
  }
};

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: getDatabaseUrl(),
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

### 6.5 보안 체크리스트

```typescript
// 환경 변수 검증
// src/lib/env.ts

import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENROUTER_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

**보안 조치**:
- ✅ SQL Injection 방지 (Drizzle ORM parameterized queries)
- ✅ XSS 방지 (입력 sanitization)
- ✅ CSRF 방지 (Next.js 기본 제공)
- ✅ Rate Limiting (AI API 남용 방지)
- ✅ 환경 변수 검증
- ✅ API 키 보안 (서버 사이드만 사용)
- ✅ HTTPS 강제 (프로덕션)

## 7. 데이터 흐름

### 7.1 AI 일정 생성 흐름

```mermaid
sequenceDiagram
    actor User
    participant UI as UI Component
    participant API as API Route
    participant Val as Validation
    participant Service as AI Service
    participant Prompt as Prompt Builder
    participant OpenRouter as Open Router
    participant DB as Database

    User->>UI: 여행 정보 입력 & 생성 요청
    UI->>API: POST /api/ai/generate-itinerary
    API->>Val: 입력 검증

    alt 검증 실패
        Val-->>API: ValidationError
        API-->>UI: 400 Error
        UI-->>User: 에러 메시지 표시
    end

    Val->>Service: generateItinerary(input)
    Service->>Prompt: buildPrompt(input)
    Prompt-->>Service: 프롬프트 텍스트

    Service->>OpenRouter: generateText(model, prompt)

    alt AI API 실패
        OpenRouter-->>Service: Error
        Service->>Service: 재시도 (최대 3회)
        alt 재시도 실패
            Service-->>API: AIServiceError
            API-->>UI: 500 Error
            UI-->>User: 에러 메시지 표시
        end
    end

    OpenRouter-->>Service: JSON 응답
    Service->>Service: JSON 파싱 & 검증

    alt JSON 검증 실패
        Service-->>API: ValidationError
        API-->>UI: 400 Error
        UI-->>User: 에러 메시지 표시
    end

    Service->>DB: 추천 저장
    DB-->>Service: 저장 완료
    Service-->>API: 일정 데이터
    API-->>UI: 200 OK + JSON
    UI-->>User: 일정 표시
```

### 7.2 예산 추적 흐름

```mermaid
flowchart LR
    User[사용자] -->|지출 입력| UI[UI]
    UI -->|POST| API[API Route]
    API -->|저장| DB[(Database)]
    DB -->|집계| Stats[통계 계산]
    Stats -->|차트 데이터| UI
    UI -->|Recharts| Chart[차트 표시]

    DB -->|예산 초과시| Alert[알림]
    Alert -->|푸시| User

    style DB fill:#e1ffe1
    style Alert fill:#ffe1e1
```

## 8. 성능 목표

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| AI 응답 시간 | < 5초 | 평균 응답 시간 |
| 페이지 로드 | < 2초 | Lighthouse |
| DB 쿼리 | < 100ms | 평균 쿼리 시간 |
| API 가용성 | > 99.5% | Uptime 모니터링 |

**최적화 전략**:
- Server Components 활용 (데이터 페칭)
- 동적 import로 코드 스플리팅
- 이미지 최적화 (next/image)
- DB 쿼리 최적화 (인덱스, 조인)
- AI 응답 캐싱 (유사한 요청)

## 9. 모니터링 & 로깅

```typescript
// src/lib/monitoring/logger.ts

export function logAIRequest(params: {
  userId: string;
  type: string;
  inputTokens: number;
  outputTokens: number;
  duration: number;
  success: boolean;
  error?: string;
}) {
  console.log('[AI Request]', {
    timestamp: new Date().toISOString(),
    ...params,
  });

  // 프로덕션: 외부 로깅 서비스 (예: Sentry, LogRocket)
}
```

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-15
**작성자**: AI Travel Planner Team
