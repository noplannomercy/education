# Habit Tracker - Implementation Guide for Claude

## Tech Stack
- **Framework**: Next.js 14 (App Router), TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **UI**: shadcn/ui, Tailwind CSS
- **Charts**: Recharts

## Commands
```bash
npm run dev              # Development server
npm run build            # Production build (CRITICAL: Run after each Phase)
npm run db:generate      # Generate migration
npm run db:migrate       # Run migration
npm run db:studio        # Database GUI
```

## Project Structure
```
src/
├── app/(tabs)/          # Pages: today, calendar, statistics, habits
├── components/          # UI components (ui/, habits/, calendar/, statistics/)
├── lib/
│   ├── db/              # schema.ts, index.ts, migrations/
│   ├── actions/         # Server actions (habits.ts, logs.ts)
│   ├── queries/         # DB queries
│   └── utils/           # streak.ts, heatmap.ts, date.ts
```

## TDD Workflow (CRITICAL)
**YOU MUST follow this workflow for EVERY Phase:**
1. Implement feature
2. Run `npm run build` (MANDATORY)
3. Fix ALL TypeScript/build errors
4. ONLY proceed to next Phase when build succeeds with 0 errors

## Implementation Phases
- **Phase 1** (15분): Setup + DB (habits, habit_logs tables) + CHECK constraints + Indexes → `npm run build`
- **Phase 2** (15분): Habit CRUD + Archive + Validation → `npm run build`
- **Phase 3** (25분): Daily Check + Streak + Date Validation + N+1 방지 → `npm run build`
- **Phase 4** (20분): Heatmap Calendar → `npm run build`
- **Phase 5** (15분): Statistics + Charts → `npm run build`

## Streak Calculation Rules (CRITICAL)

### Daily Habits (targetFrequency = 7)
```typescript
// STRICT streak calculation
- currentStreak = 어제까지 끊김 없이 체크된 연속 일수
- 오늘 체크 안 해도 streak 유지 (오늘이 아직 안 끝남)
- 어제 체크 안 했으면 → streak = 0 (리셋)
- longestStreak = 역대 최대 연속 일수

// Example:
logs = ['2025-01-13', '2025-01-12', '2025-01-11']
today = '2025-01-14'
→ currentStreak = 2 (어제부터 카운트, 오늘 제외)
```

### Weekly Habits (targetFrequency < 7)
```typescript
// NO streak, show weekly goal achievement
- targetFrequency = 5 (주 5회)
- thisWeekCompleted = 4 (이번 주 체크 횟수)
- achievementRate = 80% (4/5 * 100)
- Display: "이번 주 4/5 (80%)"

// NOT displayed: streak (confusing for weekly habits)
```

## Heatmap Color Rules
```typescript
completionRate === 0      → 'bg-gray-100'  // 0%
completionRate <= 0.25    → 'bg-green-200' // 1-25%
completionRate <= 0.50    → 'bg-green-400' // 26-50%
completionRate <= 0.75    → 'bg-green-600' // 51-75%
completionRate > 0.75     → 'bg-green-800' // 76-100%
```

## Timezone Policy (CRITICAL)
```typescript
// Client-side date (user timezone)
const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
await checkHabit(habitId, today, memo)

// WHY: Accurate for all users, no server timezone mismatch
// User in Seoul 23:50 = today, NOT tomorrow
```

## Date Validation Rules (CRITICAL)
```typescript
// Reject future dates
if (checkDate > today) {
  return { success: false, error: '미래 날짜는 체크할 수 없습니다' }
}

// Reject past dates > 7 days
const maxPastDays = 7
if (checkDate < today - maxPastDays) {
  return { success: false, error: '최근 7일 이내만 체크 가능합니다' }
}
```

## Critical Rules

### ALWAYS
- Run `npm run build` after EVERY Phase completion
- Use Server Components by default (no "use client" unless interactive)
- Use Server Actions for mutations (NO API routes)
- Filter archived habits: `WHERE is_archived = false`
- Handle unique constraint error (habit_id + date)
- Validate dates: No future, max 7 days past
- Use client-side date (user timezone)
- **Prevent N+1 queries**: Batch query + JavaScript grouping
- Calculate streak ONLY for daily habits (targetFrequency = 7)
- Show weekly goal for weekly habits (targetFrequency < 7)
- Explicitly set `updatedAt = new Date()` in UPDATE queries

### NEVER
- Skip `npm run build` validation
- Store streak in database (calculate from logs)
- Allow duplicate check (same habit + same date)
- Use raw SQL without Drizzle ORM
- Calculate streak for weekly habits (show goal instead)
- Skip date validation (future/past limits)
- Use server timezone for dates

### YOU MUST
- Create indexes: is_archived, category, habit_id, date
- **Create advanced indexes**:
  - Partial index: `CREATE INDEX idx_habits_active_created ON habits(created_at DESC) WHERE is_archived = false`
  - Composite index: `CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, date DESC)`
  - Partial index: `CREATE INDEX idx_habit_logs_recent ON habit_logs(habit_id, date DESC) WHERE date >= CURRENT_DATE - INTERVAL '6 months'`
- Add CHECK constraints:
  - `CHECK (target_frequency >= 1 AND target_frequency <= 7)`
  - `CHECK (color ~ '^#[0-9A-Fa-f]{6}$')`
  - `CHECK (date <= CURRENT_DATE)`
- Use CASCADE DELETE (habit → logs)
- Validate input with Zod schema
- Return error objects from Server Actions: `{ success: boolean, error?: string }`
- Limit streak queries to recent 30 days: `WHERE date >= CURRENT_DATE - INTERVAL '30 days'`
- Use batch query for N+1 prevention:
  ```typescript
  // ✅ Fetch all habits' logs in ONE query
  const allLogs = await db
    .select()
    .from(habitLogs)
    .where(inArray(habitLogs.habitId, habitIds))

  // Group in JavaScript (fast)
  const logsByHabit = allLogs.reduce((acc, log) => { ... })
  ```

## N+1 Query Prevention Pattern
```typescript
// ❌ BAD: N+1 queries (slow)
const habits = await getActiveHabits() // 1 query
for (const habit of habits) {
  const logs = await getHabitLogs(habit.id) // N queries
}

// ✅ GOOD: 2 queries total (fast)
const habits = await getActiveHabits() // 1 query
const habitIds = habits.map(h => h.id)
const allLogs = await db
  .select()
  .from(habitLogs)
  .where(and(
    inArray(habitLogs.habitId, habitIds),
    gte(habitLogs.date, sql`CURRENT_DATE - INTERVAL '30 days'`)
  )) // 1 query

// Group in JavaScript
const logsByHabit = allLogs.reduce((acc, log) => {
  if (!acc[log.habitId]) acc[log.habitId] = []
  acc[log.habitId].push(log)
  return acc
}, {})
```

## Error Code Reference
- `23505`: Unique constraint violation (duplicate check)
- Handle in Server Actions:
  ```typescript
  catch (error: any) {
    if (error.code === '23505') {
      return { success: false, error: '이미 오늘 체크했습니다' }
    }
    return { success: false, error: '체크 실패' }
  }
  ```

## Performance Targets
- Calendar page loads < 1 second
- Habit check responds < 200ms
- Today view loads < 500ms
- No N+1 queries (2 queries max for Today view)

## Success Criteria
- [ ] TypeScript: 0 errors
- [ ] Build: 0 errors
- [ ] Daily habits show streak (🔥 icon)
- [ ] Weekly habits show goal (이번 주 X/N)
- [ ] Future dates rejected
- [ ] Past dates > 7 days rejected
- [ ] Duplicate checks prevented
- [ ] N+1 queries prevented
- [ ] All CHECK constraints work
- [ ] All indexes created
