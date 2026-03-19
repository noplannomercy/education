# AI Study Planner - Implementation Plan

## CRITICAL BUILD VERIFICATION RULE

**IMPORTANT:** After EVERY Phase completion:
1. Run: `npm run lint` (ESLint 검사)
2. Run: `npm run build`
3. Verify: Build completes with 0 errors
4. If errors exist: Fix ALL errors before proceeding
5. **NEVER** proceed to next phase with build errors
6. Commit changes after successful build

---

## Phase 1: 프로젝트 셋업 (15분)

### 1.1 Next.js 프로젝트 초기화
- [ ] Next.js 14 프로젝트 생성 (App Router)
- [ ] TypeScript strict mode 설정 (`tsconfig.json`)
- [ ] `.env.local` 파일 생성
  ```env
  DATABASE_URL=postgresql://budget:budget123@localhost:5432/study_planner
  OPENROUTER_API_KEY=your_key_here
  ```

### 1.2 PostgreSQL 연결
- [ ] 기존 Docker PostgreSQL 컨테이너 확인 (localhost:5432)
- [ ] `study_planner` 데이터베이스 생성
- [ ] 연결 테스트

### 1.3 Drizzle ORM 설정
- [ ] 패키지 설치: `npm install drizzle-orm pg`
- [ ] 패키지 설치: `npm install -D drizzle-kit @types/pg`
- [ ] `drizzle.config.ts` 생성
- [ ] `db/index.ts` - 데이터베이스 연결 설정
- [ ] `db/schema.ts` - 스키마 파일 생성 (빈 파일)

### 1.4 shadcn/ui 설치
- [ ] `npx shadcn@latest init`
- [ ] 기본 컴포넌트 설치: Button, Card, Input, Label, Select, Dialog, Tabs, Badge, Checkbox
- [ ] `components/ui/` 디렉토리 확인

### 1.5 Recharts 설치
- [ ] `npm install recharts`
- [ ] 타입 확인 (`@types/recharts` 불필요 - 내장)

### 1.6 AI SDK + Open Router 설정
- [ ] `npm install ai @ai-sdk/openai zod`
- [ ] `lib/ai/openrouter.ts` 생성
  ```typescript
  import { createOpenAI } from '@ai-sdk/openai';

  // IMPORTANT: baseURL 필수 설정
  export const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  // Model: Haiku 4.5 (빠른 응답, 비용 효율)
  export const model = openrouter('anthropic/claude-haiku-4-5-20250514');
  ```
- [ ] `lib/ai/prompts.ts` 생성 (빈 파일)

### 1.7 기본 레이아웃 및 에러 처리
- [ ] `app/layout.tsx` - Root layout 설정
- [ ] `app/page.tsx` - 기본 페이지 생성
- [ ] `app/loading.tsx` - 글로벌 로딩 UI
- [ ] `app/error.tsx` - 글로벌 에러 바운더리
- [ ] `app/not-found.tsx` - 404 페이지
- [ ] `lib/utils.ts` - cn() 유틸리티 확인

### Phase 1 검증
- [ ] **CRITICAL: `npm run lint` 실행**
- [ ] **CRITICAL: `npm run build` 실행**
- [ ] **CRITICAL: 빌드 에러 0개 확인**
- [ ] Test: `npm run dev` 실행 후 localhost:3000 접속 확인
- [ ] Test: PostgreSQL 연결 확인
- [ ] Commit: "Phase 1: Project setup complete"

---

## Phase 2: DB & 기본 CRUD (25분)

### 2.1 데이터베이스 스키마 정의
- [ ] `db/schema.ts` - Enum 정의
  - `difficulty_level`: easy, medium, hard
  - `motivation_type`: daily, achievement, advice

- [ ] `db/schema.ts` - subjects 테이블
  ```typescript
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

- [ ] `db/schema.ts` - study_sessions 테이블
  ```typescript
  export const studySessions = pgTable('study_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    subjectId: uuid('subject_id').notNull()
      .references(() => subjects.id, { onDelete: 'cascade' }),  // CASCADE 명시
    topic: varchar('topic', { length: 200 }).notNull(),
    duration: integer('duration').notNull(),  // 분 단위 (1-480)
    comprehension: integer('comprehension').notNull(),  // 1-5
    notes: text('notes'),
    date: date('date').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  }, (table) => ({
    subjectIdIdx: index('idx_sessions_subject_id').on(table.subjectId),
    dateIdx: index('idx_sessions_date').on(table.date),
  }));
  ```

- [ ] `db/schema.ts` - learning_plans 테이블
  ```typescript
  export const learningPlans = pgTable('learning_plans', {
    id: uuid('id').primaryKey().defaultRandom(),
    subjectId: uuid('subject_id').notNull()
      .references(() => subjects.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 20 }).notNull().default('active'),  // active, completed, archived
    weekStart: date('week_start').notNull(),
    weekEnd: date('week_end').notNull(),
    dailyPlan: jsonb('daily_plan').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  }, (table) => ({
    subjectIdIdx: index('idx_plans_subject_id').on(table.subjectId),
    weekIdx: index('idx_plans_week').on(table.weekStart, table.weekEnd),
  }));
  ```

- [ ] `db/schema.ts` - review_schedules 테이블
  ```typescript
  export const reviewSchedules = pgTable('review_schedules', {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').notNull()
      .references(() => studySessions.id, { onDelete: 'cascade' }),
    reviewDate: date('review_date').notNull(),
    completed: boolean('completed').notNull().default(false),
    completedAt: timestamp('completed_at'),
    comprehension: integer('comprehension'),  // NEW: 복습 시 이해도 재평가
    nextReviewDate: date('next_review_date'),
    repetitionCount: integer('repetition_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  }, (table) => ({
    sessionIdIdx: index('idx_reviews_session_id').on(table.sessionId),
    dateIdx: index('idx_reviews_date').on(table.reviewDate),
    pendingIdx: index('idx_reviews_pending').on(table.reviewDate, table.completed),
  }));
  ```

- [ ] `db/schema.ts` - motivations 테이블
  ```typescript
  export const motivations = pgTable('motivations', {
    id: uuid('id').primaryKey().defaultRandom(),
    message: text('message').notNull(),
    type: motivationTypeEnum('type').notNull(),
    generatedAt: timestamp('generated_at').notNull().defaultNow(),
  }, (table) => ({
    dateIdx: index('idx_motivations_date').on(table.generatedAt),
  }));
  ```

### 2.2 마이그레이션 실행
- [ ] `npx drizzle-kit push` 실행
- [ ] `npx drizzle-kit studio`로 테이블 확인
- [ ] 모든 인덱스 생성 확인

### 2.3 TypeScript 타입 정의
- [ ] `lib/types.ts` 생성
  ```typescript
  import { subjects, studySessions, learningPlans, reviewSchedules, motivations } from '@/db/schema';

  // DB Types (inferSelect, inferInsert)
  export type Subject = typeof subjects.$inferSelect;
  export type NewSubject = typeof subjects.$inferInsert;
  export type StudySession = typeof studySessions.$inferSelect;
  export type NewStudySession = typeof studySessions.$inferInsert;
  export type LearningPlan = typeof learningPlans.$inferSelect;
  export type NewLearningPlan = typeof learningPlans.$inferInsert;
  export type ReviewSchedule = typeof reviewSchedules.$inferSelect;
  export type NewReviewSchedule = typeof reviewSchedules.$inferInsert;
  export type Motivation = typeof motivations.$inferSelect;

  // API Response Types
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }

  // Form Input Types (validation)
  export interface SessionFormData {
    subjectId: string;
    topic: string;
    duration: number;
    comprehension: number;
    notes?: string;
    date: string;
  }
  ```

### 2.4 Subject CRUD (Server Actions)
- [ ] `actions/subjects.ts` 생성
  - [ ] `getSubjects()` - 전체 과목 조회
  - [ ] `getSubject(id)` - 단일 과목 조회
  - [ ] `createSubject(data)` - 과목 생성
  - [ ] `updateSubject(id, data)` - 과목 수정
  - [ ] `deleteSubject(id)` - 과목 삭제 (CASCADE로 연관 데이터 자동 삭제)

### 2.5 Study Session CRUD (Server Actions)
- [ ] `actions/sessions.ts` 생성
  - [ ] `getSessions(filters?)` - 세션 조회 (날짜, 과목 필터)
  - [ ] `getSessionsByDate(date)` - 날짜별 세션 조회
  - [ ] `createSession(data)` - 세션 생성 + 복습 일정 자동 생성
  - [ ] `updateSession(id, data)` - 세션 수정
  - [ ] `deleteSession(id)` - 세션 삭제 (CASCADE로 복습 일정 자동 삭제)
  - [ ] Input validation: duration (1-480), comprehension (1-5)

### 2.6 Review Schedule Actions
- [ ] `actions/reviews.ts` 생성
  - [ ] `getReviewsByDate(date)` - 날짜별 복습 일정 조회
  - [ ] `getPendingReviews()` - 미완료 복습 조회 (과거 포함)
  - [ ] `getOverdueReviews()` - 기한 지난 복습 조회
  - [ ] `completeReview(id, comprehension)` - 복습 완료 처리 + 이해도 저장
  - [ ] `completeAllOverdue()` - 밀린 복습 일괄 완료
  - [ ] `createReviewSchedules(sessionId, comprehension)` - 복습 일정 생성

### 2.7 복습 스케줄링 알고리즘
- [ ] `lib/ai/review-algorithm.ts` 생성
  ```typescript
  // 망각 곡선 기반 복습 간격 (일)
  // 5회 이상은 장기 복습 간격 (60, 90일) 추가
  const BASE_INTERVALS = [1, 3, 7, 14, 30, 60, 90];

  function calculateReviewDates(studyDate: Date, comprehension: number): Date[] {
    // comprehension 4-5: intervals × 1.5 (이해도 높음 → 더 긴 간격)
    // comprehension 1-2: intervals × 0.5 (이해도 낮음 → 더 짧은 간격)
    // comprehension 3: intervals × 1.0
    const multiplier = comprehension >= 4 ? 1.5 : comprehension <= 2 ? 0.5 : 1.0;

    return BASE_INTERVALS.slice(0, 5).map(interval => {
      const days = Math.round(interval * multiplier);
      return addDays(studyDate, days);
    });
  }

  function getNextReviewDate(
    currentDate: Date,
    comprehension: number,
    repetitionCount: number
  ): Date {
    const intervals = [1, 3, 7, 14, 30, 60, 90];
    const idx = Math.min(repetitionCount, intervals.length - 1);

    let multiplier = 1.0;
    if (comprehension >= 4) multiplier = 1.5;
    else if (comprehension <= 2) multiplier = 0.5;

    const days = Math.round(intervals[idx] * multiplier);
    const nextDate = addDays(currentDate, days);

    // EDGE CASE: 과거 날짜 방지 (밀린 복습 처리)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (nextDate <= today) {
      return addDays(today, 1);  // 최소 내일로 설정
    }

    return nextDate;
  }

  // EDGE CASE: 복습 미완료 연속 시 처리
  function handleMissedReview(originalDate: Date, missedDays: number): Date {
    // 3일 이상 미완료 시 간격 리셋
    if (missedDays >= 3) {
      return addDays(new Date(), 1);  // 내일부터 다시 시작
    }
    return addDays(new Date(), 1);
  }
  ```

### Phase 2 검증
- [ ] **CRITICAL: `npm run lint` 실행**
- [ ] **CRITICAL: `npm run build` 실행**
- [ ] **CRITICAL: 빌드 에러 0개 확인**
- [ ] Test: `npx drizzle-kit studio` - 5개 테이블 + 인덱스 확인
- [ ] Test: Subject CRUD 동작 확인
- [ ] Test: Session CRUD 동작 확인
- [ ] Test: 복습 일정 생성 확인 (세션 생성 시 자동 생성)
- [ ] Test: CASCADE 삭제 동작 확인
- [ ] Commit: "Phase 2: Database schema and CRUD complete"

---

## Phase 3: AI 기능 (35분)

### 3.1 AI 프롬프트 템플릿
- [ ] `lib/ai/prompts.ts` - 프롬프트 정의
  - [ ] `LEARNING_PLAN_PROMPT` - 학습 계획 생성 프롬프트
  - [ ] `STUDY_METHOD_PROMPT` - 학습 방법 추천 프롬프트
  - [ ] `PROGRESS_ANALYSIS_PROMPT` - 진도 분석 프롬프트
  - [ ] `MOTIVATION_PROMPT` - 동기부여 메시지 프롬프트

### 3.2 Zod 스키마 정의 (AI 응답 검증)
- [ ] `lib/ai/schemas.ts` 생성
  ```typescript
  import { z } from 'zod';

  export const dayPlanSchema = z.object({
    topic: z.string(),
    duration: z.number().min(0).max(480),
    priority: z.enum(['high', 'medium', 'low']),
    tasks: z.array(z.string()),
  });

  export const learningPlanSchema = z.object({
    dailyPlan: z.object({
      monday: dayPlanSchema.optional(),
      tuesday: dayPlanSchema.optional(),
      wednesday: dayPlanSchema.optional(),
      thursday: dayPlanSchema.optional(),
      friday: dayPlanSchema.optional(),
      saturday: dayPlanSchema.optional(),
      sunday: dayPlanSchema.optional(),
    }),
  });

  export const studyMethodSchema = z.object({
    methods: z.array(z.string()).min(1).max(5),
    resources: z.array(z.string()).max(5),
    timeStrategy: z.string().optional(),
  });

  export const progressAnalysisSchema = z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    efficiency: z.number().min(0).max(1),
    onTrack: z.boolean(),
    recommendations: z.array(z.string()),
  });

  export const motivationSchema = z.object({
    message: z.string().min(1).max(500),
  });
  ```

### 3.3 AI 유틸리티 함수 (재시도, 타임아웃)
- [ ] `lib/ai/utils.ts` 생성
  ```typescript
  // Retry with exponential backoff
  export async function withRetry<T>(
    fn: () => Promise<T>,
    options: { maxRetries?: number; baseDelay?: number } = {}
  ): Promise<T> {
    const { maxRetries = 3, baseDelay = 1000 } = options;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;

        // Rate limit (429) or server error (5xx) 시 재시도
        if (isRetryableError(error)) {
          const delay = baseDelay * Math.pow(2, attempt);
          await sleep(delay);
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  // Timeout wrapper
  export async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = 30000
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await promise;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('429') ||
             message.includes('rate limit') ||
             message.includes('5') ||  // 5xx errors
             message.includes('timeout');
    }
    return false;
  }
  ```

### 3.4 AI API Route: 학습 계획 생성
- [ ] `app/api/ai/plan/route.ts`
  - [ ] POST 핸들러 구현
  - [ ] Input: subjectId, targetDate, currentLevel, weeklyHours
  - [ ] AI 호출 (generateText) with retry + timeout (30초)
  - [ ] Zod 스키마로 응답 검증
  - [ ] learning_plans 테이블에 저장
  - [ ] 에러 핸들링 (try-catch, fallback 응답)
  - [ ] 402 에러 (크레딧 부족) 별도 처리

### 3.5 AI API Route: 학습 방법 추천
- [ ] `app/api/ai/recommend/route.ts`
  - [ ] POST 핸들러 구현
  - [ ] Input: subjectId, recentSessions
  - [ ] AI 호출 및 응답 검증
  - [ ] 에러 핸들링 + fallback

### 3.6 AI API Route: 진도 분석
- [ ] `app/api/ai/analyze/route.ts`
  - [ ] POST 핸들러 구현
  - [ ] Input: sessions, goals
  - [ ] AI 호출 및 응답 검증
  - [ ] 강점/약점 과목, 효율성, 달성 가능성 분석
  - [ ] 에러 핸들링 + fallback

### 3.7 AI API Route: 동기부여 메시지
- [ ] `app/api/ai/motivation/route.ts`
  - [ ] POST 핸들러 구현
  - [ ] Input: type, recentProgress, streakDays
  - [ ] AI 호출 및 응답 검증
  - [ ] motivations 테이블에 저장
  - [ ] 에러 핸들링 + fallback

### 3.8 Learning Plan Actions
- [ ] `actions/plans.ts` 생성
  - [ ] `getPlans(subjectId?)` - 학습 계획 조회
  - [ ] `getCurrentWeekPlan()` - 이번 주 계획 조회
  - [ ] `createPlan(data)` - 계획 저장
  - [ ] `updatePlanStatus(id, status)` - 계획 상태 변경
  - [ ] `deletePlan(id)` - 계획 삭제

### Phase 3 검증
- [ ] **CRITICAL: `npm run lint` 실행**
- [ ] **CRITICAL: `npm run build` 실행**
- [ ] **CRITICAL: 빌드 에러 0개 확인**
- [ ] Test: POST /api/ai/plan - 학습 계획 생성 확인
- [ ] Test: POST /api/ai/recommend - 학습 방법 추천 확인
- [ ] Test: POST /api/ai/analyze - 진도 분석 확인
- [ ] Test: POST /api/ai/motivation - 동기부여 메시지 확인
- [ ] Test: AI 응답 JSON 형식 확인 (Zod 검증)
- [ ] Test: 에러 발생 시 fallback 동작 확인
- [ ] Test: 타임아웃 (30초 초과) 처리 확인
- [ ] Test: Rate limit 에러 시 재시도 확인
- [ ] Commit: "Phase 3: AI features complete"

---

## Phase 4: UI 구현 (30분)

### 4.1 공통 컴포넌트
- [ ] `components/header.tsx` - 헤더 (타이틀, 버튼)
- [ ] `components/navigation.tsx` - 탭 네비게이션
- [ ] `components/empty-state.tsx` - 빈 상태 UI
- [ ] `components/loading-spinner.tsx` - 로딩 스피너

### 4.2 Subject 컴포넌트
- [ ] `components/subjects/subject-form.tsx`
  - [ ] 과목명, 색상, 난이도, 시험일, 목표점수 입력
  - [ ] 생성/수정 모드 지원
  - [ ] 클라이언트 측 유효성 검사
- [ ] `components/subjects/subject-list.tsx`
  - [ ] 과목 목록 표시
  - [ ] 편집/삭제 버튼
  - [ ] 빈 상태: "과목을 추가해주세요"
- [ ] `components/subjects/subject-dialog.tsx`
  - [ ] 과목 추가/수정 다이얼로그
  - [ ] 삭제 확인 다이얼로그

### 4.3 Session 컴포넌트
- [ ] `components/sessions/session-form.tsx`
  - [ ] 과목 선택, 토픽, 소요시간, 이해도(1-5), 메모, 날짜
  - [ ] 이해도 별점 UI (Star Rating)
  - [ ] 과목 없을 시 "먼저 과목을 추가하세요" 안내
- [ ] `components/sessions/session-list.tsx`
  - [ ] 세션 목록 (과목 색상, 토픽, 시간, 이해도)
  - [ ] 편집/삭제 버튼
  - [ ] 빈 상태: "오늘 학습 기록이 없습니다"
- [ ] `components/sessions/session-dialog.tsx`
  - [ ] 세션 추가/수정 다이얼로그

### 4.4 Today Tab (app/page.tsx)
- [ ] 오늘 날짜 표시
- [ ] 오늘 목표 vs 완료 시간 표시
- [ ] 동기부여 메시지 카드 (AI)
- [ ] 오늘 학습 세션 목록
- [ ] 새 세션 추가 버튼
- [ ] 오늘 복습 일정 목록 (체크박스)
- [ ] 밀린 복습 표시 (경고 배지)
- [ ] 복습 완료 처리 기능 (이해도 입력)
- [ ] "밀린 복습 모두 완료" 버튼

### 4.5 Calendar Tab
- [ ] `app/calendar/page.tsx`
- [ ] `app/calendar/loading.tsx` - 페이지 로딩
- [ ] `components/calendar/study-calendar.tsx`
  - [ ] 월별 캘린더 뷰
  - [ ] 년도 이동 버튼 추가
  - [ ] 학습 세션 있는 날 표시 (●)
  - [ ] 복습 일정 있는 날 표시 (◆)
  - [ ] 날짜 클릭 시 해당 날짜 세션 표시
  - [ ] 빈 상태 처리
- [ ] 선택된 날짜 세션 목록

### 4.6 Statistics Tab
- [ ] `app/statistics/page.tsx`
- [ ] `app/statistics/loading.tsx` - 페이지 로딩
- [ ] `components/charts/weekly-bar-chart.tsx`
  - [ ] 주간 일별 학습 시간 Bar Chart
  - [ ] **IMPORTANT: dynamic import with ssr: false**
  ```typescript
  'use client';
  import dynamic from 'next/dynamic';

  const BarChart = dynamic(
    () => import('recharts').then(mod => mod.BarChart),
    { ssr: false }
  );
  const ResponsiveContainer = dynamic(
    () => import('recharts').then(mod => mod.ResponsiveContainer),
    { ssr: false }
  );
  ```
  - [ ] 빈 데이터 시 EmptyState 표시
- [ ] `components/charts/subject-pie-chart.tsx`
  - [ ] 과목별 학습 시간 분포 Pie Chart
  - [ ] 과목 색상 동적 적용
  - [ ] dynamic import 적용
- [ ] `components/charts/comprehension-line-chart.tsx`
  - [ ] 이해도 추이 Line Chart
  - [ ] dynamic import 적용
- [ ] 주간/월간 토글
- [ ] 총 학습 시간, 연속 학습 일수 표시

### 4.7 Plan Tab
- [ ] `app/plan/page.tsx`
- [ ] `app/plan/loading.tsx` - 페이지 로딩
- [ ] `components/plan/plan-form.tsx`
  - [ ] 과목 선택, 현재 수준, 주간 가능 시간 입력
  - [ ] AI 계획 생성 버튼
  - [ ] 로딩 상태 표시 (Spinner + 메시지)
  - [ ] 에러 상태 표시 + 재시도 버튼
- [ ] `components/plan/plan-view.tsx`
  - [ ] 일별 학습 계획 표시
  - [ ] 우선순위 뱃지 (high/medium/low)
  - [ ] 태스크 목록
  - [ ] 계획 상태 표시 (active/completed/archived)

### 4.8 Analysis Tab
- [ ] `app/analysis/page.tsx`
- [ ] `app/analysis/loading.tsx` - 페이지 로딩
- [ ] `components/analysis/analysis-view.tsx`
  - [ ] 목표 달성률 표시
  - [ ] 강점/약점 과목 표시
  - [ ] AI 추천 사항 표시
  - [ ] 추천 학습 방법 표시
  - [ ] 빈 데이터 시 "학습 기록을 먼저 추가하세요" 안내
- [ ] 분석 새로고침 버튼
- [ ] 로딩 상태 표시

### Phase 4 검증
- [ ] **CRITICAL: `npm run lint` 실행**
- [ ] **CRITICAL: `npm run build` 실행**
- [ ] **CRITICAL: 빌드 에러 0개 확인**
- [ ] Test: Today 탭 - 세션 CRUD, 복습 체크 동작
- [ ] Test: Calendar 탭 - 월/년 이동, 날짜 선택, 세션 표시
- [ ] Test: Statistics 탭 - 3개 차트 렌더링 확인 (Hydration 에러 없음)
- [ ] Test: Plan 탭 - AI 계획 생성 및 표시
- [ ] Test: Analysis 탭 - AI 분석 결과 표시
- [ ] Test: 빈 데이터 상태 UI 확인
- [ ] Test: 로딩 상태 UI 확인
- [ ] Test: 반응형 UI 확인
- [ ] Commit: "Phase 4: UI implementation complete"

---

## Phase 5: 통합 & 테스트 (15분)

### 5.1 검색 & 필터 기능
- [ ] 날짜 범위 필터
- [ ] 과목별 필터
- [ ] 이해도별 필터

### 5.2 전체 통합 테스트
- [ ] 과목 생성 → 세션 기록 → 복습 일정 자동 생성 플로우
- [ ] AI 학습 계획 생성 → 저장 → 조회 플로우
- [ ] 복습 완료 → 이해도 입력 → 다음 복습일 갱신 플로우
- [ ] 통계 데이터 정확성 확인
- [ ] 과목 삭제 → 연관 데이터 CASCADE 삭제 확인

### 5.3 에러 핸들링 검증
- [ ] AI API 오류 시 fallback 동작
- [ ] AI API 타임아웃 시 처리
- [ ] AI API Rate limit 시 재시도
- [ ] DB 오류 시 에러 메시지
- [ ] 빈 데이터 상태 UI

### 5.4 Edge Cases 테스트
- [ ] 과목 0개일 때 세션 추가 시도 → 안내 메시지
- [ ] 복습 기한 지난 경우 처리
- [ ] 밀린 복습 일괄 완료
- [ ] 세션 이해도 수정 시 복습 일정 영향 확인
- [ ] AI API 크레딧 부족 시 처리 (402 에러)
- [ ] duration 0 이하 / 481 이상 입력 방지
- [ ] comprehension 범위 (1-5) 검증
- [ ] 미래 날짜 세션 허용/불허 정책 확인
- [ ] 동일 세션에 대한 중복 복습 일정 방지

### 5.5 성능 최적화
- [ ] 불필요한 리렌더링 확인
- [ ] API 호출 최적화
- [ ] 이미지/폰트 최적화
- [ ] 대량 데이터 (100+ 세션) 페이지네이션

### 5.6 타임존 및 날짜 처리
- [ ] 모든 날짜는 로컬 타임존 기준
- [ ] 서버/클라이언트 날짜 일관성 확인

### Phase 5 검증
- [ ] **CRITICAL: `npm run lint` 실행**
- [ ] **CRITICAL: `npm run build` 실행**
- [ ] **CRITICAL: 빌드 에러 0개 확인**
- [ ] Test: 전체 사용자 플로우 테스트
- [ ] Test: 모든 CRUD 동작 확인
- [ ] Test: 모든 AI 기능 동작 확인
- [ ] Test: 복습 알고리즘 정확성 확인
- [ ] Test: 차트 데이터 정확성 확인
- [ ] Test: 모든 Edge Case 처리 확인
- [ ] Commit: "Phase 5: Integration and testing complete"

---

## Final Checklist

### PRD Section 8 테스트 체크리스트

#### 8.1 Subject & Session
- [ ] 과목 생성/수정/삭제
- [ ] 학습 세션 기록
- [ ] 이해도 입력 (1-5)
- [ ] 진행도 추적
- [ ] CASCADE 삭제 동작

#### 8.2 AI Features
- [ ] AI 학습 계획 생성
- [ ] 복습 일정 자동 생성
- [ ] 학습 방법 추천
- [ ] 진도 분석
- [ ] 동기부여 메시지
- [ ] AI 에러 시 fallback

#### 8.3 Views
- [ ] 캘린더 보기 (년/월 이동)
- [ ] 통계 차트 정확성 (Hydration 에러 없음)
- [ ] 검색/필터 동작
- [ ] 빈 데이터 상태

#### 8.4 Edge Cases
- [ ] 복습 일정 누락 시 (기한 지남)
- [ ] 목표 미달 시
- [ ] AI API 오류 시 (타임아웃, Rate limit, 크레딧 부족)
- [ ] 과목 없이 세션 추가 시
- [ ] 잘못된 입력값 검증

### Success Criteria
- [ ] 12개 피처 모두 동작
- [ ] AI 계획 생성 정확도 높음
- [ ] 복습 알고리즘 동작 (1, 3, 7, 14, 30, 60, 90일 간격)
- [ ] 차트 시각화 명확 (SSR 에러 없음)
- [ ] 반응형 UI
- [ ] 에러 핸들링 완벽
- [ ] `npm run build` 성공

---

## File Structure Summary

```
app/
├── layout.tsx                    # Root layout
├── page.tsx                      # Today tab (메인)
├── loading.tsx                   # 글로벌 로딩
├── error.tsx                     # 글로벌 에러 바운더리
├── not-found.tsx                 # 404 페이지
├── calendar/
│   ├── page.tsx                  # Calendar tab
│   └── loading.tsx
├── statistics/
│   ├── page.tsx                  # Statistics tab
│   └── loading.tsx
├── plan/
│   ├── page.tsx                  # Plan tab
│   └── loading.tsx
├── analysis/
│   ├── page.tsx                  # Analysis tab
│   └── loading.tsx
└── api/ai/
    ├── plan/route.ts             # 학습 계획 생성 API
    ├── recommend/route.ts        # 학습 방법 추천 API
    ├── analyze/route.ts          # 진도 분석 API
    └── motivation/route.ts       # 동기부여 메시지 API

components/
├── ui/                           # shadcn/ui 컴포넌트
├── header.tsx
├── navigation.tsx
├── empty-state.tsx               # 빈 상태 컴포넌트
├── loading-spinner.tsx           # 로딩 스피너
├── subjects/
│   ├── subject-form.tsx
│   ├── subject-list.tsx
│   └── subject-dialog.tsx
├── sessions/
│   ├── session-form.tsx
│   ├── session-list.tsx
│   └── session-dialog.tsx
├── calendar/
│   └── study-calendar.tsx
├── charts/
│   ├── weekly-bar-chart.tsx      # dynamic import 필수
│   ├── subject-pie-chart.tsx     # dynamic import 필수
│   └── comprehension-line-chart.tsx  # dynamic import 필수
├── plan/
│   ├── plan-form.tsx
│   └── plan-view.tsx
└── analysis/
    └── analysis-view.tsx

db/
├── index.ts                      # DB 연결
└── schema.ts                     # Drizzle 스키마 (5 테이블 + 인덱스)

actions/
├── subjects.ts                   # Subject CRUD
├── sessions.ts                   # Session CRUD
├── reviews.ts                    # Review actions
└── plans.ts                      # Plan actions

lib/
├── utils.ts                      # 유틸리티 함수
├── types.ts                      # TypeScript 타입
└── ai/
    ├── openrouter.ts             # Open Router 클라이언트 (baseURL 필수)
    ├── prompts.ts                # AI 프롬프트 템플릿
    ├── schemas.ts                # Zod 스키마 (AI 응답 검증)
    ├── utils.ts                  # AI 유틸리티 (retry, timeout)
    └── review-algorithm.ts       # 망각 곡선 알고리즘
```

---

## Edge Cases Reference

### 데이터 무결성
| # | 케이스 | 처리 방법 |
|---|--------|----------|
| 1 | 과목 삭제 시 연관 데이터 | ON DELETE CASCADE |
| 2 | 세션 삭제 시 복습 일정 | ON DELETE CASCADE |
| 3 | 과목 0개일 때 세션 생성 | UI에서 과목 먼저 생성 유도 |
| 4 | duration ≤ 0 또는 > 480 | Zod validation |
| 5 | comprehension 범위 초과 | Zod validation (1-5) |

### AI 관련
| # | 케이스 | 처리 방법 |
|---|--------|----------|
| 6 | JSON 파싱 실패 | Zod validation + fallback |
| 7 | API 키 무효/만료 | 명확한 에러 메시지 |
| 8 | 타임아웃 (>30초) | AbortController + 재시도 버튼 |
| 9 | Rate Limit (429) | 지수 백오프 재시도 (3회) |
| 10 | 크레딧 부족 (402) | 명확한 에러 메시지 |

### 복습 관련
| # | 케이스 | 처리 방법 |
|---|--------|----------|
| 11 | 복습 기한 지남 | getOverdueReviews() + 경고 표시 |
| 12 | 과거 복습 일괄 완료 | completeAllOverdue() |
| 13 | repetitionCount > 6 | 마지막 간격 (90일) 유지 |
| 14 | 복습 시 이해도 저장 | comprehension 필드 추가됨 |

### UI/UX
| # | 케이스 | 처리 방법 |
|---|--------|----------|
| 15 | 차트 SSR 에러 | dynamic import with ssr: false |
| 16 | 빈 데이터 상태 | EmptyState 컴포넌트 |
| 17 | 대량 데이터 | 페이지네이션 (100개 이상) |
| 18 | 로딩 상태 | loading.tsx + Spinner |

---

## Time Estimate Summary

| Phase | Time | Tasks |
|-------|------|-------|
| Phase 1 | 15분 | 프로젝트 셋업 |
| Phase 2 | 25분 | DB & CRUD |
| Phase 3 | 35분 | AI 기능 |
| Phase 4 | 30분 | UI 구현 |
| Phase 5 | 15분 | 통합 & 테스트 |
| **Total** | **120분** | |
