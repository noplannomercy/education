# AI Travel Planner - 데이터베이스 설계

## 1. 스키마 개요

### 1.1 테이블 구조

총 5개의 테이블로 구성:

1. **trips** - 여행 정보
2. **destinations** - 목적지 데이터베이스
3. **itineraries** - 일정 관리
4. **expenses** - 지출 추적
5. **ai_recommendations** - AI 추천 저장

### 1.2 ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    trips ||--o{ itineraries : "has many"
    trips ||--o{ expenses : "has many"
    trips ||--o{ ai_recommendations : "has many"
    destinations ||--o{ itineraries : "referenced by"

    trips {
        uuid id PK
        string userId
        string name
        string destination
        string country
        date startDate
        date endDate
        decimal budget
        decimal actualSpent
        int travelers
        enum tripType
        enum status
        int version
        timestamp createdAt
        timestamp updatedAt
    }

    destinations {
        uuid id PK
        string name
        string city
        string country
        enum category
        decimal averageCost
        int recommendedDuration
        text description
        text notes
        timestamp createdAt
    }

    itineraries {
        uuid id PK
        uuid tripId FK
        date date
        time startTime
        time endTime
        uuid destinationId FK
        string activity
        text notes
        enum priority
        boolean completed
        int order
        timestamp createdAt
    }

    expenses {
        uuid id PK
        uuid tripId FK
        enum category
        decimal amount
        string currency
        string description
        date date
        timestamp createdAt
    }

    ai_recommendations {
        uuid id PK
        uuid tripId FK
        enum type
        string title
        text content
        jsonb metadata
        boolean applied
        timestamp createdAt
    }
```

### 1.3 테이블 관계

| 관계 | 설명 | 제약 조건 |
|------|------|-----------|
| `trips` → `itineraries` | 1:N | CASCADE DELETE |
| `trips` → `expenses` | 1:N | CASCADE DELETE |
| `trips` → `ai_recommendations` | 1:N | CASCADE DELETE |
| `destinations` → `itineraries` | 1:N | NULLABLE (직접 입력 가능) |

**관계 설명**:
- 하나의 여행(`trips`)은 여러 일정(`itineraries`)을 가질 수 있음
- 하나의 여행(`trips`)은 여러 지출(`expenses`)을 가질 수 있음
- 하나의 여행(`trips`)은 여러 AI 추천(`ai_recommendations`)을 가질 수 있음
- 일정(`itineraries`)은 목적지(`destinations`)를 참조할 수 있음 (선택적)
- 여행 삭제 시 관련된 모든 일정, 지출, AI 추천도 함께 삭제됨 (CASCADE)

---

## 2. 테이블 정의

### 2.1 trips (여행)

여행의 기본 정보를 저장하는 핵심 테이블.

| 필드 | 타입 | 제약 조건 | 설명 |
|------|------|-----------|------|
| `id` | UUID | PRIMARY KEY | 여행 고유 ID |
| `userId` | VARCHAR(255) | NOT NULL | 사용자 ID (멀티 유저 지원) |
| `name` | VARCHAR(255) | NOT NULL | 여행 이름 |
| `destination` | VARCHAR(255) | NOT NULL | 목적지 (도시) |
| `country` | VARCHAR(100) | NOT NULL | 국가 |
| `startDate` | DATE | NOT NULL | 출발일 |
| `endDate` | DATE | NOT NULL | 종료일 |
| `budget` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | 예산 (원) |
| `actualSpent` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | 실제 지출 (원) |
| `travelers` | INTEGER | NOT NULL, DEFAULT 1 | 여행 인원 |
| `tripType` | ENUM | NOT NULL | 여행 유형 |
| `status` | ENUM | NOT NULL, DEFAULT 'planning' | 진행 상태 |
| `version` | INTEGER | NOT NULL, DEFAULT 1 | Optimistic Locking용 버전 |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | 생성 일시 |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | 수정 일시 (자동 업데이트) |

**Enum 값**:
- `tripType`: `'vacation'`, `'business'`, `'adventure'`, `'backpacking'`
- `status`: `'planning'`, `'ongoing'`, `'completed'`

**인덱스**:
- `trips_user_id_idx` - 사용자별 여행 조회 (멀티 유저 지원)
- `trips_start_date_idx` - 날짜 기반 검색
- `trips_status_idx` - 상태별 필터링
- `trips_destination_idx` - 목적지 검색
- `trips_trip_type_idx` - 여행 유형별 필터링

**비즈니스 규칙**:
- `endDate`는 `startDate`보다 이후여야 함
- `budget`은 0 이상이어야 함
- `travelers`는 1 이상이어야 함
- `actualSpent`는 0 이상이어야 함

---

### 2.2 destinations (목적지)

여행지 정보를 저장하는 참조 테이블.

| 필드 | 타입 | 제약 조건 | 설명 |
|------|------|-----------|------|
| `id` | UUID | PRIMARY KEY | 목적지 고유 ID |
| `name` | VARCHAR(255) | NOT NULL | 목적지 이름 |
| `city` | VARCHAR(100) | NOT NULL | 도시 |
| `country` | VARCHAR(100) | NOT NULL | 국가 |
| `category` | ENUM | NOT NULL | 카테고리 |
| `averageCost` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | 평균 비용 (원) |
| `recommendedDuration` | INTEGER | NOT NULL, DEFAULT 60 | 추천 체류 시간 (분) |
| `description` | TEXT | NULL | 설명 |
| `notes` | TEXT | NULL | 메모 |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | 생성 일시 |

**Enum 값**:
- `category`: `'attraction'`, `'restaurant'`, `'accommodation'`, `'shopping'`, `'activity'`

**인덱스**:
- `destinations_city_idx` - 도시별 검색
- `destinations_country_idx` - 국가별 검색
- `destinations_category_idx` - 카테고리별 필터링
- `destinations_city_category_idx` - 복합 인덱스 (도시 + 카테고리)

**비즈니스 규칙**:
- `averageCost`는 0 이상이어야 함
- `recommendedDuration`은 0 이상이어야 함

---

### 2.3 itineraries (일정)

날짜별 여행 일정을 저장하는 테이블.

| 필드 | 타입 | 제약 조건 | 설명 |
|------|------|-----------|------|
| `id` | UUID | PRIMARY KEY | 일정 고유 ID |
| `tripId` | UUID | FOREIGN KEY, NOT NULL | 여행 ID (→ trips) |
| `date` | DATE | NOT NULL | 일정 날짜 |
| `startTime` | TIME | NOT NULL | 시작 시간 |
| `endTime` | TIME | NOT NULL | 종료 시간 |
| `destinationId` | UUID | FOREIGN KEY, NULL | 목적지 ID (→ destinations) |
| `activity` | VARCHAR(500) | NOT NULL | 활동 내용 |
| `notes` | TEXT | NULL | 메모 |
| `priority` | ENUM | NOT NULL, DEFAULT 'medium' | 우선순위 |
| `completed` | BOOLEAN | NOT NULL, DEFAULT false | 완료 여부 |
| `order` | INTEGER | NOT NULL, DEFAULT 0 | 일정 순서 |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | 생성 일시 |

**Enum 값**:
- `priority`: `'high'`, `'medium'`, `'low'`

**외래 키**:
- `tripId` → `trips(id)` ON DELETE CASCADE
- `destinationId` → `destinations(id)` ON DELETE SET NULL (선택적)

**인덱스**:
- `itineraries_trip_id_idx` - 여행별 일정 조회
- `itineraries_date_idx` - 날짜별 일정 조회
- `itineraries_trip_date_idx` - 복합 인덱스 (여행 + 날짜)
- `itineraries_trip_order_idx` - 복합 인덱스 (여행 + 순서)

**비즈니스 규칙**:
- `endTime`은 `startTime`보다 이후여야 함
- `date`는 해당 여행의 `startDate`와 `endDate` 사이여야 함
- 같은 `tripId`와 `date`에서 `order`는 고유해야 함

---

### 2.4 expenses (지출)

여행 경비를 기록하는 테이블.

| 필드 | 타입 | 제약 조건 | 설명 |
|------|------|-----------|------|
| `id` | UUID | PRIMARY KEY | 지출 고유 ID |
| `tripId` | UUID | FOREIGN KEY, NOT NULL | 여행 ID (→ trips) |
| `category` | ENUM | NOT NULL | 카테고리 |
| `amount` | DECIMAL(10,2) | NOT NULL | 금액 |
| `currency` | VARCHAR(3) | NOT NULL, DEFAULT 'KRW' | 통화 (ISO 4217) |
| `description` | VARCHAR(500) | NOT NULL | 설명 |
| `date` | DATE | NOT NULL | 지출 날짜 |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | 생성 일시 |

**Enum 값**:
- `category`: `'transport'`, `'accommodation'`, `'food'`, `'activity'`, `'shopping'`, `'other'`

**외래 키**:
- `tripId` → `trips(id)` ON DELETE CASCADE

**인덱스**:
- `expenses_trip_id_idx` - 여행별 지출 조회
- `expenses_category_idx` - 카테고리별 집계
- `expenses_date_idx` - 날짜별 지출 조회
- `expenses_trip_category_idx` - 복합 인덱스 (여행 + 카테고리)

**비즈니스 규칙**:
- `amount`는 0 이상이어야 함
- `date`는 해당 여행의 `startDate`와 `endDate` 사이여야 함

---

### 2.5 ai_recommendations (AI 추천)

AI가 생성한 추천 정보를 저장하는 테이블.

| 필드 | 타입 | 제약 조건 | 설명 |
|------|------|-----------|------|
| `id` | UUID | PRIMARY KEY | 추천 고유 ID |
| `tripId` | UUID | FOREIGN KEY, NOT NULL | 여행 ID (→ trips) |
| `type` | ENUM | NOT NULL | 추천 타입 |
| `title` | VARCHAR(255) | NOT NULL | 추천 제목 |
| `content` | TEXT | NOT NULL | 추천 내용 |
| `metadata` | JSONB | NULL | 추가 메타데이터 |
| `applied` | BOOLEAN | NOT NULL, DEFAULT false | 적용 여부 |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | 생성 일시 |

**Enum 값**:
- `type`: `'itinerary'`, `'place'`, `'budget'`, `'optimization'`, `'insight'`

**외래 키**:
- `tripId` → `trips(id)` ON DELETE CASCADE

**인덱스**:
- `ai_recs_trip_id_idx` - 여행별 추천 조회
- `ai_recs_type_idx` - 타입별 필터링
- `ai_recs_applied_idx` - 적용 여부별 필터링
- `ai_recs_trip_type_idx` - 복합 인덱스 (여행 + 타입)

**JSONB metadata 예시**:
```json
{
  "aiModel": "anthropic/claude-haiku-4.5",
  "tokensUsed": 1200,
  "responseTime": 3.5,
  "confidence": 0.92,
  "originalInput": {
    "destination": "파리",
    "budget": 2000000,
    "preferences": ["미술관", "카페"]
  }
}
```

**비즈니스 규칙**:
- 같은 `tripId`에 대해 같은 `type`의 추천은 최대 10개까지 저장
- 30일 이상 된 적용되지 않은 추천은 자동 삭제 가능

---

## 3. Drizzle 스키마 코드

### 3.1 전체 스키마 (schema.ts)

```typescript
// src/lib/db/schema.ts

import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  time,
  timestamp,
  decimal,
  integer,
  boolean,
  jsonb,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// ============================================================================
// Enums
// ============================================================================

export const tripTypeEnum = pgEnum('trip_type', [
  'vacation',
  'business',
  'adventure',
  'backpacking',
]);

export const tripStatusEnum = pgEnum('trip_status', [
  'planning',
  'ongoing',
  'completed',
]);

export const destinationCategoryEnum = pgEnum('destination_category', [
  'attraction',
  'restaurant',
  'accommodation',
  'shopping',
  'activity',
]);

export const priorityEnum = pgEnum('priority', [
  'high',
  'medium',
  'low',
]);

export const expenseCategoryEnum = pgEnum('expense_category', [
  'transport',
  'accommodation',
  'food',
  'activity',
  'shopping',
  'other',
]);

export const aiRecommendationTypeEnum = pgEnum('ai_recommendation_type', [
  'itinerary',
  'place',
  'budget',
  'optimization',
  'insight',
]);

// ============================================================================
// Tables
// ============================================================================

// 1. trips (여행)
export const trips = pgTable(
  'trips',
  {
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
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()), // Auto-update
  },
  (table) => ({
    userIdIdx: index('trips_user_id_idx').on(table.userId),
    startDateIdx: index('trips_start_date_idx').on(table.startDate),
    statusIdx: index('trips_status_idx').on(table.status),
    destinationIdx: index('trips_destination_idx').on(table.destination),
    tripTypeIdx: index('trips_trip_type_idx').on(table.tripType),
  })
);

// 2. destinations (목적지)
export const destinations = pgTable(
  'destinations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    country: varchar('country', { length: 100 }).notNull(),
    category: destinationCategoryEnum('category').notNull(),
    averageCost: decimal('average_cost', { precision: 10, scale: 2 }).notNull().default('0'),
    recommendedDuration: integer('recommended_duration').notNull().default(60), // 분
    description: text('description'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    cityIdx: index('destinations_city_idx').on(table.city),
    countryIdx: index('destinations_country_idx').on(table.country),
    categoryIdx: index('destinations_category_idx').on(table.category),
    cityCategoryIdx: index('destinations_city_category_idx').on(table.city, table.category),
  })
);

// 3. itineraries (일정)
export const itineraries = pgTable(
  'itineraries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    destinationId: uuid('destination_id').references(() => destinations.id, {
      onDelete: 'set null',
    }),
    activity: varchar('activity', { length: 500 }).notNull(),
    notes: text('notes'),
    priority: priorityEnum('priority').notNull().default('medium'),
    completed: boolean('completed').notNull().default(false),
    order: integer('order').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tripIdIdx: index('itineraries_trip_id_idx').on(table.tripId),
    dateIdx: index('itineraries_date_idx').on(table.date),
    tripDateIdx: index('itineraries_trip_date_idx').on(table.tripId, table.date),
    tripOrderIdx: index('itineraries_trip_order_idx').on(table.tripId, table.order),
  })
);

// 4. expenses (지출)
export const expenses = pgTable(
  'expenses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    category: expenseCategoryEnum('category').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('KRW'),
    description: varchar('description', { length: 500 }).notNull(),
    date: date('date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tripIdIdx: index('expenses_trip_id_idx').on(table.tripId),
    categoryIdx: index('expenses_category_idx').on(table.category),
    dateIdx: index('expenses_date_idx').on(table.date),
    tripCategoryIdx: index('expenses_trip_category_idx').on(table.tripId, table.category),
  })
);

// 5. ai_recommendations (AI 추천)
export const aiRecommendations = pgTable(
  'ai_recommendations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    type: aiRecommendationTypeEnum('type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    metadata: jsonb('metadata'),
    applied: boolean('applied').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tripIdIdx: index('ai_recs_trip_id_idx').on(table.tripId),
    typeIdx: index('ai_recs_type_idx').on(table.type),
    appliedIdx: index('ai_recs_applied_idx').on(table.applied),
    tripTypeIdx: index('ai_recs_trip_type_idx').on(table.tripId, table.type),
  })
);

// ============================================================================
// Relations
// ============================================================================

export const tripsRelations = relations(trips, ({ many }) => ({
  itineraries: many(itineraries),
  expenses: many(expenses),
  aiRecommendations: many(aiRecommendations),
}));

export const destinationsRelations = relations(destinations, ({ many }) => ({
  itineraries: many(itineraries),
}));

export const itinerariesRelations = relations(itineraries, ({ one }) => ({
  trip: one(trips, {
    fields: [itineraries.tripId],
    references: [trips.id],
  }),
  destination: one(destinations, {
    fields: [itineraries.destinationId],
    references: [destinations.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  trip: one(trips, {
    fields: [expenses.tripId],
    references: [trips.id],
  }),
}));

export const aiRecommendationsRelations = relations(aiRecommendations, ({ one }) => ({
  trip: one(trips, {
    fields: [aiRecommendations.tripId],
    references: [trips.id],
  }),
}));

// ============================================================================
// Type Inference
// ============================================================================

// Select types (DB → TypeScript)
export type Trip = InferSelectModel<typeof trips>;
export type Destination = InferSelectModel<typeof destinations>;
export type Itinerary = InferSelectModel<typeof itineraries>;
export type Expense = InferSelectModel<typeof expenses>;
export type AIRecommendation = InferSelectModel<typeof aiRecommendations>;

// Insert types (TypeScript → DB)
export type NewTrip = InferInsertModel<typeof trips>;
export type NewDestination = InferInsertModel<typeof destinations>;
export type NewItinerary = InferInsertModel<typeof itineraries>;
export type NewExpense = InferInsertModel<typeof expenses>;
export type NewAIRecommendation = InferInsertModel<typeof aiRecommendations>;

// With relations types
export type TripWithRelations = Trip & {
  itineraries: Itinerary[];
  expenses: Expense[];
  aiRecommendations: AIRecommendation[];
};

export type ItineraryWithRelations = Itinerary & {
  trip: Trip;
  destination: Destination | null;
};
```

### 3.2 데이터베이스 연결 (index.ts)

```typescript
// src/lib/db/index.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 환경별 DB URL
const getDatabaseUrl = (): string => {
  const env = process.env.NODE_ENV;

  if (env === 'production') {
    return process.env.DATABASE_URL!;
  } else if (env === 'development') {
    return process.env.DEV_DATABASE_URL || process.env.DATABASE_URL!;
  } else {
    return (
      process.env.LOCAL_DATABASE_URL ||
      'postgresql://budget:budget123@localhost:5432/travel_planner'
    );
  }
};

// 연결 설정
const connectionString = getDatabaseUrl();

const client = postgres(connectionString, {
  max: process.env.NODE_ENV === 'production' ? 10 : 5,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Drizzle 인스턴스
export const db = drizzle(client, { schema });

// Health Check
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

### 3.3 Drizzle 설정 (drizzle.config.ts)

```typescript
// drizzle.config.ts

import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.DATABASE_URL!;
  } else if (process.env.NODE_ENV === 'development') {
    return process.env.DEV_DATABASE_URL || process.env.DATABASE_URL!;
  } else {
    return (
      process.env.LOCAL_DATABASE_URL ||
      'postgresql://budget:budget123@localhost:5432/travel_planner'
    );
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

---

## 4. 인덱스 전략

### 4.1 인덱스 목적별 분류

```mermaid
graph TD
    A[인덱스 전략] --> B[기본 조회]
    A --> C[날짜 기반]
    A --> D[집계 쿼리]
    A --> E[복합 조건]

    B --> B1[trips_status_idx<br/>여행 상태별 필터]
    B --> B2[itineraries_trip_id_idx<br/>여행별 일정 조회]
    B --> B3[expenses_trip_id_idx<br/>여행별 지출 조회]

    C --> C1[trips_start_date_idx<br/>출발일 정렬]
    C --> C2[itineraries_date_idx<br/>날짜별 일정]
    C --> C3[expenses_date_idx<br/>날짜별 지출]

    D --> D1[expenses_category_idx<br/>카테고리별 집계]
    D --> D2[destinations_category_idx<br/>카테고리별 목적지]

    E --> E1[itineraries_trip_date_idx<br/>여행+날짜 조회]
    E --> E2[expenses_trip_category_idx<br/>여행+카테고리 집계]

    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#ffe1f5
    style D fill:#e1ffe1
    style E fill:#f5e1ff
```

### 4.2 주요 쿼리별 인덱스 활용

#### 쿼리 1: 여행 목록 조회 (상태별)
```sql
SELECT * FROM trips
WHERE status = 'ongoing'
ORDER BY start_date DESC;
```
**사용 인덱스**: `trips_status_idx`, `trips_start_date_idx`

#### 쿼리 2: 특정 날짜의 일정 조회
```sql
SELECT * FROM itineraries
WHERE trip_id = '...' AND date = '2026-03-01'
ORDER BY "order";
```
**사용 인덱스**: `itineraries_trip_date_idx`

#### 쿼리 3: 카테고리별 지출 집계
```sql
SELECT category, SUM(amount)
FROM expenses
WHERE trip_id = '...'
GROUP BY category;
```
**사용 인덱스**: `expenses_trip_category_idx`

#### 쿼리 4: 목적지 검색 (도시 + 카테고리)
```sql
SELECT * FROM destinations
WHERE city = '파리' AND category = 'restaurant';
```
**사용 인덱스**: `destinations_city_category_idx`

#### 쿼리 5: AI 추천 조회 (여행 + 타입)
```sql
SELECT * FROM ai_recommendations
WHERE trip_id = '...' AND type = 'place'
ORDER BY created_at DESC;
```
**사용 인덱스**: `ai_recs_trip_type_idx`

### 4.3 인덱스 성능 분석

| 인덱스 | 예상 카디널리티 | 사용 빈도 | 우선순위 |
|--------|----------------|-----------|----------|
| `trips_status_idx` | 낮음 (3개 값) | 높음 | ⭐⭐⭐ |
| `trips_start_date_idx` | 높음 | 높음 | ⭐⭐⭐ |
| `itineraries_trip_date_idx` | 높음 | 매우 높음 | ⭐⭐⭐ |
| `expenses_trip_category_idx` | 중간 | 높음 | ⭐⭐⭐ |
| `destinations_city_category_idx` | 높음 | 중간 | ⭐⭐ |
| `ai_recs_trip_type_idx` | 중간 | 중간 | ⭐⭐ |

### 4.4 인덱스 유지 관리

**주기적 점검**:
```sql
-- 인덱스 사용 통계 확인
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 사용하지 않는 인덱스 확인
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_%';

-- 인덱스 크기 확인
SELECT
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## 5. 마이그레이션

### 5.1 초기 마이그레이션 생성

```bash
# 마이그레이션 생성
npx drizzle-kit generate

# 마이그레이션 실행
npx drizzle-kit push

# 또는
npx drizzle-kit migrate
```

### 5.2 마이그레이션 예시

```sql
-- 0000_initial_schema.sql

-- Enums
CREATE TYPE trip_type AS ENUM ('vacation', 'business', 'adventure', 'backpacking');
CREATE TYPE trip_status AS ENUM ('planning', 'ongoing', 'completed');
CREATE TYPE destination_category AS ENUM ('attraction', 'restaurant', 'accommodation', 'shopping', 'activity');
CREATE TYPE priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE expense_category AS ENUM ('transport', 'accommodation', 'food', 'activity', 'shopping', 'other');
CREATE TYPE ai_recommendation_type AS ENUM ('itinerary', 'place', 'budget', 'optimization', 'insight');

-- Tables
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  actual_spent DECIMAL(12,2) NOT NULL DEFAULT 0,
  travelers INTEGER NOT NULL DEFAULT 1,
  trip_type trip_type NOT NULL,
  status trip_status NOT NULL DEFAULT 'planning',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  category destination_category NOT NULL,
  average_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  recommended_duration INTEGER NOT NULL DEFAULT 60,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
  activity VARCHAR(500) NOT NULL,
  notes TEXT,
  priority priority NOT NULL DEFAULT 'medium',
  completed BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category expense_category NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'KRW',
  description VARCHAR(500) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  type ai_recommendation_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX trips_start_date_idx ON trips(start_date);
CREATE INDEX trips_status_idx ON trips(status);
CREATE INDEX trips_destination_idx ON trips(destination);
CREATE INDEX trips_trip_type_idx ON trips(trip_type);

CREATE INDEX destinations_city_idx ON destinations(city);
CREATE INDEX destinations_country_idx ON destinations(country);
CREATE INDEX destinations_category_idx ON destinations(category);
CREATE INDEX destinations_city_category_idx ON destinations(city, category);

CREATE INDEX itineraries_trip_id_idx ON itineraries(trip_id);
CREATE INDEX itineraries_date_idx ON itineraries(date);
CREATE INDEX itineraries_trip_date_idx ON itineraries(trip_id, date);
CREATE INDEX itineraries_trip_order_idx ON itineraries(trip_id, "order");

CREATE INDEX expenses_trip_id_idx ON expenses(trip_id);
CREATE INDEX expenses_category_idx ON expenses(category);
CREATE INDEX expenses_date_idx ON expenses(date);
CREATE INDEX expenses_trip_category_idx ON expenses(trip_id, category);

CREATE INDEX ai_recs_trip_id_idx ON ai_recommendations(trip_id);
CREATE INDEX ai_recs_type_idx ON ai_recommendations(type);
CREATE INDEX ai_recs_applied_idx ON ai_recommendations(applied);
CREATE INDEX ai_recs_trip_type_idx ON ai_recommendations(trip_id, type);
```

---

## 6. 샘플 데이터

### 6.1 시드 데이터 스크립트

```typescript
// src/lib/db/seed.ts

import { db } from './index';
import { trips, destinations, itineraries, expenses } from './schema';

export async function seed() {
  // 1. 목적지 생성
  const [eiffelTower] = await db
    .insert(destinations)
    .values({
      name: '에펠탑',
      city: '파리',
      country: '프랑스',
      category: 'attraction',
      averageCost: '25000',
      recommendedDuration: 120,
      description: '파리의 상징적인 철탑',
    })
    .returning();

  // 2. 여행 생성
  const [parisTrip] = await db
    .insert(trips)
    .values({
      name: '파리 봄나들이',
      destination: '파리',
      country: '프랑스',
      startDate: '2026-03-15',
      endDate: '2026-03-20',
      budget: '2500000',
      travelers: 2,
      tripType: 'vacation',
      status: 'planning',
    })
    .returning();

  // 3. 일정 생성
  await db.insert(itineraries).values({
    tripId: parisTrip.id,
    date: '2026-03-15',
    startTime: '10:00:00',
    endTime: '12:00:00',
    destinationId: eiffelTower.id,
    activity: '에펠탑 방문 및 사진 촬영',
    priority: 'high',
    order: 1,
  });

  // 4. 지출 기록
  await db.insert(expenses).values({
    tripId: parisTrip.id,
    category: 'transport',
    amount: '150000',
    description: '파리 왕복 항공권',
    date: '2026-03-15',
  });

  console.log('✅ Seed data inserted');
}
```

실행:
```bash
npx tsx src/lib/db/seed.ts
```

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-15
**작성자**: AI Travel Planner Team
