# Implementation Plan - Small Business CRM

> **TDD Workflow**: TEST (Red) → CODE (Green) → VERIFY (Refactor)

## Overview

| Phase | Description | Time |
|-------|-------------|------|
| 1 | Project Setup & Database | 15분 |
| 2 | Core CRUD - Company & Contact | 20분 |
| 3 | Deal & Pipeline | 25분 |
| 4 | Activity & Task | 20분 |
| 5 | Tag & Search | 15분 |
| 6 | Templates & Dashboard | 20분 |
| **Total** | | **115분** |

---

## Phase 1: Project Setup & Database (15분)

### 1.1 Project Initialization (5분)

- [ ] **Next.js 프로젝트 생성**
  ```bash
  npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false
  ```

- [ ] **Dependencies 설치**
  ```bash
  npm install drizzle-orm postgres
  npm install -D drizzle-kit
  npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  npm install recharts zod
  npm install -D vitest @testing-library/react @testing-library/jest-dom
  ```

- [ ] **shadcn/ui 초기화**
  ```bash
  npx shadcn-ui@latest init
  npx shadcn-ui@latest add button card dialog input select table tabs badge
  ```

- [ ] **폴더 구조 생성**
  ```
  components/, lib/db/, hooks/, types/, __tests__/, specs/
  ```

### 1.2 Database Setup (10분)

- [ ] **Drizzle 설정**
  - [ ] `drizzle.config.ts` 생성
  - [ ] `lib/db/index.ts` - DB 연결
  - [ ] `.env` - DATABASE_URL 설정

- [ ] **Schema 정의** (`lib/db/schema.ts`)
  - [ ] Enums: `deal_stage`, `activity_type`, `priority`
  - [ ] Table: `companies`
  - [ ] Table: `contacts`
  - [ ] Table: `deals` (amount: BIGINT)
  - [ ] Table: `activities` (updatedAt 추가, CHECK 제약)
  - [ ] Table: `tasks` (updatedAt 추가)
  - [ ] Table: `tags`
  - [ ] Table: `contact_tags`, `company_tags`, `deal_tags`
  - [ ] Table: `email_templates`
  - [ ] CHECK 제약: activities 최소 1개 FK 필수
  - [ ] pg_trgm 확장 및 GIN 인덱스

- [ ] **Migration 실행**
  ```bash
  npm run db:generate
  npm run db:push
  ```

- [ ] **VERIFY**: Drizzle Studio에서 테이블 확인
  ```bash
  npm run db:studio
  ```

---

## Phase 2: Core CRUD - Company & Contact (20분)

### 2.1 Company CRUD (10분)

#### TEST (Red)

- [ ] `__tests__/api/companies.test.ts` 작성
  ```typescript
  describe('Company API', () => {
    describe('GET /api/companies', () => {
      it('should return empty array when no companies')
      it('should return all companies')
      it('should support pagination (page, limit)')
      it('should support cursor-based pagination')
    })

    describe('POST /api/companies', () => {
      it('should create company with valid data')
      it('should return 400 if name is missing')
    })

    describe('GET /api/companies/:id', () => {
      it('should return company by id')
      it('should return 404 if not found')
    })

    describe('PUT /api/companies/:id', () => {
      it('should update company')
      it('should return 404 if not found')
    })

    describe('DELETE /api/companies/:id', () => {
      it('should delete company')
      it('should set null on related contacts')
    })

    describe('GET /api/companies/:id/delete-preview', () => {
      it('should return impact count for contacts')
      it('should return impact count for activities (cascade)')
      it('should return impact count for tasks (cascade)')
    })
  })
  ```

- [ ] `__tests__/components/company-form.test.tsx` 작성
  ```typescript
  describe('CompanyForm', () => {
    it('should render all fields')
    it('should show validation error for empty name')
    it('should call onSubmit with form data')
  })
  ```

#### CODE (Green)

- [ ] **Validation Schema** (`lib/validations.ts`)
  ```typescript
  export const companySchema = z.object({
    name: z.string().min(1, '회사명은 필수입니다'),
    industry: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    address: z.string().optional(),
    employeeCount: z.number().int().positive().optional(),
    memo: z.string().optional(),
  })
  ```

- [ ] **API Routes**
  - [ ] `app/api/companies/route.ts` - GET, POST
  - [ ] `app/api/companies/[id]/route.ts` - GET, PUT, DELETE

- [ ] **Components**
  - [ ] `components/companies/company-list.tsx`
  - [ ] `components/companies/company-form.tsx`
  - [ ] `components/companies/company-card.tsx`

- [ ] **Pages**
  - [ ] `app/companies/page.tsx` - 목록
  - [ ] `app/companies/new/page.tsx` - 생성
  - [ ] `app/companies/[id]/page.tsx` - 상세/수정

#### VERIFY

- [ ] `npm run test -- companies` - 모든 테스트 통과
- [ ] 브라우저에서 Company CRUD 동작 확인

---

### 2.2 Contact CRUD (10분)

#### TEST (Red)

- [ ] `__tests__/api/contacts.test.ts` 작성
  ```typescript
  describe('Contact API', () => {
    describe('GET /api/contacts', () => {
      it('should return contacts with company info')
      it('should filter by companyId')
    })

    describe('POST /api/contacts', () => {
      it('should create contact with company link')
      it('should create contact without company')
      it('should return 400 if name is missing')
    })

    describe('GET /api/contacts/:id', () => {
      it('should return contact with company info')
      it('should return 404 if not found')
    })

    describe('PUT /api/contacts/:id', () => {
      it('should update contact')
      it('should update company link')
    })

    describe('DELETE /api/contacts/:id', () => {
      it('should delete contact')
      it('should cascade delete activities and tasks')
    })
  })
  ```

- [ ] `__tests__/components/contact-form.test.tsx` 작성
  ```typescript
  describe('ContactForm', () => {
    it('should render company select dropdown')
    it('should validate email format')
    it('should validate phone format')
  })
  ```

#### CODE (Green)

- [ ] **Validation Schema**
  ```typescript
  export const contactSchema = z.object({
    name: z.string().min(1, '이름은 필수입니다'),
    email: z.string().email('올바른 이메일 형식이 아닙니다').optional().or(z.literal('')),
    phone: z.string().regex(/^[\d-]+$/, '올바른 전화번호 형식이 아닙니다').optional().or(z.literal('')),
    position: z.string().optional(),
    companyId: z.string().uuid().optional().nullable(),
    memo: z.string().optional(),
  })
  ```

- [ ] **API Routes**
  - [ ] `app/api/contacts/route.ts` - GET, POST
  - [ ] `app/api/contacts/[id]/route.ts` - GET, PUT, DELETE

- [ ] **Components**
  - [ ] `components/contacts/contact-list.tsx`
  - [ ] `components/contacts/contact-form.tsx`
  - [ ] `components/contacts/contact-card.tsx`
  - [ ] `components/contacts/contact-detail.tsx`

- [ ] **Pages**
  - [ ] `app/contacts/page.tsx`
  - [ ] `app/contacts/new/page.tsx`
  - [ ] `app/contacts/[id]/page.tsx`

#### VERIFY

- [ ] `npm run test -- contacts` - 모든 테스트 통과
- [ ] Contact 생성 시 Company 연결 확인
- [ ] Company 상세에서 소속 Contact 목록 확인

---

## Phase 3: Deal & Pipeline (25분)

### 3.1 Deal CRUD (10분)

#### TEST (Red)

- [ ] `__tests__/api/deals.test.ts` 작성
  ```typescript
  describe('Deal API', () => {
    describe('GET /api/deals', () => {
      it('should return deals with contact and company')
      it('should filter by stage')
      it('should return stage summary with totals')
    })

    describe('POST /api/deals', () => {
      it('should create deal with default stage "lead"')
      it('should link to contact and company')
      it('should return 400 if title is missing')
    })

    describe('PUT /api/deals/:id', () => {
      it('should update deal stage')
      it('should update amount')
      it('should create activity on stage change')
    })

    describe('DELETE /api/deals/:id', () => {
      it('should delete deal')
      it('should cascade delete activities and tasks')
    })
  })
  ```

#### CODE (Green)

- [ ] **Validation Schema**
  ```typescript
  export const dealSchema = z.object({
    title: z.string().min(1, '거래명은 필수입니다'),
    amount: z.number().int().min(0).default(0),
    stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).default('lead'),
    expectedCloseDate: z.string().optional().nullable(),
    contactId: z.string().uuid().optional().nullable(),
    companyId: z.string().uuid().optional().nullable(),
    memo: z.string().optional(),
  })
  ```

- [ ] **API Routes**
  - [ ] `app/api/deals/route.ts` - GET, POST
  - [ ] `app/api/deals/[id]/route.ts` - GET, PUT, DELETE

- [ ] **Components**
  - [ ] `components/deals/deal-form.tsx`
  - [ ] `components/deals/deal-card.tsx`
  - [ ] `components/deals/deal-detail.tsx`

#### VERIFY

- [ ] `npm run test -- deals` - 모든 테스트 통과

---

### 3.2 Pipeline Board & DnD (15분)

#### TEST (Red)

- [ ] `__tests__/components/pipeline-board.test.tsx` 작성
  ```typescript
  describe('PipelineBoard', () => {
    it('should render all 6 pipeline stages')
    it('should display deals in correct columns')
    it('should show stage total amounts')
  })

  describe('DealCard', () => {
    it('should display deal title, amount, contact')
    it('should be draggable')
  })

  describe('Stage Change', () => {
    it('should move deal to new stage on drop')
    it('should show confirm dialog when moving from closed stage')
    it('should rollback on API error')
    it('should create activity on stage change')
  })

  describe('Concurrency Control', () => {
    it('should include updatedAt in stage change request')
    it('should return 409 on concurrent modification')
    it('should rollback and refresh on 409 conflict')
    it('should disable drag during pending update')
  })
  ```

#### CODE (Green)

- [ ] **Pipeline Components**
  - [ ] `components/deals/pipeline-board.tsx`
    ```typescript
    // Key implementation points:
    // - DndContext with closestCenter collision
    // - SortableContext for each column
    // - Optimistic update pattern
    // - Confirmation for closed stage moves
    ```
  - [ ] `components/deals/pipeline-column.tsx`
  - [ ] `components/deals/draggable-deal-card.tsx`

- [ ] **DnD Hooks**
  - [ ] `hooks/use-pipeline-dnd.ts`

- [ ] **Pages**
  - [ ] `app/deals/page.tsx` - Pipeline view

- [ ] **Stage Change Logic**
  ```typescript
  // Auto-create activity on stage change
  async function updateDealStage(dealId: string, newStage: DealStage) {
    await db.transaction(async (tx) => {
      await tx.update(deals).set({ stage: newStage, updatedAt: new Date() }).where(eq(deals.id, dealId));
      await tx.insert(activities).values({
        type: 'note',
        title: `단계 변경: ${oldStage} → ${newStage}`,
        dealId,
      });
    });
  }
  ```

#### VERIFY

- [ ] `npm run test -- pipeline` - 모든 테스트 통과
- [ ] 브라우저에서 DnD 동작 확인
- [ ] Closed 단계 이동 시 확인 다이얼로그 확인
- [ ] 단계별 금액 합계 정확성 확인

---

## Phase 4: Activity & Task (20분)

### 4.1 Activity CRUD (10분)

#### TEST (Red)

- [ ] `__tests__/api/activities.test.ts` 작성
  ```typescript
  describe('Activity API', () => {
    describe('GET /api/activities', () => {
      it('should return activities with linked entities')
      it('should filter by contactId')
      it('should filter by type')
      it('should filter by scheduled date range')
      it('should support pagination')
    })

    describe('POST /api/activities', () => {
      it('should create activity with type')
      it('should link to contact/company/deal')
      it('should set scheduledAt for future activities')
      it('should return 400 if no parent FK provided')
      it('should validate at least one parent is linked')
    })

    describe('PUT /api/activities/:id', () => {
      it('should update activity')
      it('should mark as completed with completedAt')
      it('should update updatedAt on modification')
    })

    describe('DELETE /api/activities/:id', () => {
      it('should delete activity')
    })
  })
  ```

- [ ] `__tests__/components/activity-list.test.tsx` 작성
  ```typescript
  describe('ActivityList', () => {
    it('should display activity icon by type')
    it('should show scheduled time')
    it('should allow marking as complete')
  })
  ```

#### CODE (Green)

- [ ] **Validation Schema**
  ```typescript
  export const activitySchema = z.object({
    type: z.enum(['call', 'email', 'meeting', 'note']),
    title: z.string().min(1, '제목은 필수입니다'),
    description: z.string().optional(),
    scheduledAt: z.string().datetime().optional().nullable(),
    contactId: z.string().uuid().optional().nullable(),
    companyId: z.string().uuid().optional().nullable(),
    dealId: z.string().uuid().optional().nullable(),
  })
  ```

- [ ] **API Routes**
  - [ ] `app/api/activities/route.ts`
  - [ ] `app/api/activities/[id]/route.ts`

- [ ] **Components**
  - [ ] `components/activities/activity-list.tsx`
  - [ ] `components/activities/activity-form.tsx`
  - [ ] `components/activities/activity-item.tsx`

- [ ] **Pages**
  - [ ] `app/activities/page.tsx`

#### VERIFY

- [ ] `npm run test -- activities` - 모든 테스트 통과
- [ ] Contact/Company/Deal 상세에서 활동 탭 확인

---

### 4.2 Task CRUD (10분)

#### TEST (Red)

- [ ] `__tests__/api/tasks.test.ts` 작성
  ```typescript
  describe('Task API', () => {
    describe('GET /api/tasks', () => {
      it('should return tasks sorted by priority and dueDate')
      it('should filter by isCompleted')
      it('should filter by dueDate range')
    })

    describe('POST /api/tasks', () => {
      it('should create task with priority')
      it('should set default priority to medium')
    })

    describe('PUT /api/tasks/:id', () => {
      it('should toggle isCompleted')
      it('should update priority')
    })
  })
  ```

- [ ] `__tests__/components/task-list.test.tsx` 작성
  ```typescript
  describe('TaskList', () => {
    it('should display priority badge')
    it('should show due date with overdue styling')
    it('should allow checkbox toggle')
  })
  ```

#### CODE (Green)

- [ ] **Validation Schema**
  ```typescript
  export const taskSchema = z.object({
    title: z.string().min(1, '제목은 필수입니다'),
    description: z.string().optional(),
    dueDate: z.string().optional().nullable(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    contactId: z.string().uuid().optional().nullable(),
    companyId: z.string().uuid().optional().nullable(),
    dealId: z.string().uuid().optional().nullable(),
  })
  ```

- [ ] **API Routes**
  - [ ] `app/api/tasks/route.ts`
  - [ ] `app/api/tasks/[id]/route.ts`

- [ ] **Components**
  - [ ] `components/tasks/task-list.tsx`
  - [ ] `components/tasks/task-form.tsx`
  - [ ] `components/tasks/task-item.tsx`

- [ ] **Pages**
  - [ ] `app/tasks/page.tsx`

#### VERIFY

- [ ] `npm run test -- tasks` - 모든 테스트 통과
- [ ] 우선순위별 정렬 확인
- [ ] 완료 체크박스 동작 확인

---

## Phase 5: Tag & Search (15분)

### 5.1 Tag System (8분)

#### TEST (Red)

- [ ] `__tests__/api/tags.test.ts` 작성
  ```typescript
  describe('Tag API', () => {
    describe('GET /api/tags', () => {
      it('should return all tags')
    })

    describe('POST /api/tags', () => {
      it('should create tag with color')
      it('should return 400 if name is duplicate')
    })

    describe('DELETE /api/tags/:id', () => {
      it('should delete tag')
      it('should cascade delete from junction tables')
    })

    describe('Tag Assignment', () => {
      it('should add tag to contact')
      it('should remove tag from contact')
      it('should add tag to company')
      it('should add tag to deal')
    })
  })
  ```

#### CODE (Green)

- [ ] **API Routes**
  - [ ] `app/api/tags/route.ts`
  - [ ] `app/api/tags/[id]/route.ts`
  - [ ] `app/api/contacts/[id]/tags/route.ts` - Tag assignment

- [ ] **Components**
  - [ ] `components/tags/tag-list.tsx`
  - [ ] `components/tags/tag-form.tsx`
  - [ ] `components/tags/tag-badge.tsx`
  - [ ] `components/tags/tag-select.tsx` - Multi-select for entities

- [ ] **Pages**
  - [ ] `app/tags/page.tsx`

#### VERIFY

- [ ] `npm run test -- tags` - 모든 테스트 통과
- [ ] Contact/Company/Deal에 태그 부여 확인

---

### 5.2 Search & Filter (7분)

#### TEST (Red)

- [ ] `__tests__/api/search.test.ts` 작성
  ```typescript
  describe('Search API', () => {
    describe('GET /api/search', () => {
      it('should search contacts by name')
      it('should search companies by name')
      it('should search deals by title')
      it('should return combined results')
      it('should limit results per category')
    })
  })

  describe('Filter', () => {
    it('should filter contacts by tag')
    it('should filter deals by stage')
    it('should filter activities by date range')
  })
  ```

#### CODE (Green)

- [ ] **API Routes**
  - [ ] `app/api/search/route.ts`

- [ ] **Components**
  - [ ] `components/shared/search-input.tsx`
  - [ ] `components/shared/filter-dropdown.tsx`

- [ ] **Hooks**
  - [ ] `hooks/use-search.ts` - Debounced search

- [ ] **Layout Integration**
  - [ ] `components/layout/header.tsx` - Global search

#### VERIFY

- [ ] `npm run test -- search` - 모든 테스트 통과
- [ ] 헤더에서 전역 검색 동작 확인
- [ ] 태그/단계 필터링 확인

---

## Phase 6: Templates & Dashboard (20분)

### 6.1 Email Templates (8분)

#### TEST (Red)

- [ ] `__tests__/api/templates.test.ts` 작성
  ```typescript
  describe('EmailTemplate API', () => {
    describe('CRUD', () => {
      it('should create template')
      it('should update template')
      it('should delete template')
    })

    describe('Variable Substitution', () => {
      it('should replace {{name}} with contact name')
      it('should replace {{company}} with company name')
      it('should handle missing variables gracefully')
    })

    describe('Copy Template', () => {
      it('should create copy with "(복사)" suffix')
    })
  })
  ```

#### CODE (Green)

- [ ] **Validation Schema**
  ```typescript
  export const templateSchema = z.object({
    name: z.string().min(1),
    subject: z.string().min(1),
    body: z.string().min(1),
  })
  ```

- [ ] **API Routes**
  - [ ] `app/api/templates/route.ts`
  - [ ] `app/api/templates/[id]/route.ts`
  - [ ] `app/api/templates/[id]/copy/route.ts`

- [ ] **Components**
  - [ ] `components/templates/template-list.tsx`
  - [ ] `components/templates/template-form.tsx`
  - [ ] `components/templates/template-preview.tsx`

- [ ] **Variable Substitution**
  ```typescript
  function substituteVariables(template: string, data: Record<string, string>) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
  }
  ```

- [ ] **Pages**
  - [ ] `app/templates/page.tsx`

#### VERIFY

- [ ] `npm run test -- templates` - 모든 테스트 통과
- [ ] 변수 치환 동작 확인

---

### 6.2 Dashboard & Statistics (12분)

#### TEST (Red)

- [ ] `__tests__/api/stats.test.ts` 작성
  ```typescript
  describe('Stats API', () => {
    describe('GET /api/stats', () => {
      it('should return total contacts count')
      it('should return total companies count')
      it('should return active deals count')
      it('should return this month closed won amount')
    })

    describe('Pipeline Summary', () => {
      it('should return amount sum by stage')
      it('should return deal count by stage')
    })

    describe('Today Activities', () => {
      it('should return activities scheduled for today')
      it('should exclude completed activities')
    })

    describe('Recent Activities', () => {
      it('should return last 10 activities')
      it('should include linked entity info')
    })
  })
  ```

- [ ] `__tests__/components/dashboard.test.tsx` 작성
  ```typescript
  describe('Dashboard', () => {
    it('should render stats cards')
    it('should render pipeline summary chart')
    it('should render today activities list')
    it('should render recent activities list')
  })
  ```

#### CODE (Green)

- [ ] **API Routes**
  - [ ] `app/api/stats/route.ts`
  - [ ] `app/api/stats/pipeline/route.ts`
  - [ ] `app/api/stats/activities/today/route.ts`
  - [ ] `app/api/stats/activities/recent/route.ts`

- [ ] **Components**
  - [ ] `components/dashboard/stats-cards.tsx`
    ```typescript
    // 4 cards: 연락처, 회사, 진행 거래, 이번 달 성사
    ```
  - [ ] `components/dashboard/pipeline-summary.tsx`
  - [ ] `components/dashboard/today-activities.tsx`
  - [ ] `components/dashboard/recent-activities.tsx`
  - [ ] `components/dashboard/charts/pipeline-chart.tsx` (Recharts)

- [ ] **Pages**
  - [ ] `app/page.tsx` - Dashboard home

#### VERIFY

- [ ] `npm run test -- stats` - 모든 테스트 통과
- [ ] `npm run test -- dashboard` - 모든 테스트 통과
- [ ] 대시보드 통계 정확성 확인
- [ ] 파이프라인 차트 렌더링 확인

---

## Final Verification Checklist

### Functional Tests

- [ ] Company CRUD 동작
- [ ] Contact CRUD 동작 (Company 연결 포함)
- [ ] Deal CRUD 동작
- [ ] Pipeline DnD 동작
- [ ] Activity CRUD 동작
- [ ] Task CRUD 동작
- [ ] Tag 시스템 동작
- [ ] 전역 검색 동작
- [ ] Email Template CRUD 동작
- [ ] Dashboard 통계 정확성

### Technical Tests

- [ ] `npm run type-check` - TypeScript 에러 없음
- [ ] `npm run lint` - ESLint 에러 없음
- [ ] `npm run test` - 모든 테스트 통과
- [ ] `npm run test:coverage` - 커버리지 80% 이상
- [ ] `npm run build` - 빌드 성공

### Performance Tests

- [ ] 목록 로딩 < 1초
- [ ] DnD 지연 없음 (60fps)
- [ ] 검색 응답 < 500ms

### Browser Tests

- [ ] Chrome 최신 버전
- [ ] Firefox 최신 버전
- [ ] Safari 최신 버전
- [ ] 반응형 UI (모바일/태블릿)

---

## Test Summary

| Phase | Test Files | Test Cases |
|-------|-----------|------------|
| 2.1 | companies.test.ts | 14 |
| 2.2 | contacts.test.ts | 15 |
| 3.1 | deals.test.ts | 12 |
| 3.2 | pipeline-board.test.tsx | 12 |
| 4.1 | activities.test.ts | 14 |
| 4.2 | tasks.test.ts | 10 |
| 5.1 | tags.test.ts | 10 |
| 5.2 | search.test.ts | 8 |
| 6.1 | templates.test.ts | 8 |
| 6.2 | stats.test.ts, dashboard.test.tsx | 14 |
| **Total** | **10 files** | **~117 cases** |

## New Test Cases (from Review)

### Concurrency Tests
- [ ] Optimistic locking with updatedAt
- [ ] 409 Conflict handling in DnD
- [ ] Rollback on concurrent modification

### Pagination Tests
- [ ] Cursor-based pagination
- [ ] Offset-based pagination
- [ ] Edge cases (empty pages, last page)

### Validation Tests
- [ ] Activity parent FK validation (at least one required)
- [ ] Tag name case-insensitive uniqueness
- [ ] Large deal amount (BIGINT)

### Delete Preview Tests
- [ ] Company delete impact preview
- [ ] Contact delete impact preview
- [ ] Deal delete impact preview
