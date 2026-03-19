# Habit Tracker - Architecture Documentation

## 1. System Overview

### 1.1 Purpose
습관 추적 및 관리 시스템으로, 일일 습관 체크, 연속 달성(Streak) 계산, 히트맵 캘린더 시각화, 통계 대시보드를 제공하는 웹 애플리케이션입니다.

### 1.2 Architecture Style
- **Pattern**: Server-Side Rendering (SSR) with Client-Side Interactivity
- **Approach**: Component-Based Architecture
- **Data Strategy**: PostgreSQL + ORM (Drizzle)
- **UI Strategy**: Atomic Design with shadcn/ui

### 1.3 Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| UI Library | shadcn/ui + Tailwind CSS |
| Backend | Next.js API Routes (Server Actions) |
| Database | PostgreSQL 16 |
| ORM | Drizzle ORM |
| Charts | Recharts |
| Container | Docker |

---

## 2. Folder Structure

```
day12-habit-tracker/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (tabs)/                   # Tab layout group
│   │   │   ├── today/                # 오늘 뷰 페이지
│   │   │   ├── calendar/             # 캘린더 페이지
│   │   │   ├── statistics/           # 통계 페이지
│   │   │   └── habits/               # 습관 관리 페이지
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home (redirect)
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # React Components
│   │   ├── ui/                       # shadcn/ui primitives
│   │   ├── habits/                   # Habit-related components
│   │   │   ├── HabitCard.tsx         # 습관 카드
│   │   │   ├── HabitForm.tsx         # 습관 생성/수정 폼
│   │   │   ├── HabitList.tsx         # 습관 목록
│   │   │   └── StreakBadge.tsx       # 연속 배지
│   │   ├── calendar/                 # Calendar components
│   │   │   ├── Heatmap.tsx           # 히트맵 캘린더
│   │   │   └── HeatmapCell.tsx       # 히트맵 셀
│   │   ├── statistics/               # Statistics components
│   │   │   ├── StatsCard.tsx         # 통계 카드
│   │   │   ├── CategoryChart.tsx     # 카테고리 차트
│   │   │   └── TrendChart.tsx        # 트렌드 차트
│   │   └── layout/                   # Layout components
│   │       ├── Header.tsx            # 헤더
│   │       └── TabNavigation.tsx     # 탭 네비게이션
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── db/                       # Database
│   │   │   ├── index.ts              # DB connection
│   │   │   ├── schema.ts             # Drizzle schema
│   │   │   └── migrations/           # Migration files
│   │   ├── actions/                  # Server actions
│   │   │   ├── habits.ts             # Habit CRUD actions
│   │   │   └── logs.ts               # Log actions
│   │   ├── queries/                  # Database queries
│   │   │   ├── habits.ts             # Habit queries
│   │   │   ├── logs.ts               # Log queries
│   │   │   └── statistics.ts         # Statistics queries
│   │   ├── utils/                    # Utilities
│   │   │   ├── streak.ts             # Streak calculation
│   │   │   ├── heatmap.ts            # Heatmap color logic
│   │   │   └── date.ts               # Date utilities
│   │   └── types/                    # TypeScript types
│   │       └── index.ts              # Shared types
│   │
│   └── config/
│       └── constants.ts              # App constants
│
├── docs/
│   ├── PRD.md                        # Product Requirements
│   └── ARCHITECTURE.md               # This file
│
├── drizzle.config.ts                 # Drizzle configuration
├── tailwind.config.ts                # Tailwind configuration
└── package.json
```

---

## 3. Component Hierarchy

```mermaid
graph TD
    A[Root Layout] --> B[Header]
    A --> C[TabNavigation]
    A --> D[Page Content]

    D --> E[Today Page]
    D --> F[Calendar Page]
    D --> G[Statistics Page]
    D --> H[Habits Page]

    E --> E1[Progress Bar]
    E --> E2[HabitList]
    E2 --> E3[HabitCard]
    E3 --> E4[StreakBadge]
    E3 --> E5[CheckButton]

    F --> F1[Month Selector]
    F --> F2[Habit Filter]
    F --> F3[Heatmap]
    F3 --> F4[HeatmapCell]

    G --> G1[StatsCard Grid]
    G --> G2[CategoryChart]
    G --> G3[TrendChart]
    G --> G4[WeeklyReport]

    H --> H1[HabitList]
    H1 --> H2[HabitCard]
    H --> H3[CreateButton]
    H3 --> H4[HabitForm Dialog]
    H2 --> H5[EditButton]
    H5 --> H4
```

---

## 4. Data Flow

### 4.1 Overall Data Flow
```mermaid
flowchart TD
    A[User Browser] -->|User Action| B[Page Component]
    B -->|Server Action Call| C[Server Action Layer]
    C -->|Query/Mutation| D[Database Queries]
    D -->|Drizzle ORM| E[(PostgreSQL)]
    E -->|Result| D
    D -->|Data| C
    C -->|Revalidate Path| B
    B -->|Render| A

    F[Utility Functions] -.->|Calculate| C
    F -.->|Transform| B

    style A fill:#e1f5ff
    style E fill:#ffe1e1
    style F fill:#fff4e1
```

### 4.2 Habit Check Flow
```mermaid
sequenceDiagram
    participant U as User
    participant C as HabitCard Component
    participant SA as Server Action
    participant Q as Query Layer
    participant DB as PostgreSQL
    participant S as Streak Util

    U->>C: Click Check Button
    C->>SA: checkHabit(habitId, date)
    SA->>Q: insertHabitLog(data)
    Q->>DB: INSERT INTO habit_logs
    DB-->>Q: Success
    Q-->>SA: Log Created
    SA->>Q: getHabitLogs(habitId)
    Q->>DB: SELECT logs
    DB-->>Q: Logs Data
    Q-->>SA: Logs Array
    SA->>S: calculateStreak(logs)
    S-->>SA: Streak Info
    SA-->>C: Revalidate & Return
    C-->>U: UI Update (Checked + Streak)
```

### 4.3 Heatmap Generation Flow
```mermaid
flowchart LR
    A[Calendar Page] -->|Request| B[getMonthlyLogs Query]
    B -->|SQL Query| C[(Database)]
    C -->|Raw Logs| D[Process Data]
    D -->|Group by Date| E[Calculate Completion Rate]
    E -->|Apply Color Logic| F[Heatmap Data]
    F -->|Render| G[Heatmap Component]
    G -->|Display| H[User View]

    style A fill:#e1f5ff
    style C fill:#ffe1e1
    style G fill:#e1ffe1
```

---

## 5. Entity Relationships (ERD)

```mermaid
erDiagram
    HABITS ||--o{ HABIT_LOGS : "has many"

    HABITS {
        uuid id PK
        varchar name
        text description
        enum category
        varchar color
        varchar icon
        integer target_frequency
        boolean is_archived
        timestamp created_at
        timestamp updated_at
    }

    HABIT_LOGS {
        uuid id PK
        uuid habit_id FK
        date date
        timestamp completed_at
        text memo
    }

    HABITS ||--o| STREAK_INFO : "calculated from"

    STREAK_INFO {
        number current_streak
        number longest_streak
        date last_completed_date
    }
```

### 5.1 Relationships
- **HABITS → HABIT_LOGS**: One-to-Many (CASCADE DELETE)
- **HABIT_LOGS**: Unique constraint on (habit_id, date) - 같은 날 중복 체크 방지
- **STREAK_INFO**: Virtual entity (계산됨, DB 테이블 아님)

### 5.2 Indexes
```sql
-- Performance optimization indexes
CREATE INDEX idx_habits_archived ON habits(is_archived);
CREATE INDEX idx_habits_category ON habits(category);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(date);
```

---

## 6. Key Design Decisions

### 6.1 Next.js App Router 선택
**Decision**: Next.js 14 App Router 사용

**Rationale**:
- Server Components로 초기 로딩 성능 최적화
- Server Actions로 API 라우트 없이 데이터 변경
- Automatic code splitting
- File-based routing

**Trade-offs**:
- Learning curve (Pages Router 대비)
- Client Component 명시 필요 (`"use client"`)

---

### 6.2 Drizzle ORM 선택
**Decision**: Drizzle ORM 사용 (Prisma 대신)

**Rationale**:
- TypeScript-first, type-safe
- 더 가벼움 (bundle size)
- SQL-like 쿼리 (raw SQL에 가까움)
- Migration 제어 용이

**Trade-offs**:
- Prisma 대비 생태계 작음
- GUI admin tool 부족

---

### 6.3 Streak Calculation - Runtime vs Stored
**Decision**: Runtime calculation (DB에 저장 안 함)

**Rationale**:
- Streak는 logs로부터 항상 계산 가능
- 데이터 불일치 방지 (single source of truth)
- 계산 로직 변경 시 유연성

**Algorithm**:
```typescript
function calculateStreak(logs: HabitLog[]): StreakInfo {
  // 1. logs를 날짜 역순 정렬
  // 2. 어제부터 역순으로 순회
  // 3. 연속된 날짜면 currentStreak++
  // 4. 끊기면 중단
  // 5. longestStreak는 최대값 추적
}
```

**Trade-offs**:
- 매번 계산 필요 (성능 ↓)
- 하지만 logs 수가 많지 않아 문제 없음

---

### 6.4 Heatmap Color Logic
**Decision**: 5단계 색상 구분

**Color Mapping**:
```typescript
const getHeatmapColor = (completionRate: number) => {
  if (completionRate === 0) return 'bg-gray-100'      // 0%
  if (completionRate <= 0.25) return 'bg-green-200'   // 1-25%
  if (completionRate <= 0.50) return 'bg-green-400'   // 26-50%
  if (completionRate <= 0.75) return 'bg-green-600'   // 51-75%
  return 'bg-green-800'                               // 76-100%
}
```

**Rationale**:
- GitHub-style (친숙함)
- 5단계면 충분히 구분 가능
- Tailwind 기본 색상 사용

---

### 6.5 Archive instead of Delete
**Decision**: Soft delete (is_archived 플래그)

**Rationale**:
- 데이터 보존 (과거 기록 유지)
- 복원 기능 제공
- logs는 CASCADE DELETE로 함께 삭제 안 됨

**Implementation**:
```sql
-- 아카이브
UPDATE habits SET is_archived = true WHERE id = ?;

-- 복원
UPDATE habits SET is_archived = false WHERE id = ?;

-- 쿼리 시 필터링
SELECT * FROM habits WHERE is_archived = false;
```

---

### 6.6 Date Handling
**Decision**: 날짜는 UTC 기준, 표시는 로컬 시간

**Rationale**:
- DB에는 UTC 저장 (timestamp with timezone)
- 클라이언트에서 로컬 시간으로 변환
- 시간대 문제 방지

**Implementation**:
```typescript
// Server: UTC 저장
const date = new Date().toISOString();

// Client: 로컬 표시
const localDate = new Date(date).toLocaleDateString('ko-KR');
```

---

### 6.7 Component Strategy
**Decision**: Container/Presentational 패턴

**Structure**:
- **Server Components**: Data fetching (default)
- **Client Components**: Interactivity (`"use client"`)
- **Server Actions**: Data mutations

**Example**:
```typescript
// app/today/page.tsx (Server Component)
export default async function TodayPage() {
  const habits = await getHabitsForToday()
  return <HabitList habits={habits} />
}

// components/HabitList.tsx (Client Component)
"use client"
export function HabitList({ habits }) {
  // Interactive logic here
}
```

---

### 6.8 State Management
**Decision**: Server State (no Redux/Zustand)

**Rationale**:
- Server Actions + revalidatePath로 충분
- 복잡한 클라이언트 상태 없음
- React Server Components 활용

**Flow**:
```
User Action → Server Action → DB Mutation → revalidatePath → Re-render
```

---

### 6.9 Performance Optimizations

#### 6.9.1 Database Query Optimization
- **Indexes**: habitId, date, category, isArchived
- **Pagination**: 큰 데이터셋은 페이지네이션 (현재는 불필요)
- **Eager Loading**: JOIN 사용 최소화 (N+1 방지)

#### 6.9.2 Frontend Optimization
- **Code Splitting**: 자동 (App Router)
- **Image Optimization**: next/image 사용
- **Lazy Loading**: 차트는 viewport 진입 시 로드

---

### 6.10 Error Handling Strategy

**Layers**:
1. **Database Layer**: Drizzle throws → catch in queries
2. **Server Actions**: try-catch → return error object
3. **UI Layer**: toast notifications (shadcn/ui)

**Example**:
```typescript
// Server Action
export async function createHabit(data: HabitInput) {
  try {
    const habit = await db.insert(habits).values(data)
    revalidatePath('/habits')
    return { success: true, data: habit }
  } catch (error) {
    return { success: false, error: '습관 생성 실패' }
  }
}

// Client Component
const result = await createHabit(formData)
if (result.success) {
  toast.success('습관이 생성되었습니다')
} else {
  toast.error(result.error)
}
```

---

## 7. Security Considerations

### 7.1 SQL Injection Prevention
- Drizzle ORM의 parameterized queries 사용
- Raw SQL 사용 시 반드시 prepared statements

### 7.2 Input Validation
- Zod schema로 서버 사이드 검증
- Client-side 검증은 UX 용도

### 7.3 CSRF Protection
- Next.js Server Actions 기본 제공

---

## 8. Testing Strategy

### 8.1 Unit Tests
- Utility functions (streak, heatmap color)
- Query functions (mocked DB)

### 8.2 Integration Tests
- Server Actions (DB 포함)
- API endpoints

### 8.3 E2E Tests (Future)
- Playwright for critical flows
- Habit check flow
- Calendar navigation

---

## 9. Deployment Architecture

```mermaid
flowchart LR
    A[User] -->|HTTPS| B[Vercel/Next.js]
    B -->|SQL| C[(PostgreSQL<br/>Docker)]

    B -->|Build Time| D[Static Assets]
    B -->|Runtime| E[Server Components]
    B -->|Runtime| F[API Routes]

    style A fill:#e1f5ff
    style C fill:#ffe1e1
    style B fill:#e1ffe1
```

### 9.1 Environment
- **Development**: localhost:3000 + Docker PostgreSQL
- **Production**: Vercel + managed PostgreSQL (or Docker)

### 9.2 Environment Variables
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=development|production
```

---

## 10. Future Enhancements

### 10.1 Authentication (Phase 6)
- NextAuth.js
- Multi-user support
- User isolation

### 10.2 Notifications (Phase 7)
- 습관 리마인더
- 연속 달성 축하
- Push notifications

### 10.3 Social Features (Phase 8)
- 습관 공유
- 친구와 경쟁
- 리더보드

### 10.4 Mobile App (Phase 9)
- React Native
- API 분리 필요

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| Streak | 연속 달성 일수 |
| Heatmap | 습관 완료 현황을 색상으로 표시하는 캘린더 |
| Archive | 삭제 대신 숨김 처리 (soft delete) |
| Server Action | Next.js의 서버 사이드 함수 (POST endpoint 대체) |
| Drizzle | TypeScript ORM |

---

## Appendix B: References

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [shadcn/ui](https://ui.shadcn.com)
- [Recharts](https://recharts.org)

---

**Last Updated**: 2026-01-13
**Version**: 1.0
**Author**: Architecture Team
