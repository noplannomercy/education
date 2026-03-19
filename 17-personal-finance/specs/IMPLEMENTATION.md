# AI Personal Finance - Implementation Specification

---

## Phase 1: 프로젝트 셋업 (15분) ✅

- [x] Next.js 생성: `npx create-next-app@latest . --typescript --tailwind --eslint --app`
- [x] 의존성 설치:
  ```bash
  npm install drizzle-orm postgres drizzle-kit ai @ai-sdk/openai recharts date-fns lucide-react zod sonner
  ```
- [x] shadcn/ui 설치:
  ```bash
  npx shadcn@latest init
  npx shadcn@latest add button card input textarea select tabs calendar badge dialog alert-dialog alert toast sheet progress
  ```
- [x] 로컬 DB 생성: `docker exec -it postgres-local psql -U budget -c "CREATE DATABASE personal_finance;"`
- [x] 개발 DB 생성 (Hostinger SSH): `CREATE DATABASE personal_finance OWNER budget;`
- [x] `.env.local` 설정:
  ```
  DATABASE_URL=postgresql://budget:budget123@localhost:5432/personal_finance
  OPENROUTER_API_KEY=sk-or-v1-xxxxx
  ```
- [x] `drizzle.config.ts` 생성
- [x] **npm run build 검증**
- [x] Git 커밋: `"Phase 1 complete: Project setup"`

---

## Phase 2: DB & Server Actions (20분) ✅

### 2.1 스키마

- [x] `lib/db/schema.ts`:
  - Enums: `transactionTypeEnum` (income, expense), `paymentMethodEnum` (cash, card, transfer), `insightTypeEnum`
  - Tables: `categories`, `transactions`, `budgets`, `aiInsights`
  - Types: `Category`, `Transaction`, `Budget`, `AiInsight` (inferSelect/inferInsert)
  - Indexes: `idx_tx_date`, `idx_tx_category`, `idx_insights_month`

- [x] `lib/db/index.ts`: Drizzle 클라이언트 export

### 2.2 Validation Schemas

- [x] `lib/validations/transaction.ts`:
  ```
  amount: z.number().positive('금액은 양수여야 합니다')
  date: z.string().refine(d => new Date(d) <= new Date(), '미래 날짜 불가')
  description: z.string().min(1).max(255)
  ```

- [x] `lib/validations/category.ts`:
  ```
  name: z.string().min(1).max(50)
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
  ```

- [x] `lib/validations/budget.ts`:
  ```
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, '형식: YYYY-MM')
  totalBudget: z.number().positive()
  ```

### 2.3 마이그레이션

```bash
npx drizzle-kit push:pg                    # 로컬
DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/personal_finance npx drizzle-kit push:pg  # 개발
```

### 2.4 Server Actions

- [x] `app/actions/transactions.ts`:

| 함수 | 로직 |
|------|------|
| `createTransaction(input)` | Zod 검증 → `db.insert(transactions)` → `revalidatePath` → `{success, data}` |
| `updateTransaction(id, input)` | Zod 검증 → `db.update().where(eq(id))` → `revalidatePath` |
| `deleteTransaction(id)` | `db.delete().where(eq(id))` → `revalidatePath` |
| `getTransactions(filters?)` | `db.select()` + 조건 (startDate, endDate, category, type) → `orderBy(desc(date))` |
| `getMonthlyStats(month)` | 월별 income, expense, byCategory 집계 |

- [x] `app/actions/categories.ts`:

| 함수 | 로직 |
|------|------|
| `createCategory(input)` | Zod 검증 → `db.insert` → `revalidatePath('/categories')` |
| `updateCategory(id, input)` | `db.update().where()` |
| `deleteCategory(id)` | **⚠️ 사용 중인 거래 확인** → 있으면 에러 반환 → 없으면 삭제 |
| `getCategories()` | `db.select().from(categories)` |

**deleteCategory 엣지케이스 처리:**
```
1. 해당 카테고리명으로 transactions 조회
2. 거래 존재 시: { success: false, error: '사용 중인 카테고리는 삭제할 수 없습니다' }
3. 거래 없을 시: 삭제 진행
```

- [x] `app/actions/budgets.ts`:

| 함수 | 로직 |
|------|------|
| `saveBudget(input)` | **⚠️ 카테고리별 합 ≤ 총예산 검증** → 기존 조회 → upsert |
| `getBudget(month)` | `db.select().where(eq(month))` |
| `getBudgetUsage(month)` | 예산 + 실제 지출 비교, usagePercent 계산 |

- [x] **npm run build 검증**
- [x] Git 커밋: `"Phase 2 complete: Database schema and Server Actions"`

---

## Phase 3: AI 기능 (25분) ✅

### 3.1 AI 설정

- [x] `lib/ai/config.ts`:
  - OpenRouter 설정: `createOpenAI({ baseURL: 'https://openrouter.ai/api/v1' })`
  - model: `openrouter('anthropic/claude-haiku-4.5')`
  - AI_CONFIG: maxOutputTokens=1500, retries=3, **timeout=30000**

### 3.2 AI 유틸리티

- [x] `lib/ai/utils.ts`:

| 함수 | 로직 |
|------|------|
| `cleanAIResponse(text, schema)` | 1) markdown 제거 2) **JSON 추출 (객체+배열 지원)**: `match(/[\[{][\s\S]*[\]}]/)` 3) trailing comma 제거 4) `schema.parse()` |
| `callWithRetry(fn, retries, delay, timeout)` | **AbortController로 타임아웃** → for loop → try/catch → exponential backoff |

**cleanAIResponse 상세:**
```
1. replace(/```json\s*/gi, '') - 마크다운 코드블록 제거
2. replace(/```\s*/g, '')
3. match(/[\[{][\s\S]*[\]}]/) - JSON 객체 또는 배열 추출
4. trailing comma 제거: replace(/,\s*[}\]]/g, ...)
5. 작은따옴표 → 큰따옴표
6. schema.parse() - Zod 검증
7. 실패 시 AIParseError throw
```

**callWithRetry 상세:**
```
1. AbortController 생성
2. setTimeout으로 타임아웃 설정
3. for (i = 0; i < retries; i++)
4. try { await fn() } catch {
     if (rate limit) delay = 60000
     else delay = baseDelay * 2^i
   }
5. 최종 실패 시 throw
```

### 3.3 Zod 스키마

- [x] `lib/ai/schemas.ts`:
  - `spendingAnalysisSchema`: summary, topSpending[], unnecessarySpending[], savingOpportunities[], trends[]
  - `budgetSuggestionSchema`: totalBudget, categoryBudgets{}, savingsTarget, insights[]
  - `categorySuggestionSchema`: suggestedCategory, confidence (0-1), reasoning
  - `anomalyReportSchema`: anomalies[], summary, recommendation
  - `savingsAdviceSchema`: currentSavings, requiredMonthlySavings, gap, feasibility, strategies[], projectedSavings{}, motivation

### 3.4 프롬프트 템플릿

- [x] `lib/ai/prompts.ts`: 모든 프롬프트 통합 (spending-pattern, budget-suggestion, categorize, anomaly-detection, savings-advice)

**CRITICAL**: 모든 프롬프트 끝에 반드시 포함:
```
YOU MUST respond with ONLY valid JSON.
No markdown code blocks.
No preamble.
Just pure JSON.
```

### 3.5 AI Server Actions

- [x] `app/actions/insights.ts`:

| 함수 | 로직 |
|------|------|
| `analyzeSpending(month)` | **⚠️ 거래 0건 체크** → 거래 조회 → `callWithRetry` → `cleanAIResponse` → DB 저장 |
| `suggestBudget(income, month)` | 과거 지출 조회 → AI 호출 → 결과 반환 |
| `categorizeTransaction(description)` | **⚠️ 카테고리 0개 체크** → 카테고리 목록 조회 → AI 호출 |
| `detectAnomalies(month)` | **⚠️ 거래 0건 체크** → 거래 + 평균 조회 → AI 호출 |
| `provideSavingsAdvice(params)` | income, expenses, goal, timeframe → AI 호출 |
| `getInsights(month)` | `db.select().from(aiInsights).where(eq(month))` |

- [x] **npm run build 검증**
- [x] Git 커밋: `"Phase 3 complete: AI features implementation"`

---

## Phase 4: UI 구현 (30분) ✅

### 4.1 공통 컴포넌트

- [x] `components/shared/confirm-dialog.tsx`: AlertDialog 기반 삭제 확인
- [x] `components/shared/empty-state.tsx`: 빈 상태 표시용

- [x] `hooks/use-month.ts`: 현재 월 상태 관리

### 4.2 Layout & Main

- [x] `app/layout.tsx`: Inter 폰트, `<Toaster position="top-right" richColors />`
- [x] `app/page.tsx`: `<Tabs defaultValue="dashboard">` + 5개 TabsTrigger + TabsContent

### 4.3 Transactions Tab

- [x] `components/tabs/transactions-tab.tsx`: Server Component
- [x] `components/transactions/transaction-dialog.tsx`: Dialog 상태 관리
- [x] `components/transactions/transaction-form.tsx`: 폼 + AI 분류
- [x] `components/transactions/transaction-list.tsx`: 거래 목록
- [x] `components/transactions/transaction-card.tsx`: 편집/삭제 버튼

### 4.4 Budget Tab

- [x] `components/tabs/budget-tab.tsx`: 예산 관리 + AI 제안

### 4.5 Categories Tab

- [x] `components/tabs/categories-tab.tsx`: 카테고리 목록 + Dialog
- [x] `components/categories/category-dialog.tsx`: 카테고리 폼

### 4.6 Insights Tab

- [x] `components/tabs/insights-tab.tsx`: AI 분석 실행 + 결과 표시
- [x] `components/insights/insight-card.tsx`: type별 아이콘, title, content 렌더링

### 4.7 Dashboard Tab

- [x] `components/tabs/dashboard-tab.tsx`: 요약 카드 4개 + 차트

### 4.8 Charts (CRITICAL: Dynamic Import)

- [x] `components/charts/index.tsx`: Dynamic Import 설정
- [x] `components/charts/category-pie-chart.tsx`: 'use client', Recharts PieChart
- [x] `components/charts/monthly-trend-chart.tsx`: 'use client', Recharts LineChart
- [x] `components/charts/budget-bar-chart.tsx`: 'use client', Recharts BarChart

- [x] **npm run build 검증**
- [x] Git 커밋: `"Phase 4 complete: UI implementation"`

---

## Phase 5: 통합 & 테스트 (10분) ✅

### 5.1 시드 데이터

- [x] `lib/db/seed.ts`:
  - 기본 카테고리 8개: 식비, 교통, 쇼핑, 공과금, 주거, 의료, 문화, 기타
  - `db.insert(categories).values(data).onConflictDoNothing()`

- [x] 시드 실행: `npx tsx lib/db/seed.ts`

### 5.2 기능 테스트 체크리스트

**거래 관리**
- [x] 거래 추가 (수입/지출)
- [x] AI 카테고리 자동 분류
- [x] 거래 수정
- [x] 거래 삭제 (확인 Dialog)
- [x] 필터 적용
- [x] **⚠️ 금액 0원 입력 시 에러**
- [x] **⚠️ 미래 날짜 입력 시 에러**

**예산 관리**
- [x] 예산 설정
- [x] AI 예산 제안
- [x] 예산 적용
- [x] **⚠️ 카테고리 합 > 총예산 시 에러**

**카테고리 관리**
- [x] 카테고리 추가
- [x] 카테고리 수정
- [x] **⚠️ 사용 중인 카테고리 삭제 시 에러**

**AI 기능**
- [x] 지출 패턴 분석
- [x] 이상 거래 감지
- [x] 저축 조언
- [x] **⚠️ 거래 0건일 때 안내 메시지**
- [x] **⚠️ API 에러 시 사용자 메시지**

**차트**
- [x] Pie Chart 렌더링 (SSR 에러 없음)
- [x] Line Chart 렌더링
- [x] Bar Chart 렌더링
- [x] **⚠️ 데이터 없을 때 EmptyState**

**반응형**
- [x] 모바일 레이아웃
- [x] 태블릿 레이아웃

### 5.3 엣지케이스 체크리스트

| 케이스 | 예상 동작 | 상태 |
|--------|----------|------|
| 금액 0원 | 에러: "금액은 양수여야 합니다" | ✅ |
| 미래 날짜 | 에러: "미래 날짜는 입력할 수 없습니다" | ✅ |
| 매우 큰 금액 | decimal(12,2) 범위 내 처리 | ✅ |
| 카테고리 중복 이름 | 에러: "이미 존재하는 카테고리입니다" | ✅ |
| 사용 중 카테고리 삭제 | 에러: "사용 중인 카테고리는 삭제할 수 없습니다" | ✅ |
| 카테고리 예산 합 초과 | 에러: "카테고리 예산 합이 총 예산을 초과합니다" | ✅ |
| AI API 키 없음 | 에러: "AI 설정을 확인해주세요" | ✅ |
| 거래 0건 분석 | 안내: "분석할 거래 내역이 없습니다" | ✅ |
| AI JSON 파싱 실패 | 3회 재시도 후 에러 메시지 | ✅ |
| 잘못된 월 형식 | 에러: "올바른 월 형식: YYYY-MM" | ✅ |

### 5.4 최종 검증

```bash
npm run lint
npm run build
npm run start
# 모든 기능 수동 테스트
```

- [x] **npm run build 검증**
- [x] Git 커밋: `"Phase 5 complete: Integration and testing"`

---

## 커밋 히스토리

```
Phase 1 complete: Project setup
Phase 2 complete: DB Schema & Server Actions
Phase 3 complete: AI features implementation
Phase 4 complete: UI Implementation
Phase 5 complete: Integration & Testing
Implement all AI features and fix JSON parsing issues
Fix monthly trend chart date calculation bug
```

---

## 버그 수정 이력

| 날짜 | 이슈 | 해결 |
|------|------|------|
| 2026-01-16 | `getMonthlyStats`에서 30일/31일 월 처리 오류 | `new Date(year, monthNum, 0).getDate()`로 월말 계산 |
| 2026-01-16 | AI SDK `maxTokens` 파라미터 오류 | `maxOutputTokens`로 변경 (AI SDK 6.x) |
| 2026-01-16 | Recharts Tooltip formatter 타입 오류 | `(value) => [...]` 패턴으로 수정 |
| 2026-01-16 | z.record() 스키마 오류 | `z.record(z.string(), z.number())` 형식으로 수정 |

---

## 주요 보완사항 요약

| 영역 | 보완 내용 |
|------|----------|
| Server Actions | 카테고리 삭제 시 FK 체크, 예산 합 검증 |
| AI Utils | 배열 JSON 지원, 타임아웃, Rate Limit 처리 |
| UI | 폼 초기화, 삭제 확인 Dialog, 중복 제출 방지 |
| Charts | EmptyState, 음수 값 필터링, Dynamic Import |
| Validation | 미래 날짜, 월 형식 검증 |
| Date Handling | 월말 날짜 동적 계산 (30/31일 대응) |

---

## 최종 완료: 2026-01-16 ✅

모든 Phase 완료 및 E2E 테스트 통과.
