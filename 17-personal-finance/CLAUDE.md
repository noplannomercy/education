# CLAUDE.md - AI Personal Finance

## 프로젝트 개요

AI 기반 개인 재무 관리 앱. 거래 기록 관리, AI 지출 패턴 분석, 예산 관리, 저축 조언, 자동 카테고리 분류 기능 제공.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript (strict mode) |
| 데이터베이스 | PostgreSQL (로컬 + 개발) |
| ORM | Drizzle ORM |
| UI | shadcn/ui + Tailwind CSS |
| 차트 | Recharts |
| AI | AI SDK + OpenRouter |
| AI 모델 | `anthropic/claude-haiku-4.5` |
| 검증 | Zod |

---

## 환경 변수

```bash
# 로컬 개발
DATABASE_URL=postgresql://budget:budget123@localhost:5432/personal_finance

# 개발 서버
DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/personal_finance

# AI API
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

---

## 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 후 실행
npm run start

# 타입 체크
npx tsc --noEmit

# 린트
npm run lint

# DB 마이그레이션 (로컬)
npx drizzle-kit push:pg

# DB 마이그레이션 (개발)
DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/personal_finance npx drizzle-kit push:pg

# DB Studio
npx drizzle-kit studio
```

---

## Phase 기반 워크플로우

**CRITICAL: 각 Phase 완료 후 반드시 아래 순서를 따를 것**

```
Phase 완료 → npm run build → 테스트 통과 → git commit → 다음 Phase
```

### Phase 1: 프로젝트 셋업
- Next.js 프로젝트 생성
- PostgreSQL 연결
- Drizzle ORM 설정
- shadcn/ui 설치
- Recharts 설치
- AI SDK + OpenRouter 설정

### Phase 2: DB & 기본 CRUD
- 4개 테이블 스키마 (transactions, categories, budgets, ai_insights)
- Transaction CRUD
- Category CRUD
- Budget CRUD

### Phase 3: AI 기능
- AI SDK 연동
- 5개 AI 함수 구현
- JSON 검증
- 에러 핸들링

### Phase 4: UI 구현
- 5개 탭 (대시보드, 거래내역, 예산, 카테고리, 인사이트)
- Dialog/Sheet
- Charts (Dynamic Import)

### Phase 5: 통합 & 테스트
- 검색/필터
- 통계 집계
- E2E 테스트

**IMPORTANT: Phase 테스트를 절대 생략하지 말 것. 각 Phase 완료 후 `npm run build`가 성공해야만 다음 Phase로 진행.**

---

## AI 통합 규칙

### 5개 AI 함수

| 함수 | 용도 |
|------|------|
| `analyzeSpendingPattern` | 지출 패턴 분석 |
| `suggestBudget` | AI 예산 제안 |
| `categorizeTransaction` | 자동 카테고리 분류 |
| `detectAnomalies` | 이상 거래 감지 |
| `provideSavingsAdvice` | 저축 조언 |

### AI 프롬프트 규칙

**YOU MUST include this instruction in EVERY AI prompt:**

```
YOU MUST respond with ONLY valid JSON.
No markdown code blocks.
No preamble.
Just pure JSON.
```

### JSON 검증 (CRITICAL)

```typescript
// AI 응답 정제 함수 - ALWAYS 사용
export function parseAIResponse<T>(response: string, schema: z.ZodSchema<T>): T {
  // 1. 마크다운 코드 블록 제거
  let cleaned = response
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  // 2. JSON 추출
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('JSON not found')
  }

  // 3. 파싱 + Zod 검증
  return schema.parse(JSON.parse(jsonMatch[0]))
}
```

### AI 에러 처리

```typescript
// ALWAYS 재시도 로직 포함
async function callAI<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> {
  for (let i = 0; i < 3; i++) {
    try {
      const { text } = await generateText({ model, prompt })
      return parseAIResponse(text, schema)
    } catch (error) {
      if (i === 2) throw error
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
    }
  }
  throw new Error('AI call failed')
}
```

---

## 데이터베이스 규칙

### Server Actions 사용 (IMPORTANT)

```typescript
// ALWAYS 'use server' 지시어 사용
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createTransaction(data: TransactionFormData) {
  const result = await db.insert(transactions).values(data).returning()
  revalidatePath('/transactions')
  return result[0]
}
```

### 로컬/개발 DB 분리

```bash
# 로컬 마이그레이션
npm run db:push:local

# 개발 마이그레이션
npm run db:push:dev

# 양쪽 동시 (스크립트 사용)
./scripts/migrate-all.sh
```

### Drizzle 스키마 변경 시

```bash
# 1. schema.ts 수정
# 2. 마이그레이션 생성
npx drizzle-kit generate:pg

# 3. 로컬 적용
npx drizzle-kit push:pg

# 4. 개발 적용
DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/personal_finance npx drizzle-kit push:pg
```

---

## 테스트 요구사항

### Phase별 빌드 테스트 (NEVER 생략)

```bash
# 모든 Phase 완료 후 실행
npm run build

# 빌드 실패 시 → 에러 수정 → 다시 빌드
# 빌드 성공 시 → 커밋 → 다음 Phase
```

### AI JSON 파싱 테스트

```typescript
// AI 응답 검증 테스트
const testResponse = `
여기 분석 결과입니다:
\`\`\`json
{"summary": "테스트", "topSpending": []}
\`\`\`
`
const result = parseAIResponse(testResponse, spendingAnalysisSchema)
expect(result.summary).toBe("테스트")
```

### 차트 렌더링 테스트

```typescript
// Dynamic import 확인
// 브라우저에서 차트가 정상 렌더링되는지 수동 확인
// SSR 에러 없는지 확인 (window is not defined)
```

---

## 중요 규칙

### 코드 스타일

**IMPORTANT: 모든 파일은 60줄 이하로 유지**

```typescript
// ❌ 60줄 초과 파일
// 파일을 분리하거나 로직을 추출할 것

// ✅ 60줄 이하
// 단일 책임 원칙 준수
```

### Phase 테스트 (CRITICAL)

**NEVER skip Phase testing. YOU MUST run `npm run build` after completing each Phase.**

```bash
# Phase 완료 체크리스트
# [ ] 코드 작성 완료
# [ ] npm run build 성공
# [ ] 기능 수동 테스트
# [ ] git commit
# [ ] 다음 Phase 시작
```

### Recharts Dynamic Import (CRITICAL)

**ALWAYS use dynamic import for Recharts components:**

```typescript
// ❌ NEVER do this - SSR 에러 발생
import { PieChart, Pie, Cell } from 'recharts'

// ✅ ALWAYS do this
import dynamic from 'next/dynamic'

const PieChart = dynamic(
  () => import('recharts').then(mod => mod.PieChart),
  { ssr: false }
)

// 또는 전체 차트 컴포넌트를 dynamic import
const CategoryPieChart = dynamic(
  () => import('@/components/charts/category-pie-chart'),
  { ssr: false, loading: () => <div>로딩...</div> }
)
```

### Hydration 에러 방지

```typescript
// ❌ 서버/클라이언트 불일치
<p>{new Date().toLocaleString()}</p>

// ✅ useEffect로 클라이언트 전용 처리
const [time, setTime] = useState('')
useEffect(() => setTime(new Date().toLocaleString()), [])
```

### 환경 변수 접근

```typescript
// ❌ 클라이언트에서 서버 전용 변수 접근
const key = process.env.OPENROUTER_API_KEY // undefined

// ✅ Server Action/Component에서만 접근
'use server'
const key = process.env.OPENROUTER_API_KEY // OK
```

---

## 파일 구조

```
app/
├── actions/           # Server Actions
├── (routes)/          # 페이지 라우트
└── layout.tsx

components/
├── ui/                # shadcn/ui
├── transactions/
├── categories/
├── budget/
├── insights/
├── charts/            # ALWAYS dynamic import
└── shared/

lib/
├── db/                # Drizzle 설정
├── ai/                # AI 클라이언트
├── validations/       # Zod 스키마
└── utils/
```

---

## 커밋 컨벤션

```bash
# Phase별 커밋
git commit -m "Phase 1 complete: Project setup"
git commit -m "Phase 2 complete: Database schema and CRUD"
git commit -m "Phase 3 complete: AI features implementation"
git commit -m "Phase 4 complete: UI implementation"
git commit -m "Phase 5 complete: Integration and testing"

# 기능별 커밋
git commit -m "feat: Add transaction CRUD"
git commit -m "feat: Implement AI spending analysis"
git commit -m "fix: JSON parsing for AI responses"
```

---

## 참고 문서

- `docs/PRD.md` - 제품 요구사항
- `docs/ARCHITECTURE.md` - 시스템 아키텍처
- `docs/DATABASE.md` - 데이터베이스 스키마
- `docs/DEPLOYMENT.md` - 배포 가이드
