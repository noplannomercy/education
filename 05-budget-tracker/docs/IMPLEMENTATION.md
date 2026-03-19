# Implementation Design — 가계부 (Budget Tracker)

**작성일:** 2026-03-19
**기반:** docs/SRS.md + .claude/skills/budget-tracker/references/

---

## 1. 아키텍처 결정

### 레이어 구조
references/architecture.md 패턴 그대로 적용:
- `(auth)/` — 로그인/회원가입 페이지 (인증 불필요)
- `(dashboard)/` — 대시보드/거래/카테고리 (인증 필요, layout.tsx에서 세션 검증)
- `api/` — Route Handler (인증 검증 → 서비스 호출 → 응답)
- `lib/services/` — 비즈니스 로직 분리

### 인증 흐름
- middleware.ts: `/dashboard/*`, `/transactions/*`, `/categories/*` 경로 보호
- 미인증 → `/login` 리다이렉트 (AUTH-04)
- better-auth 세션 쿠키 기반

### 미들웨어 vs layout 세션 체크
- **middleware.ts** 사용: 라우트 레벨 차단이 서버 렌더 전에 처리되어 깜빡임 없음
- layout.tsx에서 추가 세션 체크 불필요

---

## 2. 핵심 컴포넌트 설계

### 대시보드 (DASH-01~06)
- `GET /api/summary?year=&month=` → 수입합계/지출합계/잔액/카테고리별 집계
- 월 선택: URL 쿼리 파라미터 `?year=2026&month=3` 방식 (Server Component에서 searchParams 읽기)
- 최근 거래 5건: `/api/transactions?limit=5` 또는 summary API에 포함

**설계 결정:** summary API와 최근 거래를 분리 — summary는 집계 전용, 최근 거래는 transactions API 재활용.

### 거래 목록 (TRX-01~07)
- 필터: `year`, `month`, `categoryId`, `type` — URL 쿼리 파라미터
- 거래 생성/수정: Client Component 모달 또는 인라인 폼
- 금액 양수 강제: Zod `z.number().positive()` + DB real 타입

**설계 결정:** 거래 폼은 Client Component 모달. 목록 페이지는 Server Component + Client 필터 UI 조합.

### 카테고리 (CAT-01~06)
- 단순 CRUD. 별도 페이지 `/categories`
- 삭제 시 `categoryId → null` 처리: DB FK `onDelete: 'set null'` (이미 schema에 반영)
- 색상: `color` 필드, hex 코드 저장
- **CAT-06**: 회원가입 완료 후 `POST /api/auth/sign-up` 훅 또는 register API에서 기본 카테고리 4개 자동 생성 (급여/식비/교통/주거). better-auth의 `after` 훅 또는 register 페이지 클라이언트에서 회원가입 성공 후 별도 API 호출 방식 중 선택 → **register 성공 후 `/api/categories` POST 4회 호출** (훅 방식은 서버 사이드 복잡도 증가)

---

## 3. 데이터 흐름

```
사용자 액션 (Client)
  → API Route (인증 검증 + Zod 파싱)
    → Service (비즈니스 로직 + DB 쿼리)
      → DB (Drizzle ORM + SQLite)
```

서버 초기 렌더:
```
Server Component
  → 직접 Service 함수 호출 (API 경유 불필요)
    → DB 쿼리 결과 → JSX 렌더
```

---

## 4. 엣지케이스 / 에러 처리

| 케이스 | 처리 방식 |
|--------|---------|
| 타인 데이터 접근 | userId 소유권 검증 필수 (service 레이어) |
| 카테고리 삭제 시 거래 참조 | FK `onDelete: 'set null'` — 거래는 유지, categoryId만 null |
| 금액 음수 입력 | Zod `z.number().positive()` + 클라이언트 validation |
| 월 필터 없을 때 | 현재 월 기본값 (서버에서 new Date() 기준) |
| 존재하지 않는 리소스 | 404 반환, userId 불일치도 404 (정보 노출 방지) |
| 인증 토큰 만료 | better-auth 자동 처리, 만료 시 세션 삭제 |

---

## 5. Chunk 분해 계획

**총 4 Chunk** — 각 Chunk 완료 시 서버 기동 가능 상태 유지.

| Chunk | 내용 | 핵심 목표 |
|-------|------|---------|
| Chunk 1 | 인증 (회원가입/로그인/로그아웃) + 미들웨어 | 인증 흐름 완성 |
| Chunk 2 | 카테고리 API + 카테고리 관리 페이지 | 카테고리 CRUD 완성 |
| Chunk 3 | 거래 API + 거래 목록 페이지 | 거래 CRUD + 필터 완성 |
| Chunk 4 | 대시보드 (summary API + 월별 요약 UI) | 집계/통계 완성 |

---

## 6. 파일 구조 (생성 예정)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              → /dashboard redirect
│   │   ├── dashboard/page.tsx
│   │   ├── transactions/page.tsx
│   │   └── categories/page.tsx
│   ├── api/
│   │   ├── auth/[...all]/route.ts  (이미 생성)
│   │   ├── transactions/route.ts
│   │   ├── transactions/[id]/route.ts
│   │   ├── categories/route.ts
│   │   ├── categories/[id]/route.ts
│   │   └── summary/route.ts
│   ├── layout.tsx               (이미 생성)
│   ├── page.tsx                 (이미 생성 — /dashboard redirect)
│   └── globals.css              (이미 생성)
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── transactions/
│   │   ├── TransactionList.tsx
│   │   └── TransactionForm.tsx
│   ├── categories/
│   │   ├── CategoryList.tsx
│   │   └── CategoryForm.tsx
│   └── dashboard/
│       ├── SummaryCards.tsx
│       └── RecentTransactions.tsx
├── lib/
│   ├── auth.ts                  (이미 생성)
│   ├── auth-client.ts           (이미 생성)
│   ├── db/
│   │   ├── index.ts             (이미 생성)
│   │   └── schema.ts            (이미 생성)
│   └── services/
│       ├── transaction.service.ts
│       └── category.service.ts
└── middleware.ts
```
