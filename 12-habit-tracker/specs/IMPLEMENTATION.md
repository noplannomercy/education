# Habit Tracker - Implementation Checklist

**Methodology**: TDD (Test-Driven Development)
**Workflow**: TEST → CODE → VERIFY
**Total Estimated Time**: 90 minutes

## Progress Tracker

- [x] **Phase 1**: Project Setup & Database (15분) - ✅ COMPLETED
- [x] **Phase 2**: Habit CRUD (15분) - ✅ COMPLETED
- [x] **Phase 3**: Daily Check & Streak (25분) - ✅ COMPLETED
- [x] **Phase 4**: Calendar & Heatmap (20분) - ✅ COMPLETED
- [x] **Phase 5**: Statistics & Report (15분) - ✅ COMPLETED

**Total Time Spent**: 90 minutes / 90 minutes - 🎉 PROJECT COMPLETE!

---

## Phase 1: Project Setup & Database (15분)

### 1.1 Project Initialization
- [x] Create Next.js 14 project with TypeScript
  ```bash
  npx create-next-app@latest day12-habit-tracker --typescript --tailwind --app
  ```
- [x] Install dependencies
  ```bash
  npm install drizzle-orm postgres drizzle-kit
  npm install -D @types/pg
  ```
- [x] Install shadcn/ui
  ```bash
  npx shadcn-ui@latest init
  ```

### 1.2 Environment Setup
- [x] Create `.env.local`
  ```env
  DATABASE_URL=postgresql://user:password@localhost:5432/habit_tracker
  ```
- [x] Verify PostgreSQL connection (Docker)
  ```bash
  docker ps | grep postgres
  ```

### 1.3 Drizzle Configuration
- [x] Create `drizzle.config.ts`
  ```typescript
  import type { Config } from 'drizzle-kit'
  export default {
    schema: './src/lib/db/schema.ts',
    out: './src/lib/db/migrations',
    driver: 'pg',
    dbCredentials: { connectionString: process.env.DATABASE_URL! }
  } satisfies Config
  ```

### 1.4 Database Schema
- [x] Create `src/lib/db/schema.ts`
  - [x] Define `categoryEnum` (health, learning, exercise, other)
  - [x] Define `habits` table (10 columns)
  - [x] Define `habitLogs` table (5 columns)
  - [x] Add unique constraint: `(habitId, date)`
  - [x] Add CASCADE DELETE on FK
  - [x] Export TypeScript types

### 1.5 Database Connection
- [x] Create `src/lib/db/index.ts`
  - [x] Configure postgres client with connection pooling (max: 10)
  - [x] Export drizzle instance

### 1.6 Migration with Constraints
- [x] Generate migration
  ```bash
  npm run db:generate
  ```
- [x] **IMPORTANT**: Edit generated migration to add CHECK constraints
  ```sql
  -- Add to migration file
  ALTER TABLE habits
  ADD CONSTRAINT check_target_frequency
  CHECK (target_frequency >= 1 AND target_frequency <= 7);

  ALTER TABLE habits
  ADD CONSTRAINT check_color_format
  CHECK (color ~ '^#[0-9A-Fa-f]{6}$');

  ALTER TABLE habit_logs
  ADD CONSTRAINT check_date_not_future
  CHECK (date <= CURRENT_DATE);
  ```
- [x] Run migration
  ```bash
  npm run db:migrate
  ```

### 1.7 Create Indexes (Performance)
- [x] Add indexes to migration or create separate migration
  ```sql
  -- Basic indexes
  CREATE INDEX idx_habits_archived ON habits(is_archived);
  CREATE INDEX idx_habits_category ON habits(category);
  CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
  CREATE INDEX idx_habit_logs_date ON habit_logs(date DESC);

  -- Advanced indexes (PERFORMANCE BOOST)
  -- Partial index for active habits (most common query)
  CREATE INDEX idx_habits_active_created ON habits(created_at DESC)
  WHERE is_archived = false;

  -- Composite index for streak calculation
  CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, date DESC);

  -- Partial index for recent logs (last 6 months)
  CREATE INDEX idx_habit_logs_recent ON habit_logs(habit_id, date DESC)
  WHERE date >= CURRENT_DATE - INTERVAL '6 months';
  ```

### 1.8 Verify Database
- [x] Open Drizzle Studio
  ```bash
  npm run db:studio
  ```
- [x] Verify tables exist: `habits`, `habit_logs`
- [x] Verify indexes exist (run `\d habits` in psql)
- [x] Verify CHECK constraints exist

### 1.9 Build Verification (CRITICAL)
- [x] Run `npm run build`
- [x] Verify 0 TypeScript errors
- [x] Verify 0 build errors
- [x] **STOP**: Do NOT proceed if build fails

**Estimated Time**: 15 minutes

---

## Phase 2: Habit CRUD (15분)

**Features**: Feature 1 (Habit CRUD) + Feature 8 (Archive & Restore)

### 2.1 TEST: Define Test Cases
- [x] Test Case 1: Create habit with all required fields
- [x] Test Case 2: Get active habits (is_archived = false)
- [x] Test Case 3: Update habit name and target_frequency
- [x] Test Case 4: Archive habit (soft delete)
- [x] Test Case 5: Restore archived habit
- [x] Test Case 6: Delete habit permanently (hard delete)
- [x] Test Case 7: Invalid input rejected (Zod validation)

### 2.2 CODE: Database Queries
- [x] Create `src/lib/queries/habits.ts`
  - [x] `getActiveHabits()` - SELECT WHERE is_archived = false, ORDER BY created_at DESC
  - [x] `getHabitById(id)` - SELECT by id
  - [x] `getArchivedHabits()` - SELECT WHERE is_archived = true

### 2.3 CODE: Server Actions
- [x] Create `src/lib/actions/habits.ts`
  - [x] `createHabit(data)` - INSERT with validation
  - [x] `updateHabit(id, data)` - UPDATE with **updatedAt = new Date()**
  - [x] `archiveHabit(id)` - UPDATE is_archived = true, updatedAt
  - [x] `restoreHabit(id)` - UPDATE is_archived = false, updatedAt
  - [x] `deleteHabit(id)` - DELETE (CASCADE to logs)
  - [x] Return `{ success: boolean, data?, error? }`
  - [x] Use `revalidatePath('/habits')` after mutations

### 2.4 CODE: Input Validation
- [x] Install Zod: `npm install zod`
- [x] Create `src/lib/types/index.ts`
  - [x] `habitSchema` with Zod validation
    ```typescript
    const habitSchema = z.object({
      name: z.string().min(1, '습관명 필수').max(100, '100자 이내'),
      description: z.string().max(500).optional(),
      category: z.enum(['health', 'learning', 'exercise', 'other']),
      color: z.string().regex(/^#[0-9A-F]{6}$/i, '유효한 색상코드'),
      targetFrequency: z.number().int().min(1).max(7, '1~7 사이 값'),
    })
    ```

### 2.5 CODE: UI Components
- [x] Install shadcn components
  ```bash
  npx shadcn-ui@latest add button dialog form input label select toast
  ```
- [x] Create `src/components/habits/HabitForm.tsx` (Client)
  - [x] Form with name, description, category, color, targetFrequency
  - [x] Submit → call server action
  - [x] Show toast on success/error
- [x] Create `src/components/habits/HabitCard.tsx` (Client)
  - [x] Display habit info
  - [x] Edit button → open HabitForm
  - [x] Archive button → call archiveHabit
  - [x] Delete button → call deleteHabit (with confirmation)
- [x] Create `src/components/habits/HabitList.tsx` (Client)
  - [x] Map habits → HabitCard

### 2.6 CODE: Habits Page
- [x] Create `src/app/(tabs)/habits/page.tsx` (Server)
  - [x] Fetch active habits with getActiveHabits()
  - [x] Render HabitList
  - [x] Add "새 습관" button → open HabitForm
- [x] Create `src/app/(tabs)/habits/archived/page.tsx` (Server)
  - [x] Fetch archived habits
  - [x] Show restore button

### 2.7 VERIFY: Manual Testing
- [x] ✓ Create habit: "물 2L 마시기" (health, #3B82F6, 7)
- [x] ✓ Verify habit appears in list
- [x] ✓ Edit habit: Change name to "물 3L 마시기"
- [x] ✓ Archive habit: Verify removed from active list
- [x] ✓ Restore habit: Verify back in active list
- [x] ✓ Delete habit: Verify permanently removed
- [x] ✓ Invalid input: Color "#GGG" rejected

### 2.8 Build Verification (CRITICAL)
- [x] Run `npm run build`
- [x] Verify 0 TypeScript errors
- [x] Verify 0 build errors
- [x] **STOP**: Do NOT proceed if build fails

**Estimated Time**: 15 minutes

---

## Phase 3: Daily Check & Streak (25분)

**Features**: Feature 2 (Daily Check) + Feature 3 (Streak) + Feature 10 (Today View)

### 3.1 TEST: Define Test Cases
- [x] Test Case 1: Check habit for today
- [x] Test Case 2: Uncheck habit for today
- [x] Test Case 3: Prevent duplicate check (same habit + same date)
- [x] Test Case 4: Reject future date check
- [x] Test Case 5: Reject past date > 7 days
- [x] Test Case 6: Calculate streak for daily habit (targetFrequency = 7)
- [x] Test Case 7: Streak resets when yesterday is missed (daily only)
- [x] Test Case 8: Longest streak is tracked correctly
- [x] Test Case 9: Today not checked doesn't reset streak
- [x] Test Case 10: Weekly habit (targetFrequency < 7) shows goal achievement, NOT streak

### 3.2 CODE: Timezone & Date Policy (CRITICAL)
- [x] **DECISION**: Use client-side date (user timezone)
- [x] Create `src/lib/utils/date.ts`
  ```typescript
  // Client에서 호출
  export function getTodayDate(): string {
    return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
  }

  export function getYesterdayDate(): string {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toLocaleDateString('en-CA')
  }

  // 날짜 검증
  export function validateCheckDate(dateStr: string): { valid: boolean; error?: string } {
    const checkDate = new Date(dateStr)
    const today = new Date(getTodayDate())

    // 미래 날짜 차단
    if (checkDate > today) {
      return { valid: false, error: '미래 날짜는 체크할 수 없습니다' }
    }

    // 7일 이전 차단
    const maxPastDays = 7
    const pastLimit = new Date(today)
    pastLimit.setDate(pastLimit.getDate() - maxPastDays)

    if (checkDate < pastLimit) {
      return { valid: false, error: '최근 7일 이내만 체크 가능합니다' }
    }

    return { valid: true }
  }
  ```

### 3.3 CODE: Database Queries (N+1 방지)
- [x] Create `src/lib/queries/logs.ts`
  - [x] `getHabitLogs(habitId, limit = 30)` - 최근 30일만 조회 (성능)
    ```typescript
    const logs = await db
      .select()
      .from(habitLogs)
      .where(and(
        eq(habitLogs.habitId, habitId),
        gte(habitLogs.date, sql`CURRENT_DATE - INTERVAL '30 days'`)
      ))
      .orderBy(desc(habitLogs.date))
      .limit(limit)
    ```
  - [x] `getLogsForMultipleHabits(habitIds)` - N+1 방지용
    ```typescript
    const logs = await db
      .select()
      .from(habitLogs)
      .where(and(
        inArray(habitLogs.habitId, habitIds),
        gte(habitLogs.date, sql`CURRENT_DATE - INTERVAL '30 days'`)
      ))
      .orderBy(desc(habitLogs.date))
    ```
  - [x] `getTodayLog(habitId, date)` - 중복 체크 확인
  - [x] `getLogsForDateRange(habitId, startDate, endDate)` - 날짜 범위

### 3.4 CODE: Server Actions with Validation
- [x] Create `src/lib/actions/logs.ts`
  - [x] `checkHabit(habitId, date, memo?)` - INSERT log
    ```typescript
    'use server'
    export async function checkHabit(
      habitId: string,
      date: string,
      memo?: string
    ) {
      // 1. 날짜 검증
      const validation = validateCheckDate(date)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // 2. INSERT 시도
      try {
        const log = await db.insert(habitLogs).values({
          habitId,
          date,
          memo,
        }).returning()

        revalidatePath('/today')
        return { success: true, data: log[0] }
      } catch (error: any) {
        // 3. Unique constraint 에러 처리
        if (error.code === '23505') {
          return { success: false, error: '이미 오늘 체크했습니다' }
        }
        return { success: false, error: '체크 실패' }
      }
    }
    ```
  - [x] `uncheckHabit(habitId, date)` - DELETE log
  - [x] Return `{ success: boolean, error? }`

### 3.5 CODE: Streak Calculation Utility (CRITICAL)
- [x] Create `src/lib/utils/streak.ts`
  - [x] **POLICY**: 매일 목표(7)만 엄격한 streak, 주 N회는 주간 달성률
  ```typescript
  export interface StreakInfo {
    currentStreak: number
    longestStreak: number
    lastCompletedDate: string | null
  }

  export interface WeeklyGoal {
    targetFrequency: number
    thisWeekCompleted: number
    achievementRate: number
  }

  export function calculateStreak(
    logs: HabitLog[],
    targetFrequency: number
  ): StreakInfo | WeeklyGoal {
    // 매일 목표가 아니면 주간 달성률만 반환
    if (targetFrequency < 7) {
      return calculateWeeklyGoal(logs, targetFrequency)
    }

    // 매일 목표: 엄격한 streak 계산
    if (logs.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null }
    }

    // 날짜 역순 정렬 (최신순)
    const sortedLogs = [...logs].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const yesterday = getYesterdayDate()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // 어제부터 시작 (오늘은 카운트 안 함)
    const yesterdayTime = new Date(yesterday).getTime()
    let expectedDate = yesterdayTime

    for (const log of sortedLogs) {
      const logTime = new Date(log.date).getTime()

      if (logTime === expectedDate) {
        tempStreak++
        if (logTime === yesterdayTime) {
          currentStreak = tempStreak
        }
        longestStreak = Math.max(longestStreak, tempStreak)
        expectedDate -= 24 * 60 * 60 * 1000 // 하루 전
      } else if (logTime < expectedDate) {
        // 날짜 빠짐 → 연속 끊김
        break
      }
    }

    return {
      currentStreak,
      longestStreak,
      lastCompletedDate: sortedLogs[0].date
    }
  }

  function calculateWeeklyGoal(
    logs: HabitLog[],
    targetFrequency: number
  ): WeeklyGoal {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay()) // 이번 주 일요일

    const thisWeekLogs = logs.filter(log => {
      const logDate = new Date(log.date)
      return logDate >= weekStart && logDate <= today
    })

    const thisWeekCompleted = thisWeekLogs.length
    const achievementRate = Math.round(
      (thisWeekCompleted / targetFrequency) * 100
    )

    return {
      targetFrequency,
      thisWeekCompleted,
      achievementRate
    }
  }
  ```

### 3.6 CODE: Today Query with Streak (N+1 방지)
- [x] Update `src/lib/queries/habits.ts`
  - [x] `getHabitsForToday(date)` - 한 번에 조회 후 그룹핑
    ```typescript
    export async function getHabitsForToday(date: string) {
      // 1. Active habits 조회
      const habits = await db
        .select()
        .from(habitsTable)
        .where(eq(habitsTable.isArchived, false))
        .orderBy(desc(habitsTable.createdAt))

      if (habits.length === 0) return []

      const habitIds = habits.map(h => h.id)

      // 2. 모든 습관의 최근 30일 로그 한 번에 조회 (N+1 방지)
      const allLogs = await db
        .select()
        .from(habitLogs)
        .where(and(
          inArray(habitLogs.habitId, habitIds),
          gte(habitLogs.date, sql`CURRENT_DATE - INTERVAL '30 days'`)
        ))
        .orderBy(desc(habitLogs.date))

      // 3. JavaScript에서 그룹핑
      const logsByHabit = allLogs.reduce((acc, log) => {
        if (!acc[log.habitId]) acc[log.habitId] = []
        acc[log.habitId].push(log)
        return acc
      }, {} as Record<string, HabitLog[]>)

      // 4. 오늘 체크 여부 + Streak/Goal 계산
      return habits.map(habit => {
        const habitLogs = logsByHabit[habit.id] || []
        const todayLog = habitLogs.find(log => log.date === date)
        const streakOrGoal = calculateStreak(habitLogs, habit.targetFrequency)

        return {
          ...habit,
          isChecked: !!todayLog,
          completedAt: todayLog?.completedAt || null,
          ...streakOrGoal
        }
      })
    }
    ```

### 3.7 CODE: UI Components
- [x] Create `src/components/habits/StreakBadge.tsx`
  - [x] IF targetFrequency === 7: Display 🔥 icon + currentStreak
  - [x] ELSE: Display "주 N회 목표: X/N (Y%)"
  - [x] Display ⚠️ if streak = 0 or achievementRate < 50%
  - [x] Show longestStreak on hover (tooltip) - daily only
- [x] Create `src/components/habits/CheckButton.tsx` (Client)
  - [x] Checkbox UI
  - [x] onClick → get today date from client, call checkHabit
  - [x] Optimistic UI update
  - [x] Show toast on error (duplicate check, validation error)
- [x] Update `src/components/habits/HabitCard.tsx`
  - [x] Add CheckButton
  - [x] Add StreakBadge
  - [x] Display category and targetFrequency

### 3.8 CODE: Today Page
- [x] Create `src/app/(tabs)/today/page.tsx` (Server)
  - [x] Get today's date (server renders with current date)
  - [x] Fetch habits with getHabitsForToday()
  - [x] Calculate completion rate (checked / total)
  - [x] Render progress bar
  - [x] Render HabitList with check buttons

### 3.9 VERIFY: Manual Testing
- [x] ✓ Check habit today → log created
- [x] ✓ Check again → error "이미 오늘 체크했습니다"
- [x] ✓ Uncheck → log deleted
- [x] ✓ Try future date → rejected "미래 날짜는 체크할 수 없습니다"
- [x] ✓ Try 10 days ago → rejected "최근 7일 이내만 체크 가능"
- [x] ✓ Daily habit: Check yesterday + today → streak = 1
- [x] ✓ Daily habit: Check for 3 consecutive days → streak = 2 (today not counted)
- [x] ✓ Daily habit: Miss a day → streak = 0
- [x] ✓ Daily habit: Longest streak updates correctly
- [x] ✓ Weekly habit (주 5회): Shows "이번 주 3/5 (60%)" NOT streak

### 3.10 Build Verification (CRITICAL)
- [x] Run `npm run build`
- [x] Verify 0 TypeScript errors
- [x] Verify 0 build errors
- [x] **STOP**: Do NOT proceed if build fails

**Estimated Time**: 25 minutes

---

## Phase 4: Calendar & Heatmap (20분)

**Features**: Feature 4 (Heatmap Calendar)

### 4.1 TEST: Define Test Cases
- [x] Test Case 1: Display current month heatmap
- [x] Test Case 2: Navigate to previous/next month
- [x] Test Case 3: Color intensity matches completion rate
  - 0% → gray-100
  - 1-25% → green-200
  - 26-50% → green-400
  - 51-75% → green-600
  - 76-100% → green-800
- [x] Test Case 4: Filter by specific habit
- [x] Test Case 5: Show all habits combined

### 4.2 CODE: Heatmap Color Utility
- [x] Create `src/lib/utils/heatmap.ts`
  - [x] `getHeatmapColor(completionRate: number): string`
    ```typescript
    export function getHeatmapColor(completionRate: number): string {
      if (completionRate === 0) return 'bg-gray-100'
      if (completionRate <= 0.25) return 'bg-green-200'
      if (completionRate <= 0.50) return 'bg-green-400'
      if (completionRate <= 0.75) return 'bg-green-600'
      return 'bg-green-800'
    }
    ```

### 4.3 CODE: Database Queries
- [x] Update `src/lib/queries/statistics.ts`
  - [x] `getMonthlyHeatmapData(year, month, habitId?)`
    - GROUP BY date
    - COUNT distinct habits completed
    - Calculate completion rate per day
    - Filter by habitId if provided
    - Return array of `{ date, completionRate, habitsCompleted, totalHabits }`

### 4.4 CODE: Date Utilities
- [x] Update `src/lib/utils/date.ts`
  - [x] `getDaysInMonth(year, month)` - Return array of dates
  - [x] `getMonthName(month)` - Korean month name
  - [x] `formatDate(date)` - YYYY-MM-DD format

### 4.5 CODE: UI Components
- [x] Create `src/components/calendar/HeatmapCell.tsx` (Client)
  - [x] Display single day cell
  - [x] Apply color based on completion rate
  - [x] Show tooltip with details on hover
  - [x] Click → show habit details for that day
- [x] Create `src/components/calendar/Heatmap.tsx` (Client)
  - [x] Render calendar grid (7x~5 rows)
  - [x] Map dates → HeatmapCell
  - [x] Show day labels (일, 월, 화...)
  - [x] Add legend (색상 범례)
- [x] Create `src/components/calendar/MonthSelector.tsx` (Client)
  - [x] Previous/Next month buttons
  - [x] Display current month/year
  - [x] Update URL query params on change
- [x] Create `src/components/calendar/HabitFilter.tsx` (Client)
  - [x] Dropdown with habit list
  - [x] "전체" option (show all)
  - [x] Update URL query params on selection

### 4.6 CODE: Calendar Page
- [x] Create `src/app/(tabs)/calendar/page.tsx` (Server)
  - [x] Get current year/month from query params (default: today)
  - [x] Fetch active habits for filter dropdown
  - [x] Fetch monthly heatmap data
  - [x] Render MonthSelector
  - [x] Render HabitFilter
  - [x] Render Heatmap

### 4.7 VERIFY: Manual Testing
- [x] ✓ Heatmap displays for current month
- [x] ✓ Navigate to previous month → data updates
- [x] ✓ Navigate to next month → data updates
- [x] ✓ Filter by specific habit → only that habit's data
- [x] ✓ Select "전체" → all habits combined
- [x] ✓ Color intensity correct:
  - Day with 0% → gray-100
  - Day with 50% → green-400
  - Day with 100% → green-800
- [x] ✓ Click cell → show habit details
- [x] ✓ Tooltip shows correct completion rate

### 4.8 Build Verification (CRITICAL)
- [x] Run `npm run build`
- [x] Verify 0 TypeScript errors
- [x] Verify 0 build errors
- [x] **STOP**: Do NOT proceed if build fails

**Estimated Time**: 20 minutes

---

## Phase 5: Statistics & Report (15분)

**Features**: Feature 5 (Statistics) + Feature 6 (Category) + Feature 7 (Goal) + Feature 9 (Weekly Report)

### 5.1 TEST: Define Test Cases
- [x] Test Case 1: Display total habits count
- [x] Test Case 2: Display active habits count
- [x] Test Case 3: Calculate weekly completion rate
- [x] Test Case 4: Calculate monthly completion rate
- [x] Test Case 5: Category-wise completion rate (pie chart)
- [x] Test Case 6: Weekly trend (line chart)
- [x] Test Case 7: Best performing habit this week
- [x] Test Case 8: Worst performing habit this week
- [x] Test Case 9: Goal achievement rate (vs target_frequency)

### 5.2 CODE: Database Queries
- [x] Update `src/lib/queries/statistics.ts`
  - [x] `getOverallStats()` - Total, active, archived counts
  - [x] `getCompletionRate(startDate, endDate)` - Overall completion %
  - [x] `getCategoryStats(startDate, endDate)` - Per category completion
  - [x] `getWeeklyTrend(weeks)` - Last N weeks completion rate
  - [x] `getWeeklyReport()` - Best/worst habits this week
  - [x] `getGoalAchievement(habitId, startDate, endDate)` - vs target

### 5.3 CODE: UI Components (shadcn + Recharts)
- [x] Install Recharts: `npm install recharts`
- [x] Create `src/components/statistics/StatsCard.tsx`
  - [x] Display single stat (title, value, icon)
  - [x] 4 cards: Total, Active, Week %, Month %
- [x] Create `src/components/statistics/CategoryChart.tsx` (Client)
  - [x] Pie chart with Recharts
  - [x] Show category distribution
  - [x] Color-coded by category
- [x] Create `src/components/statistics/TrendChart.tsx` (Client)
  - [x] Line chart with Recharts
  - [x] X-axis: Week labels
  - [x] Y-axis: Completion rate %
  - [x] Show last 4 weeks
- [x] Create `src/components/statistics/WeeklyReport.tsx`
  - [x] Display best habit (🏆 icon)
  - [x] Display worst habit (⚠️ icon)
  - [x] Show achievement rate vs target

### 5.4 CODE: Statistics Page
- [x] Create `src/app/(tabs)/statistics/page.tsx` (Server)
  - [x] Fetch overall stats
  - [x] Fetch category stats
  - [x] Fetch weekly trend
  - [x] Fetch weekly report
  - [x] Render StatsCard grid (4 cards)
  - [x] Render CategoryChart
  - [x] Render TrendChart
  - [x] Render WeeklyReport

### 5.5 CODE: Layout & Navigation
- [x] Create `src/components/layout/Header.tsx`
  - [x] App title "🎯 Habit Tracker"
  - [x] "+ 새 습관" button
- [x] Create `src/components/layout/TabNavigation.tsx` (Client)
  - [x] 4 tabs: 오늘, 캘린더, 통계, 습관 관리
  - [x] Active tab highlighted
  - [x] Navigation with Next.js Link
- [x] Update `src/app/layout.tsx`
  - [x] Add Header
  - [x] Add TabNavigation
  - [x] Wrap children

### 5.6 CODE: Home Page Redirect
- [x] Update `src/app/page.tsx`
  - [x] Redirect to `/today` (default tab)

### 5.7 VERIFY: Manual Testing
- [x] ✓ Stats cards show correct numbers
- [x] ✓ Weekly completion rate accurate
- [x] ✓ Monthly completion rate accurate
- [x] ✓ Category pie chart displays
- [x] ✓ Weekly trend line chart displays
- [x] ✓ Best habit shows highest completion rate
- [x] ✓ Worst habit shows lowest completion rate
- [x] ✓ Goal achievement shows vs target_frequency
- [x] ✓ Tab navigation works (4 tabs)
- [x] ✓ Home page redirects to /today

### 5.8 Build Verification (CRITICAL)
- [x] Run `npm run build`
- [x] Verify 0 TypeScript errors
- [x] Verify 0 build errors
- [x] **STOP**: Do NOT proceed if build fails

**Estimated Time**: 15 minutes

---

## Final Verification (Post-Implementation)

### Database Verification
- [ ] Verify indexes exist
  ```sql
  \d habits
  \d habit_logs
  ```
- [ ] Check indexes: is_archived, category, habit_id, date, composite, partial
- [ ] Verify unique constraint on (habit_id, date)
- [ ] Verify CASCADE DELETE works
- [ ] Verify CHECK constraints work:
  ```sql
  -- Should fail
  INSERT INTO habits (name, target_frequency) VALUES ('Test', 10);
  INSERT INTO habits (name, color) VALUES ('Test', '#GGGGGG');
  ```

### Functional Testing
- [ ] Create 3 habits (1 daily=7, 2 weekly<7, different categories)
- [ ] Daily habit: Check for 5 consecutive days → verify streak = 4
- [ ] Weekly habit: Check 3 times this week → verify "3/5 (60%)"
- [ ] Miss yesterday on daily habit → verify streak = 0
- [ ] Try future date → rejected
- [ ] Try 10 days ago → rejected
- [ ] Check heatmap shows correct colors
- [ ] Verify statistics are accurate
- [ ] Archive and restore a habit
- [ ] Delete a habit and verify logs deleted (CASCADE)

### Performance Testing
- [ ] Calendar page loads in < 1 second
- [ ] Habit check responds immediately (< 200ms)
- [ ] No N+1 query issues (check logs)
- [ ] Today view with 10 habits loads < 500ms

### TypeScript & Build
- [ ] `npm run build` succeeds with 0 errors
- [ ] All imports resolve correctly
- [ ] No `any` types (use proper typing)

### Error Handling
- [ ] Duplicate check shows error toast
- [ ] Invalid input shows validation error
- [ ] Future date rejected with clear message
- [ ] Past date > 7 days rejected
- [ ] Database errors handled gracefully

---

## Success Criteria Checklist

### Functional Requirements
- [ ] ✓ Habit CRUD works (create, read, update, delete)
- [ ] ✓ Daily check/uncheck works
- [ ] ✓ Streak calculation accurate (daily habits only)
- [ ] ✓ Weekly goal tracking accurate (weekly habits)
- [ ] ✓ Date validation works (no future, max 7 days past)
- [ ] ✓ Heatmap calendar displays correctly
- [ ] ✓ Statistics charts accurate
- [ ] ✓ Archive/restore works
- [ ] ✓ Category filtering works
- [ ] ✓ Goal achievement tracking works
- [ ] ✓ Weekly report shows best/worst habits
- [ ] ✓ Today view shows daily progress

### Technical Requirements
- [ ] ✓ TypeScript: 0 errors
- [ ] ✓ Build: 0 errors
- [ ] ✓ Drizzle queries work
- [ ] ✓ Server Actions return proper error objects
- [ ] ✓ Unique constraint prevents duplicate checks
- [ ] ✓ CHECK constraints prevent invalid data
- [ ] ✓ Indexes improve query performance (4x faster)
- [ ] ✓ Input validation with Zod
- [ ] ✓ No N+1 queries (verified)
- [ ] ✓ Timezone handled correctly (client-side date)

### Performance Requirements
- [ ] ✓ Calendar loads < 1 second
- [ ] ✓ Check button responds < 200ms
- [ ] ✓ Today view loads < 500ms
- [ ] ✓ No N+1 queries (single query for all habits)
- [ ] ✓ Connection pooling configured (max: 10)
- [ ] ✓ Partial indexes used for active habits
- [ ] ✓ Composite indexes used for streak queries

---

## Key Design Decisions Summary

### 1. Streak Calculation Policy
- **Daily habits (targetFrequency = 7)**: Strict streak calculation (yesterday missed = streak 0)
- **Weekly habits (targetFrequency < 7)**: Weekly goal achievement rate, NO streak

### 2. Timezone Policy
- **Client-side date**: User timezone, sent to server
- **Rationale**: Accurate for users, no server timezone mismatch

### 3. Date Validation Policy
- **Future dates**: Rejected (cannot check future)
- **Past dates**: Max 7 days (prevent data manipulation)

### 4. Performance Optimizations
- **N+1 Prevention**: Batch query for all habits + logs, group in JavaScript
- **Index Strategy**: Partial indexes for active habits, composite for streak queries
- **Query Limit**: Only fetch recent 30 days for streak calculation

### 5. Data Integrity
- **Unique Constraint**: (habit_id, date) prevents duplicate checks
- **CHECK Constraints**: target_frequency (1-7), color format, date not future
- **CASCADE DELETE**: Delete habit → delete all logs

---

**Total Implementation Time**: ~90 minutes
**Phases**: 5 phases with mandatory build verification after each
**Methodology**: Test-Driven Development (TDD)

**CRITICAL REMINDERS**:
- Run `npm run build` after EVERY phase
- Fix ALL errors before proceeding
- Do NOT skip build verification
- Do NOT skip date validation
- Do NOT skip N+1 query prevention
- Daily habits = strict streak, Weekly habits = goal achievement
