# Small Business CRM - PRD

## 1. Project Overview

### 1.1 Purpose
소규모 비즈니스용 고객 관계 관리(CRM) 시스템. 연락처, 회사, 거래(Deal) 관리 및 영업 파이프라인 추적.

### 1.2 Tech Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Database: PostgreSQL + Drizzle ORM
- UI: shadcn/ui + Tailwind CSS
- Charts: Recharts
- DnD: @dnd-kit (파이프라인)
- Container: Docker (PostgreSQL - 기존 사용)

### 1.3 Target Users
- 소규모 영업팀
- 프리랜서/컨설턴트
- 스타트업

---

## 2. Features (15개)

### Feature 1: Contact Management (CRUD)
연락처 등록/수정/삭제
- 이름, 이메일, 전화번호
- 직함, 회사 연결
- 프로필 메모

### Feature 2: Company Management (CRUD)
회사 등록/수정/삭제
- 회사명, 업종, 웹사이트
- 주소, 직원 수
- 회사 메모

### Feature 3: Contact-Company Linking
연락처와 회사 연결
- 연락처 생성 시 회사 선택
- 회사 상세에서 소속 연락처 목록
- 연락처 상세에서 소속 회사 정보

### Feature 4: Deal Management (CRUD)
거래(영업 기회) 관리
- 거래명, 금액, 예상 마감일
- 연결된 연락처/회사
- 거래 단계 (파이프라인)

### Feature 5: Pipeline Stages
파이프라인 단계 관리
- 기본 단계: Lead → Qualified → Proposal → Negotiation → Closed Won / Closed Lost
- 단계별 거래 목록
- 드래그앤드롭으로 단계 이동

### Feature 6: Deal Stage Change (DnD)
거래 상태 변경
- 칸반 보드 형태
- 드래그앤드롭 이동
- 단계 변경 시 자동 기록

### Feature 7: Activity Log
활동 기록
- 유형: 통화, 이메일, 미팅, 노트
- 연락처/회사/거래에 연결
- 활동 일시, 내용

### Feature 8: Activity Scheduling
활동 일정 관리
- 예정된 활동 등록
- 완료 체크
- 오늘/이번 주 예정 활동

### Feature 9: Task Assignment
태스크 관리
- 연락처/회사/거래에 태스크 연결
- 마감일, 우선순위
- 완료 체크

### Feature 10: Notes & Memos
노트/메모 관리
- 연락처/회사/거래별 노트
- 작성일, 내용
- 노트 검색

### Feature 11: Tag System
태그 시스템
- 연락처/회사/거래에 태그 부여
- 태그별 필터링
- 태그 색상

### Feature 12: Advanced Search & Filter
고급 검색/필터
- 전체 검색 (연락처/회사/거래)
- 필터: 태그, 단계, 날짜 범위
- 정렬: 이름, 날짜, 금액

### Feature 13: Email Templates
이메일 템플릿
- 템플릿 CRUD
- 변수 치환 ({{name}}, {{company}})
- 템플릿 복사 기능

### Feature 14: Statistics & Reports
통계 및 리포트
- 파이프라인 전환율
- 단계별 거래 금액
- 월별 성사 거래

### Feature 15: Dashboard
대시보드
- 오늘 예정 활동
- 파이프라인 요약 (금액)
- 최근 활동
- 주요 지표 카드

---

## 3. Data Structure

### 3.1 Company (회사)
```typescript
interface Company {
  id: string
  name: string
  industry: string | null
  website: string | null
  address: string | null
  employeeCount: number | null
  memo: string | null
  createdAt: Date
  updatedAt: Date
}
```

### 3.2 Contact (연락처)
```typescript
interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  position: string | null
  companyId: string | null
  memo: string | null
  createdAt: Date
  updatedAt: Date
}
```

### 3.3 Deal (거래)
```typescript
interface Deal {
  id: string
  title: string
  amount: bigint              // BIGINT - 대형 거래 금액 지원
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  expectedCloseDate: Date | null
  contactId: string | null
  companyId: string | null
  memo: string | null
  createdAt: Date
  updatedAt: Date
}
```

### 3.4 Activity (활동)
```typescript
interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note'
  title: string
  description: string | null
  scheduledAt: Date | null
  completedAt: Date | null
  contactId: string | null    // 최소 1개 FK 필수 (CHECK 제약)
  companyId: string | null    // 최소 1개 FK 필수 (CHECK 제약)
  dealId: string | null       // 최소 1개 FK 필수 (CHECK 제약)
  createdAt: Date
  updatedAt: Date             // 수정 추적용 추가
}
```

### 3.5 Task (태스크)
```typescript
interface Task {
  id: string
  title: string
  description: string | null
  dueDate: Date | null
  priority: 'low' | 'medium' | 'high'
  isCompleted: boolean
  contactId: string | null
  companyId: string | null
  dealId: string | null
  createdAt: Date
  updatedAt: Date             // 수정 추적용 추가
}
```

### 3.6 Tag (태그)
```typescript
interface Tag {
  id: string
  name: string
  color: string
}

interface ContactTag {
  contactId: string
  tagId: string
}

interface CompanyTag {
  companyId: string
  tagId: string
}

interface DealTag {
  dealId: string
  tagId: string
}
```

### 3.7 EmailTemplate (이메일 템플릿)
```typescript
interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  createdAt: Date
  updatedAt: Date
}
```

---

## 4. Database Schema (Drizzle)

```typescript
// companies 테이블
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  industry: varchar('industry', { length: 100 }),
  website: varchar('website', { length: 255 }),
  address: text('address'),
  employeeCount: integer('employee_count'),
  memo: text('memo'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// contacts 테이블
export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  position: varchar('position', { length: 100 }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
  memo: text('memo'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// deals 테이블
export const dealStageEnum = pgEnum('deal_stage', [
  'lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
])

export const deals = pgTable('deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull().default(0), // BIGINT for large amounts
  stage: dealStageEnum('stage').notNull().default('lead'),
  expectedCloseDate: date('expected_close_date'),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
  memo: text('memo'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// activities 테이블
export const activityTypeEnum = pgEnum('activity_type', ['call', 'email', 'meeting', 'note'])

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: activityTypeEnum('type').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  scheduledAt: timestamp('scheduled_at'),
  completedAt: timestamp('completed_at'),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
// CHECK: contact_id IS NOT NULL OR company_id IS NOT NULL OR deal_id IS NOT NULL

// tasks 테이블
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high'])

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  dueDate: date('due_date'),
  priority: priorityEnum('priority').notNull().default('medium'),
  isCompleted: boolean('is_completed').default(false),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// tags 테이블
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 7 }).notNull().default('#3B82F6'),
})

// 연결 테이블들
export const contactTags = pgTable('contact_tags', {
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.contactId, t.tagId] }),
}))

export const companyTags = pgTable('company_tags', {
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.companyId, t.tagId] }),
}))

export const dealTags = pgTable('deal_tags', {
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.dealId, t.tagId] }),
}))

// email_templates 테이블
export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

---

## 5. UI Layout

### 5.1 Main Layout
```
┌─────────────────────────────────────────────────────────┐
│  Logo: Mini CRM    [🔍 검색]              [+ 새로 만들기] │
├─────────────────────────────────────────────────────────┤
│ Sidebar          │  Main Content Area                   │
│ ┌──────────────┐ │                                      │
│ │ 📊 대시보드   │ │                                      │
│ │ 👤 연락처    │ │                                      │
│ │ 🏢 회사      │ │                                      │
│ │ 💰 거래      │ │                                      │
│ │ 📋 활동      │ │                                      │
│ │ ✅ 태스크    │ │                                      │
│ │ 📧 템플릿    │ │                                      │
│ │ 🏷️ 태그     │ │                                      │
│ └──────────────┘ │                                      │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  Stats Cards (4개)                                       │
│  [연락처: 45] [회사: 12] [진행 거래: 8] [이번 달 성사: ₩5M] │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌───────────────────────────┐ │
│  │ 파이프라인 요약      │  │ 오늘 예정 활동            │ │
│  │ Lead: ₩2M (3)       │  │ • 10:00 미팅 - 홍길동     │ │
│  │ Qualified: ₩5M (2)  │  │ • 14:00 통화 - 김철수     │ │
│  │ Proposal: ₩8M (2)   │  │ • 16:00 이메일 - ABC사    │ │
│  │ Negotiation: ₩3M (1)│  │                           │ │
│  └─────────────────────┘  └───────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  최근 활동                                               │
│  • [통화] 홍길동과 제품 문의 통화 - 10분 전              │
│  • [이메일] ABC사에 제안서 발송 - 1시간 전               │
│  • [미팅] XYZ사 미팅 완료 - 어제                         │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Pipeline (Kanban)
```
┌─────────────────────────────────────────────────────────────────────┐
│  파이프라인 보드                                     [+ 새 거래]     │
├─────────────────────────────────────────────────────────────────────┤
│ Lead        │ Qualified   │ Proposal    │ Negotiation │ Closed Won │
│ ₩2,000,000  │ ₩5,000,000  │ ₩8,000,000  │ ₩3,000,000  │ ₩12,000,000│
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐│
│ │ABC 프로젝│ │ │XYZ 계약 │ │ │DEF 도입 │ │ │GHI 확장 │ │ │JKL 완료 ││
│ │₩500,000 │ │ │₩2,000,000│ │ │₩3,000,000│ │ │₩3,000,000│ │ │₩5,000,000││
│ │홍길동    │ │ │김철수    │ │ │박영희    │ │ │이순신    │ │ │최민수   ││
│ └─────────┘ │ └─────────┘ │ └─────────┘ │ └─────────┘ │ └─────────┘│
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │             │ ┌─────────┐│
│ │MNO 문의 │ │ │PQR 검토 │ │ │STU 협의 │ │             │ │VWX 성사 ││
│ │₩800,000 │ │ │₩3,000,000│ │ │₩5,000,000│ │             │ │₩7,000,000││
│ └─────────┘ │ └─────────┘ │ └─────────┘ │             │ └─────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### 5.4 Contact Detail
```
┌─────────────────────────────────────────────────────────┐
│  👤 홍길동                              [수정] [삭제]    │
│  📧 hong@example.com  📞 010-1234-5678                  │
│  💼 개발팀장 @ ABC 주식회사                              │
├─────────────────────────────────────────────────────────┤
│  Tabs: [활동] [거래] [태스크] [노트]                     │
├─────────────────────────────────────────────────────────┤
│  활동 내역                                [+ 활동 추가]  │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 📞 제품 문의 통화                     2025-01-10    ││
│  │ 신규 기능 관련 문의, 다음 주 미팅 예정               ││
│  ├─────────────────────────────────────────────────────┤│
│  │ 📧 제안서 발송                        2025-01-08    ││
│  │ 커스텀 패키지 제안서 전달                           ││
│  └─────────────────────────────────────────────────────┘│
│  Tags: [VIP] [테크] [서울]                               │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Phases

### Phase 1: Project Setup & Database (15분)
- Next.js 프로젝트 설정
- Drizzle ORM 설정
- 8개 테이블 스키마 생성
- PostgreSQL 연결 (기존 DB)
- Migration 실행

### Phase 2: Core CRUD - Company & Contact (20분)
- Feature 1: Contact CRUD
- Feature 2: Company CRUD
- Feature 3: Contact-Company Linking
- 기본 목록/상세 UI

### Phase 3: Deal & Pipeline (25분)
- Feature 4: Deal CRUD
- Feature 5: Pipeline Stages
- Feature 6: Deal Stage Change (DnD)
- 칸반 보드 UI

### Phase 4: Activity & Task (20분)
- Feature 7: Activity Log
- Feature 8: Activity Scheduling
- Feature 9: Task Assignment
- Feature 10: Notes & Memos

### Phase 5: Tag & Search (15분)
- Feature 11: Tag System
- Feature 12: Advanced Search & Filter
- 태그 CRUD 및 연결

### Phase 6: Templates & Dashboard (20분)
- Feature 13: Email Templates
- Feature 14: Statistics & Reports
- Feature 15: Dashboard
- 최종 통합 테스트

---

## 7. Critical Rules

### 7.1 Data Relationships
- Contact → Company (N:1, optional)
- Deal → Contact (N:1, optional)
- Deal → Company (N:1, optional)
- Activity → Contact/Company/Deal (N:1, optional, 최소 1개 연결)
- Task → Contact/Company/Deal (N:1, optional)
- Tags → Contact/Company/Deal (M:N)

### 7.2 Pipeline Rules
- 기본 단계는 수정 불가 (코드에서 고정)
- 거래는 어느 단계로든 이동 가능
- Closed Won/Lost에서 다른 단계로 이동 시 확인 필요

### 7.3 Cascade Delete
- Company 삭제 시: Contact.companyId = null, Deal.companyId = null
- Contact 삭제 시: Deal.contactId = null, 관련 Activity/Task cascade
- Deal 삭제 시: 관련 Activity/Task cascade
- Tag 삭제 시: 연결 테이블 cascade

### 7.4 Amount Format
- 금액은 원화 (₩) 기준
- 천 단위 콤마 표시
- 파이프라인에서는 백만 단위로 요약 (₩5M)

---

## 8. Success Criteria

### 8.1 Functional
- [ ] Company/Contact CRUD 동작
- [ ] Deal CRUD 및 파이프라인 표시
- [ ] 드래그앤드롭 단계 이동
- [ ] Activity/Task CRUD
- [ ] Tag 시스템 동작
- [ ] 검색/필터 동작
- [ ] 이메일 템플릿 CRUD
- [ ] 대시보드 통계 정확

### 8.2 Technical
- [ ] TypeScript 에러 없음
- [ ] Drizzle 쿼리 정상
- [ ] DnD 부드럽게 동작
- [ ] 반응형 UI

### 8.3 Performance
- [ ] 목록 로딩 < 1초
- [ ] DnD 지연 없음

---

## 9. Testing Checklist

### 9.1 Company & Contact
- [ ] 회사 생성/수정/삭제
- [ ] 연락처 생성 (회사 연결)
- [ ] 연락처 수정/삭제
- [ ] 회사 삭제 시 연락처 회사 연결 해제

### 9.2 Deal & Pipeline
- [ ] 거래 생성 (연락처/회사 연결)
- [ ] 거래 드래그앤드롭 이동
- [ ] 단계별 금액 합계
- [ ] Closed Won/Lost 이동

### 9.3 Activity & Task
- [ ] 활동 생성 (연락처/회사/거래 연결)
- [ ] 예정 활동 완료 처리
- [ ] 태스크 생성/완료
- [ ] 우선순위별 정렬

### 9.4 Tag & Search
- [ ] 태그 생성/삭제
- [ ] 연락처/회사/거래에 태그 부여
- [ ] 태그 필터링
- [ ] 전체 검색

### 9.5 Dashboard
- [ ] 통계 카드 정확한 수치
- [ ] 파이프라인 요약 정확
- [ ] 오늘 예정 활동 표시
- [ ] 최근 활동 표시