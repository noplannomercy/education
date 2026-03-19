# AI Study Planner - Database Schema

## 1. Schema Overview

### 1.1 Tables Summary

| Table | Purpose | Records |
|-------|---------|---------|
| subjects | 과목/토픽 관리 | 과목당 1개 |
| study_sessions | 학습 세션 기록 | 세션당 1개 |
| learning_plans | AI 생성 학습 계획 | 주간 계획 |
| review_schedules | 복습 일정 | 세션당 N개 |
| motivations | AI 동기부여 메시지 | 일별 생성 |

### 1.2 ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    subjects ||--o{ study_sessions : "has many"
    subjects ||--o{ learning_plans : "has many"
    study_sessions ||--o{ review_schedules : "generates"

    subjects {
        uuid id PK
        string name
        string color
        enum difficulty
        date target_date
        int target_score
        timestamp created_at
        timestamp updated_at
    }

    study_sessions {
        uuid id PK
        uuid subject_id FK
        string topic
        int duration
        int comprehension
        text notes
        date date
        timestamp created_at
    }

    learning_plans {
        uuid id PK
        uuid subject_id FK
        string title
        text description
        string status
        date week_start
        date week_end
        jsonb daily_plan
        timestamp created_at
    }

    review_schedules {
        uuid id PK
        uuid session_id FK
        date review_date
        boolean completed
        timestamp completed_at
        int comprehension
        date next_review_date
        int repetition_count
        timestamp created_at
    }

    motivations {
        uuid id PK
        text message
        enum type
        timestamp generated_at
    }
```

### 1.3 Relationships

| Relationship | Type | ON DELETE | Description |
|--------------|------|-----------|-------------|
| subjects → study_sessions | 1:N | CASCADE | 과목별 여러 학습 세션 |
| subjects → learning_plans | 1:N | CASCADE | 과목별 여러 주간 계획 |
| study_sessions → review_schedules | 1:N | CASCADE | 세션당 여러 복습 일정 |
| motivations | Standalone | - | 독립 테이블 |

---

## 2. Table Definitions

### 2.1 subjects (과목)

과목 및 학습 목표 관리 테이블.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 고유 식별자 |
| name | varchar(100) | NOT NULL, UNIQUE | 과목명 |
| color | varchar(7) | NOT NULL, DEFAULT '#3B82F6' | HEX 색상 코드 |
| difficulty | enum | NOT NULL, DEFAULT 'medium' | 난이도 |
| target_date | date | NULL | 시험일 |
| target_score | integer | NULL, CHECK (0-100) | 목표 점수 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | 수정일시 |

**Enum: difficulty**
```sql
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
```

**Indexes:**
```sql
CREATE INDEX idx_subjects_name ON subjects(name);
CREATE INDEX idx_subjects_created_at ON subjects(created_at DESC);
```

**Drizzle Schema:**
```typescript
export const difficultyEnum = pgEnum('difficulty_level', ['easy', 'medium', 'hard']);

export const subjects = pgTable('subjects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  color: varchar('color', { length: 7 }).notNull().default('#3B82F6'),
  difficulty: difficultyEnum('difficulty').notNull().default('medium'),
  targetDate: date('target_date'),
  targetScore: integer('target_score'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

---

### 2.2 study_sessions (학습 세션)

개별 학습 기록 저장 테이블.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 고유 식별자 |
| subject_id | uuid | FK → subjects(id), **ON DELETE CASCADE** | 과목 참조 |
| topic | varchar(200) | NOT NULL | 학습 토픽 |
| duration | integer | NOT NULL, CHECK (1-480) | 소요 시간 (분) |
| comprehension | integer | NOT NULL, CHECK (1-5) | 이해도 |
| notes | text | NULL | 메모 |
| date | date | NOT NULL | 학습 날짜 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 생성일시 |

**Indexes:**
```sql
CREATE INDEX idx_sessions_subject_id ON study_sessions(subject_id);
CREATE INDEX idx_sessions_date ON study_sessions(date DESC);
CREATE INDEX idx_sessions_subject_date ON study_sessions(subject_id, date);
```

**Drizzle Schema:**
```typescript
export const studySessions = pgTable('study_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  subjectId: uuid('subject_id').notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  topic: varchar('topic', { length: 200 }).notNull(),
  duration: integer('duration').notNull(),
  comprehension: integer('comprehension').notNull(),
  notes: text('notes'),
  date: date('date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  subjectIdIdx: index('idx_sessions_subject_id').on(table.subjectId),
  dateIdx: index('idx_sessions_date').on(table.date),
}));
```

---

### 2.3 learning_plans (AI 학습 계획)

AI가 생성한 주간 학습 계획 저장.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 고유 식별자 |
| subject_id | uuid | FK → subjects(id), **ON DELETE CASCADE** | 과목 참조 |
| title | varchar(200) | NOT NULL | 계획 제목 |
| description | text | NULL | 계획 설명 |
| status | varchar(20) | NOT NULL, DEFAULT 'active' | 상태 (active/completed/archived) |
| week_start | date | NOT NULL | 주 시작일 |
| week_end | date | NOT NULL | 주 종료일 |
| daily_plan | jsonb | NOT NULL | 일별 계획 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 생성일시 |

**JSONB Structure (daily_plan):**
```typescript
type DailyPlan = {
  monday?: DayPlan;
  tuesday?: DayPlan;
  wednesday?: DayPlan;
  thursday?: DayPlan;
  friday?: DayPlan;
  saturday?: DayPlan;
  sunday?: DayPlan;
};

type DayPlan = {
  topic: string;
  duration: number;      // minutes
  priority: 'high' | 'medium' | 'low';
  tasks: string[];
};
```

**Example JSONB:**
```json
{
  "monday": {
    "topic": "트리 구조 복습",
    "duration": 120,
    "priority": "high",
    "tasks": ["이진 트리 개념", "순회 알고리즘"]
  },
  "tuesday": {
    "topic": "BST 구현",
    "duration": 90,
    "priority": "high",
    "tasks": ["insert", "search", "delete"]
  }
}
```

**Indexes:**
```sql
CREATE INDEX idx_plans_subject_id ON learning_plans(subject_id);
CREATE INDEX idx_plans_week ON learning_plans(week_start, week_end);
CREATE INDEX idx_plans_status ON learning_plans(status);
```

**Drizzle Schema:**
```typescript
export const learningPlans = pgTable('learning_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  subjectId: uuid('subject_id').notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  weekStart: date('week_start').notNull(),
  weekEnd: date('week_end').notNull(),
  dailyPlan: jsonb('daily_plan').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  subjectIdIdx: index('idx_plans_subject_id').on(table.subjectId),
  weekIdx: index('idx_plans_week').on(table.weekStart, table.weekEnd),
}));
```

---

### 2.4 review_schedules (복습 일정)

망각 곡선 기반 복습 일정 관리.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 고유 식별자 |
| session_id | uuid | FK → study_sessions(id), **ON DELETE CASCADE** | 세션 참조 |
| review_date | date | NOT NULL | 복습 예정일 |
| completed | boolean | NOT NULL, DEFAULT false | 완료 여부 |
| completed_at | timestamp | NULL | 완료 일시 |
| **comprehension** | integer | NULL, CHECK (1-5) | **복습 시 이해도 재평가** |
| next_review_date | date | NULL | 다음 복습일 |
| repetition_count | integer | NOT NULL, DEFAULT 0 | 복습 횟수 |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | 생성일시 |

**Review Interval Calculation:**
```typescript
// 망각 곡선 기반 복습 간격 (일)
// 장기 복습을 위해 60, 90일 간격 추가
const BASE_INTERVALS = [1, 3, 7, 14, 30, 60, 90];

function getNextReviewDate(
  currentDate: Date,
  comprehension: number,
  repetitionCount: number
): Date {
  // 이해도에 따른 간격 조정
  const multiplier = comprehension >= 4 ? 1.5 : comprehension <= 2 ? 0.5 : 1;
  const idx = Math.min(repetitionCount, BASE_INTERVALS.length - 1);
  const interval = BASE_INTERVALS[idx] * multiplier;

  const nextDate = addDays(currentDate, Math.round(interval));

  // EDGE CASE: 과거 날짜 방지
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (nextDate <= today) {
    return addDays(today, 1);  // 최소 내일
  }

  return nextDate;
}
```

**Indexes:**
```sql
CREATE INDEX idx_reviews_session_id ON review_schedules(session_id);
CREATE INDEX idx_reviews_date ON review_schedules(review_date);
CREATE INDEX idx_reviews_pending ON review_schedules(review_date, completed)
  WHERE completed = false;
-- 밀린 복습 조회 최적화
CREATE INDEX idx_reviews_overdue ON review_schedules(review_date, completed)
  WHERE completed = false AND review_date < CURRENT_DATE;
```

**Drizzle Schema:**
```typescript
export const reviewSchedules = pgTable('review_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull()
    .references(() => studySessions.id, { onDelete: 'cascade' }),
  reviewDate: date('review_date').notNull(),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  comprehension: integer('comprehension'),  // 복습 시 이해도 저장
  nextReviewDate: date('next_review_date'),
  repetitionCount: integer('repetition_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  sessionIdIdx: index('idx_reviews_session_id').on(table.sessionId),
  dateIdx: index('idx_reviews_date').on(table.reviewDate),
  pendingIdx: index('idx_reviews_pending').on(table.reviewDate, table.completed),
}));
```

---

### 2.5 motivations (동기부여 메시지)

AI 생성 동기부여 메시지 저장.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 고유 식별자 |
| message | text | NOT NULL | 메시지 내용 |
| type | enum | NOT NULL | 메시지 유형 |
| generated_at | timestamp | NOT NULL, DEFAULT NOW() | 생성일시 |

**Enum: motivation_type**
```sql
CREATE TYPE motivation_type AS ENUM ('daily', 'achievement', 'advice');
```

**Indexes:**
```sql
CREATE INDEX idx_motivations_date ON motivations(generated_at DESC);
CREATE INDEX idx_motivations_type ON motivations(type);
```

**Drizzle Schema:**
```typescript
export const motivationTypeEnum = pgEnum('motivation_type', ['daily', 'achievement', 'advice']);

export const motivations = pgTable('motivations', {
  id: uuid('id').primaryKey().defaultRandom(),
  message: text('message').notNull(),
  type: motivationTypeEnum('type').notNull(),
  generatedAt: timestamp('generated_at').notNull().defaultNow(),
}, (table) => ({
  dateIdx: index('idx_motivations_date').on(table.generatedAt),
}));
```

---

## 3. Common Queries

### 3.1 오늘 학습 세션 조회
```sql
SELECT ss.*, s.name as subject_name, s.color
FROM study_sessions ss
JOIN subjects s ON ss.subject_id = s.id
WHERE ss.date = CURRENT_DATE
ORDER BY ss.created_at DESC;
```

### 3.2 오늘 복습 일정 조회
```sql
SELECT rs.*, ss.topic, s.name as subject_name, s.color
FROM review_schedules rs
JOIN study_sessions ss ON rs.session_id = ss.id
JOIN subjects s ON ss.subject_id = s.id
WHERE rs.review_date = CURRENT_DATE AND rs.completed = false
ORDER BY rs.review_date;
```

### 3.3 밀린 복습 조회 (기한 지남)
```sql
SELECT rs.*, ss.topic, s.name as subject_name, s.color,
       (CURRENT_DATE - rs.review_date) as days_overdue
FROM review_schedules rs
JOIN study_sessions ss ON rs.session_id = ss.id
JOIN subjects s ON ss.subject_id = s.id
WHERE rs.review_date < CURRENT_DATE AND rs.completed = false
ORDER BY rs.review_date;
```

### 3.4 주간 학습 시간 통계
```sql
SELECT
  date,
  SUM(duration) as total_minutes,
  COUNT(*) as session_count
FROM study_sessions
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date
ORDER BY date;
```

### 3.5 과목별 학습 시간 분포
```sql
SELECT
  s.name,
  s.color,
  SUM(ss.duration) as total_minutes,
  AVG(ss.comprehension)::numeric(3,2) as avg_comprehension
FROM study_sessions ss
JOIN subjects s ON ss.subject_id = s.id
WHERE ss.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY s.id, s.name, s.color
ORDER BY total_minutes DESC;
```

### 3.6 이번 주 학습 계획 조회
```sql
SELECT *
FROM learning_plans
WHERE week_start <= CURRENT_DATE
  AND week_end >= CURRENT_DATE
  AND status = 'active'
ORDER BY created_at DESC
LIMIT 1;
```

### 3.7 복습 완료 처리 + 다음 복습일 계산
```sql
-- 트랜잭션으로 처리
BEGIN;

UPDATE review_schedules
SET
  completed = true,
  completed_at = NOW(),
  comprehension = $1,  -- 복습 시 이해도
  next_review_date = $2,  -- 계산된 다음 복습일
  repetition_count = repetition_count + 1
WHERE id = $3;

-- 다음 복습 일정 생성 (필요시)
INSERT INTO review_schedules (session_id, review_date, repetition_count)
SELECT session_id, $2, repetition_count
FROM review_schedules
WHERE id = $3;

COMMIT;
```

---

## 4. Data Validation Rules

### 4.1 Input Validation (Zod Schema)
```typescript
import { z } from 'zod';

export const sessionInputSchema = z.object({
  subjectId: z.string().uuid(),
  topic: z.string().min(1).max(200),
  duration: z.number().min(1).max(480),  // 1분 ~ 8시간
  comprehension: z.number().min(1).max(5),
  notes: z.string().max(1000).optional(),
  date: z.string().date(),  // YYYY-MM-DD
});

export const subjectInputSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  targetDate: z.string().date().optional(),
  targetScore: z.number().min(0).max(100).optional(),
});

export const reviewCompleteSchema = z.object({
  comprehension: z.number().min(1).max(5),
});
```

---

## 5. Migration Commands

```bash
# Generate migration
npx drizzle-kit generate

# Push to database
npx drizzle-kit push

# View schema
npx drizzle-kit studio

# Check migration status
npx drizzle-kit check
```

---

## 6. Database Connection

```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

**Environment Variable:**
```env
DATABASE_URL=postgresql://budget:budget123@localhost:5432/study_planner
```

---

## 7. Edge Cases & Constraints

| Case | Constraint | Implementation |
|------|------------|----------------|
| 과목 삭제 | 연관 데이터 자동 삭제 | ON DELETE CASCADE |
| 세션 삭제 | 복습 일정 자동 삭제 | ON DELETE CASCADE |
| duration 범위 | 1-480분 | CHECK + Zod validation |
| comprehension 범위 | 1-5 | CHECK + Zod validation |
| 복습 기한 지남 | 밀린 복습 조회 | idx_reviews_overdue 인덱스 |
| repetitionCount 초과 | 마지막 간격 유지 | Math.min(count, intervals.length - 1) |
| 동일 세션 중복 복습 | 생성 시 체크 | UNIQUE(session_id, review_date) 고려 |
