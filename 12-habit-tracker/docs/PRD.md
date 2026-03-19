# Habit Tracker - PRD

## 1. Project Overview

### 1.1 Purpose
습관 추적 및 관리 앱. 일일 습관 체크, 연속 달성(Streak), 히트맵 캘린더, 통계 제공.

### 1.2 Tech Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Database: PostgreSQL + Drizzle ORM
- UI: shadcn/ui + Tailwind CSS
- Charts: Recharts
- Container: Docker (PostgreSQL - 기존 사용)

### 1.3 Target Users
- 습관 형성하려는 개인
- 자기계발 목표 관리자

---

## 2. Features (10개)

### Feature 1: Habit CRUD
습관 등록/수정/삭제
- 습관명, 설명
- 카테고리 (건강, 학습, 운동, 기타)
- 목표 빈도 (매일, 주 N회)
- 아이콘/색상

### Feature 2: Daily Check
일일 습관 체크
- 오늘 날짜 기준 체크/해제
- 체크 시간 기록
- 간단한 메모 (선택)

### Feature 3: Streak Calculation
연속 달성 계산
- 현재 연속 일수
- 최장 연속 기록
- 연속 끊김 시 리셋

### Feature 4: Heatmap Calendar
히트맵 캘린더 표시
- GitHub 스타일 히트맵
- 월별 보기
- 완료율에 따른 색상 농도

### Feature 5: Statistics Dashboard
통계 대시보드
- 전체 완료율
- 습관별 완료율
- 주간/월간 트렌드 차트

### Feature 6: Category Management
카테고리 관리
- 기본 카테고리 (건강, 학습, 운동, 기타)
- 카테고리별 필터링
- 카테고리별 통계

### Feature 7: Goal Setting
목표 설정
- 주간 목표 횟수
- 목표 달성률 표시
- 목표 초과 달성 표시

### Feature 8: Archive & Restore
아카이브 기능
- 습관 아카이브 (삭제 대신)
- 아카이브된 습관 복원
- 아카이브 목록 보기

### Feature 9: Weekly Report
주간 리포트
- 이번 주 완료 현황
- 가장 잘 지킨 습관
- 개선 필요한 습관

### Feature 10: Today View
오늘 뷰 (메인)
- 오늘 해야 할 습관 목록
- 체크 진행률
- 빠른 체크 UI

---

## 3. Data Structure

### 3.1 Habit (습관)
```typescript
interface Habit {
  id: string
  name: string
  description: string | null
  category: 'health' | 'learning' | 'exercise' | 'other'
  color: string
  icon: string | null
  targetFrequency: number  // 주 N회
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 3.2 HabitLog (습관 기록)
```typescript
interface HabitLog {
  id: string
  habitId: string
  date: Date           // 체크한 날짜
  completedAt: Date    // 체크한 시간
  memo: string | null
}
```

### 3.3 Streak (연속 기록) - 계산용
```typescript
interface StreakInfo {
  currentStreak: number
  longestStreak: number
  lastCompletedDate: Date | null
}
```

---

## 4. Database Schema (Drizzle)

```typescript
// habits 테이블
export const categoryEnum = pgEnum('category', ['health', 'learning', 'exercise', 'other'])

export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: categoryEnum('category').notNull().default('other'),
  color: varchar('color', { length: 7 }).notNull().default('#3B82F6'),
  icon: varchar('icon', { length: 50 }),
  targetFrequency: integer('target_frequency').notNull().default(7), // 주 N회
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// habit_logs 테이블
export const habitLogs = pgTable('habit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habit_id').references(() => habits.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  completedAt: timestamp('completed_at').defaultNow(),
  memo: text('memo'),
}, (t) => ({
  // 같은 날 중복 체크 방지
  uniqueHabitDate: unique().on(t.habitId, t.date),
}))

// Indexes
// CREATE INDEX idx_habits_archived ON habits(is_archived);
// CREATE INDEX idx_habits_category ON habits(category);
// CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
// CREATE INDEX idx_habit_logs_date ON habit_logs(date);
```

---

## 5. UI Layout

### 5.1 Main Layout
```
┌─────────────────────────────────────────────────────────┐
│  🎯 Habit Tracker              [+ 새 습관]              │
├─────────────────────────────────────────────────────────┤
│  Tabs: [오늘] [캘린더] [통계] [습관 관리]               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                  Tab Content Area                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Today Tab
```
┌─────────────────────────────────────────────────────────┐
│  📅 2025년 1월 13일 월요일                              │
│  진행률: ████████░░ 4/6 (67%)                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐│
│  │ [✓] 물 2L 마시기              🔥 15일 연속         ││
│  │     건강 | 매일                                     ││
│  ├─────────────────────────────────────────────────────┤│
│  │ [✓] 30분 독서                 🔥 7일 연속          ││
│  │     학습 | 매일                                     ││
│  ├─────────────────────────────────────────────────────┤│
│  │ [ ] 아침 운동                 ⚠️ 연속 끊김         ││
│  │     운동 | 주 5회                                   ││
│  ├─────────────────────────────────────────────────────┤│
│  │ [✓] 명상 10분                 🔥 3일 연속          ││
│  │     건강 | 매일                                     ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 5.3 Calendar Tab (Heatmap)
```
┌─────────────────────────────────────────────────────────┐
│  [< 이전] 2025년 1월 [다음 >]                           │
├─────────────────────────────────────────────────────────┤
│  습관 선택: [전체 ▼] 또는 [물 2L 마시기 ▼]             │
├─────────────────────────────────────────────────────────┤
│     일  월  화  수  목  금  토                          │
│     ░░  ██  ██  ▓▓  ██  ░░  ░░   ← 색상 농도 = 완료율  │
│     ██  ██  ░░  ██  ██  ██  ▓▓                          │
│     ██  ▓▓  ██  ██  ░░  ██  ██                          │
│     ...                                                 │
├─────────────────────────────────────────────────────────┤
│  범례: ░░ 0% | ▓▓ 50% | ██ 100%                        │
└─────────────────────────────────────────────────────────┘
```

### 5.4 Statistics Tab
```
┌─────────────────────────────────────────────────────────┐
│  Stats Cards (4개)                                       │
│  [총 습관: 6] [활성: 5] [이번 주: 85%] [이번 달: 78%]   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌───────────────────────────┐ │
│  │ 카테고리별 완료율    │  │ 주간 트렌드              │ │
│  │ (Pie Chart)         │  │ (Line Chart)             │ │
│  │ 건강: 90%           │  │                          │ │
│  │ 학습: 75%           │  │     ___/\___/\           │ │
│  │ 운동: 60%           │  │ ___/        \___        │ │
│  │ 기타: 80%           │  │                          │ │
│  └─────────────────────┘  └───────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  주간 리포트                                             │
│  🏆 Best: 물 2L 마시기 (100%)                           │
│  ⚠️ 개선 필요: 아침 운동 (40%)                          │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Phases

### Phase 1: Project Setup & Database (10분)
- Next.js 프로젝트 설정
- Drizzle ORM 설정
- 2개 테이블 스키마 생성
- PostgreSQL 연결 (기존 DB)
- Migration 실행
- npm run build 검증

### Phase 2: Habit CRUD (15분)
- Feature 1: Habit CRUD
- Feature 8: Archive & Restore
- 습관 목록/생성/수정/삭제 UI
- npm run build 검증

### Phase 3: Daily Check & Streak (20분)
- Feature 2: Daily Check
- Feature 3: Streak Calculation
- Feature 10: Today View
- 오늘 체크 UI + 스트릭 계산 로직
- npm run build 검증

### Phase 4: Calendar & Heatmap (20분)
- Feature 4: Heatmap Calendar
- 월별 히트맵 UI
- 색상 농도 계산
- npm run build 검증

### Phase 5: Statistics & Report (15분)
- Feature 5: Statistics Dashboard
- Feature 6: Category Management
- Feature 7: Goal Setting
- Feature 9: Weekly Report
- 차트 (Recharts)
- npm run build 검증

---

## 7. Critical Rules

### 7.1 Streak Calculation
- 연속일 = 어제까지 끊김 없이 체크된 일수
- 오늘 체크 안 해도 연속 유지 (오늘이 아직 안 끝남)
- 어제 체크 안 했으면 연속 0으로 리셋
- 매일 목표 아닌 경우 (주 N회): 목표 기준으로 계산

### 7.2 Heatmap Color
```
0%: 가장 연한 색 (gray-100)
1-25%: 연한 색 (green-200)
26-50%: 중간 색 (green-400)
51-75%: 진한 색 (green-600)
76-100%: 가장 진한 색 (green-800)
```

### 7.3 Unique Constraint
- 같은 습관 + 같은 날짜 = 중복 체크 불가
- DB 레벨에서 unique constraint

### 7.4 Build 검증
- 각 Phase 완료 후 npm run build 필수
- 빌드 에러 0개 확인 후 다음 Phase

---

## 8. Success Criteria

### 8.1 Functional
- [ ] 습관 CRUD 동작
- [ ] 일일 체크/해제 동작
- [ ] 스트릭 정확히 계산
- [ ] 히트맵 캘린더 표시
- [ ] 통계 차트 정확
- [ ] 아카이브/복원 동작

### 8.2 Technical
- [ ] TypeScript 에러 없음
- [ ] 빌드 에러 없음
- [ ] Drizzle 쿼리 정상
- [ ] Unique constraint 동작

### 8.3 Performance
- [ ] 캘린더 로딩 < 1초
- [ ] 체크 반응 즉시

---

## 9. Testing Checklist

### 9.1 Habit CRUD
- [ ] 습관 생성 (모든 필드)
- [ ] 습관 수정
- [ ] 습관 삭제
- [ ] 습관 아카이브/복원

### 9.2 Daily Check
- [ ] 오늘 체크
- [ ] 체크 해제
- [ ] 같은 날 중복 체크 방지
- [ ] 과거 날짜 체크

### 9.3 Streak
- [ ] 연속 체크 → 스트릭 증가
- [ ] 하루 빠짐 → 스트릭 리셋
- [ ] 최장 기록 갱신

### 9.4 Heatmap
- [ ] 월별 표시
- [ ] 색상 농도 정확
- [ ] 날짜 클릭 시 상세

### 9.5 Statistics
- [ ] 완료율 정확
- [ ] 차트 표시
- [ ] 주간 리포트 정확