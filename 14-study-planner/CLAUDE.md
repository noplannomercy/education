# AI Study Planner

## Tech Stack
Next.js 14 (App Router), TypeScript (strict), PostgreSQL (localhost:5432), Drizzle ORM, shadcn/ui, Recharts, AI SDK + Open Router, Model: `anthropic/claude-haiku-4.5`

## Commands
- `npm run dev` - Development server
- `npm run lint` - ESLint 검사
- `npx drizzle-kit push` - Push schema to DB
- `npx drizzle-kit studio` - View DB
- `npm run build` - Production build

## Development Workflow
CRITICAL: Follow phase-based workflow strictly:
1. Phase 1: Setup (Next.js, PostgreSQL, Drizzle, shadcn/ui, Recharts, AI SDK)
2. Phase 2: DB & CRUD (5 tables, Subject/Session CRUD)
3. Phase 3: AI Features (5 AI endpoints)
4. Phase 4: UI (5 tabs: Today, Calendar, Statistics, Plan, Analysis)
5. Phase 5: Integration & Testing

ALWAYS: Complete phase → `npm run lint` → `npm run build` → Commit → Update IMPLEMENTATION.md → Next phase

## AI Integration
IMPORTANT: Open Router setup in `lib/ai/openrouter.ts`
- **baseURL MUST be set**: `https://openrouter.ai/api/v1`
- Model: `anthropic/claude-haiku-4.5`
- Use `generateText()` from AI SDK
- Implement: Plan Generation, Review Scheduling, Method Recommendation, Progress Analysis, Motivation

YOU MUST:
- Handle errors gracefully (retry + timeout + fallback)
- Show loading states
- Validate responses with Zod
- Store results in DB
- Implement retry logic for 429 errors (Rate Limit)
- Handle 402 errors (Credit 부족) separately

NEVER:
- Expose API key to client
- Skip error handling
- Call AI from Client Components
- Skip Zod validation for AI responses

## Database
Tables: subjects, study_sessions, learning_plans, review_schedules, motivations

YOU MUST:
- Run `npx drizzle-kit push` before coding
- Use `inferSelect`/`inferInsert` types
- Define indexes for frequently queried columns
- Set `onDelete: 'cascade'` for all FK references
- Add `comprehension` field to `review_schedules` for review rating

NEVER:
- Query DB in Client Components
- Skip migrations
- Use raw SQL
- Forget ON DELETE CASCADE

## Review Algorithm
IMPORTANT: Spaced repetition intervals: 1, 3, 7, 14, 30, 60, 90 days
- Comprehension 4-5: intervals × 1.5 (longer gaps for high comprehension)
- Comprehension 1-2: intervals × 0.5 (shorter gaps for low comprehension)
- Track repetition_count, Update next_review_date on completion
- **Store comprehension when completing review**
- **Handle overdue reviews (past due date)**
- **Prevent past dates in next_review_date calculation**

## Recharts Integration
CRITICAL: All chart components MUST use dynamic import to prevent SSR hydration errors:
```typescript
'use client';
import dynamic from 'next/dynamic';

const BarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { ssr: false }
);
```

## Edge Cases to Handle
- 과목 0개일 때 세션 추가: "먼저 과목을 추가하세요" 안내
- AI 타임아웃 (30초): 재시도 버튼 표시
- AI Rate Limit (429): 지수 백오프 재시도 (3회)
- AI 크레딧 부족 (402): 명확한 에러 메시지
- 복습 기한 지남: 경고 표시 + 일괄 완료 기능
- 빈 데이터 상태: EmptyState 컴포넌트 표시
- duration/comprehension 범위: Zod validation

## Testing
CRITICAL: After EVERY phase completion:
1. Run `npm run lint` - MUST pass
2. Run `npm run build` - MUST pass
3. Manual browser testing
4. Verify AI responses are valid JSON
5. Check charts render correctly (no hydration errors)
6. Test all CRUD operations
7. Test CASCADE delete behavior

## File Structure
```
app/           → Pages, API routes (/api/ai/*), loading.tsx, error.tsx
components/    → UI components (subjects/, sessions/, charts/, plan/, analysis/)
db/            → schema.ts, index.ts
actions/       → Server actions (subjects.ts, sessions.ts, reviews.ts, plans.ts)
lib/ai/        → openrouter.ts, prompts.ts, schemas.ts, utils.ts, review-algorithm.ts
```

## Critical Rules
- ALWAYS run `npm run lint` and `npm run build` after each phase
- NEVER skip phase testing
- AI responses MUST be validated with Zod before DB storage
- Review dates MUST follow spaced repetition algorithm
- ALWAYS use Server Actions for CRUD, API Routes for AI
- ALWAYS use dynamic import for Recharts components
- ALWAYS set onDelete: 'cascade' for FK references
- ALWAYS handle loading, empty, and error states in UI
