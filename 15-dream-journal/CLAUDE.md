# AI Dream Journal - Claude 개발 가이드

> Anthropic 모범 사례에 따른 AI 기반 꿈 일기 애플리케이션 개발 가이드

---

## 🎯 Project: AI Dream Journal

AI를 활용한 꿈 일기 웹 애플리케이션. 사용자의 꿈을 기록하고, Claude AI가 해석, 상징 분석, 패턴 탐지, 주간 인사이트를 제공합니다.

### 핵심 목표
- 9개 피처 모두 동작
- AI 해석 정확도 높음
- 에러 핸들링 완벽
- 반응형 UI
- 예상 시간: 90분

---

## 🛠 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **shadcn/ui** - 재사용 가능한 UI 컴포넌트
- **Recharts** - 데이터 시각화

### Backend
- **Next.js API Routes** - RESTful API
- **Server Actions** - 서버 측 데이터 변경
- **Drizzle ORM** - 타입 안전 DB 쿼리

### Database
- **PostgreSQL** (Docker, localhost:5432)
- 4개 테이블: dreams, interpretations, symbols, patterns

### AI
- **AI SDK** (Vercel)
- **Open Router** - AI 프록시 서비스
- **Model**: `anthropic/claude-haiku-4.5` (빠르고 저렴)

---

## 🔧 명령어

### 개발
```bash
# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 빌드 테스트 (타입 에러 체크)
npm run build

# 프로덕션 빌드 실행
npm start
```

### 데이터베이스
```bash
# DB 마이그레이션 (개발 환경)
npx drizzle-kit push

# 마이그레이션 파일 생성 (프로덕션)
npx drizzle-kit generate

# Drizzle Studio 실행 (DB GUI)
npx drizzle-kit studio

# DB 스키마 검증
npx drizzle-kit check
```

### 의존성
```bash
# 패키지 설치
npm install

# 새 패키지 추가
npm install <package-name>

# shadcn/ui 컴포넌트 추가
npx shadcn@latest add <component-name>
```

---

## 🚀 개발 워크플로우

### ⚠️ CRITICAL: Phase-based Workflow

**PRD Section 6에 정의된 Phase를 반드시 순서대로 완료하세요.**

#### Phase 1: 프로젝트 셋업 (15분)
- [ ] Next.js 프로젝트 생성
- [ ] PostgreSQL 연결 (기존 컨테이너)
- [ ] Drizzle ORM 설정
- [ ] shadcn/ui 설치
- [ ] Recharts 설치
- [ ] AI SDK + Open Router 설정

#### Phase 2: DB & 기본 CRUD (20분)
- [ ] 4개 테이블 스키마 작성
- [ ] Dream Entry CRUD
- [ ] Tag System

#### Phase 3: AI 기능 (25분)
- [ ] AI SDK 연동
- [ ] 꿈 해석 API
- [ ] 상징 추출 API
- [ ] 패턴 탐지 API
- [ ] 주간 인사이트 API

#### Phase 4: UI 구현 (20분)
- [ ] 오늘 탭 (꿈 작성/보기)
- [ ] 캘린더 탭
- [ ] 통계 탭 (차트)
- [ ] 해석 탭 (AI)
- [ ] 패턴 탭 (AI)

#### Phase 5: 통합 & 테스트 (10분)
- [ ] 검색/필터
- [ ] 전체 통합
- [ ] E2E 테스트

### Phase 완료 체크리스트

**각 Phase마다 다음 단계를 거쳐야 합니다:**

1. ✅ **구현 완료** - 모든 기능 코드 작성
2. 🔨 **빌드 테스트** - `npm run build` 실행, 타입 에러 없음
3. ✨ **기능 테스트** - 브라우저에서 실제 동작 확인
4. 💾 **커밋** - `git commit -m "Phase X: [description]"`
5. 📝 **문서 업데이트** - `docs/IMPLEMENTATION.md` 진행 상황 기록
6. ➡️ **다음 Phase** - 모든 체크가 완료되면 다음으로 진행

### 예시
```bash
# Phase 1 완료 후
npm run build        # 에러 없음 확인
git add .
git commit -m "Phase 1: 프로젝트 셋업 완료"
# docs/IMPLEMENTATION.md 업데이트

# Phase 2 시작
```

---

## 🤖 AI 통합 규칙

### ⚠️ IMPORTANT: AI 설정

#### 환경 변수
```env
# .env.local에 반드시 설정
OPENROUTER_API_KEY=your_openrouter_api_key_here
DATABASE_URL=postgresql://budget:budget123@localhost:5432/dream_journal
```

#### 모델 설정
```typescript
// lib/ai.ts
import { createOpenAI } from '@ai-sdk/openai'

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

// MUST USE: Claude Haiku 4.5 (빠르고 저렴)
export const model = openrouter('anthropic/claude-haiku-4.5')
```

### 4가지 AI 기능 (PRD Section 2 참조)

#### 1. AI 꿈 해석 (interpretDream)
```typescript
// lib/ai-service.ts
import { generateObject } from 'ai'
import { z } from 'zod'

const interpretationSchema = z.object({
  interpretation: z.string(),
  psychological: z.string(),
  symbolic: z.string(),
  message: z.string(),
})

export async function interpretDream(content: string, emotion: string, vividness: number) {
  const result = await generateObject({
    model,
    schema: interpretationSchema,
    prompt: `당신은 꿈 해석 전문가이자 심리학자입니다.

다음 꿈을 분석해주세요:

내용: ${content}
감정: ${emotion}
생생함: ${vividness}/5

다음 관점에서 해석해주세요:
1. 전체적인 해석
2. 심리학적 관점 (프로이트, 융 등)
3. 상징적 의미
4. 이 꿈이 전하는 메시지`,
  })

  return result.object
}
```

#### 2. AI 상징 분석 (extractSymbols)
```typescript
const symbolSchema = z.object({
  symbols: z.array(z.object({
    symbol: z.string(),
    category: z.enum(['person', 'place', 'object', 'action', 'emotion']),
    meaning: z.string(),
  }))
})

export async function extractSymbols(content: string) {
  const result = await generateObject({
    model,
    schema: symbolSchema,
    prompt: `당신은 꿈 상징 분석 전문가입니다.

다음 꿈에서 의미 있는 상징들을 추출해주세요:

${content}

상징 추출 기준:
- 인물 (person): 사람, 동물
- 장소 (place): 위치, 환경
- 물건 (object): 사물
- 행동 (action): 주요 행위
- 감정 (emotion): 강한 감정

각 상징의 일반적 의미를 설명해주세요.`,
  })

  return result.object.symbols
}
```

#### 3. AI 패턴 발견 (detectPatterns)
```typescript
const patternSchema = z.object({
  patterns: z.array(z.object({
    type: z.enum(['theme', 'person', 'place', 'emotion']),
    name: z.string(),
    description: z.string(),
    occurrences: z.number(),
    significance: z.string(),
  }))
})

export async function detectPatterns(dreams: Dream[]) {
  const dreamsText = dreams.map(d =>
    `날짜: ${d.date}, 제목: ${d.title}, 내용: ${d.content}`
  ).join('\n\n')

  const result = await generateObject({
    model,
    schema: patternSchema,
    prompt: `당신은 꿈 패턴 분석 전문가입니다.

다음은 최근 꿈들의 목록입니다:

${dreamsText}

반복되는 패턴을 찾아주세요:
1. 테마 (주제)
2. 인물 (자주 나오는 사람/동물)
3. 장소 (반복되는 장소)
4. 감정 (일관된 감정)

각 패턴의 의미를 해석해주세요.`,
  })

  return result.object.patterns
}
```

#### 4. AI 주간 인사이트 (generateWeeklyInsight)
```typescript
const insightSchema = z.object({
  summary: z.string(),
  mainThemes: z.array(z.string()),
  emotionalFlow: z.string(),
  subconscious: z.string(),
  nextWeek: z.string(),
})

export async function generateWeeklyInsight(dreams: Dream[]) {
  const dreamsText = dreams.map(d =>
    `${d.date}: ${d.title} (${d.emotion})`
  ).join('\n')

  const result = await generateObject({
    model,
    schema: insightSchema,
    prompt: `당신은 꿈 분석 전문가입니다.

이번 주 꿈들을 분석해주세요:

${dreamsText}

다음 내용을 포함해서 분석:
1. 한 주 요약
2. 주요 테마 (3가지)
3. 감정 흐름 분석
4. 잠재의식이 전하는 메시지
5. 다음 주 관찰 포인트

친근하고 통찰력 있는 톤으로 작성해주세요.`,
  })

  return result.object
}
```

### 🛡️ YOU MUST: AI 에러 처리

#### 1. 재시도 로직 (3회)
```typescript
async function callAIWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error

      // Rate limit 에러면 더 긴 딜레이
      const waitTime = error.message.includes('rate limit')
        ? delay * 5
        : delay

      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  throw new Error('Max retries exceeded')
}
```

#### 2. 로딩 상태 표시
```typescript
// components/interpret-button.tsx
'use client'

export function InterpretButton({ dreamId }: { dreamId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleInterpret() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        body: JSON.stringify({ dreamId }),
      })

      if (!response.ok) {
        throw new Error('AI 해석 실패')
      }

      const data = await response.json()
      // 결과 표시
    } catch (error) {
      toast.error('AI 해석 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleInterpret} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          AI 해석 중...
        </>
      ) : (
        'AI 해석 받기'
      )}
    </Button>
  )
}
```

#### 3. AI 응답 검증
```typescript
// app/api/interpret/route.ts
export async function POST(req: Request) {
  try {
    const { dreamId, content, emotion, vividness } = await req.json()

    // AI 호출
    const interpretation = await interpretDream(content, emotion, vividness)

    // Zod 검증
    const validated = interpretationSchema.parse(interpretation)

    // DB 저장
    await db.insert(interpretations).values({
      dreamId,
      ...validated,
    })

    return Response.json({ success: true, data: validated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'AI 응답 형식이 올바르지 않습니다.' },
        { status: 500 }
      )
    }

    return Response.json(
      { error: 'AI 해석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
```

#### 4. DB 저장
```typescript
// 트랜잭션으로 원자성 보장
export async function saveInterpretationWithSymbols(
  dreamId: string,
  interpretation: Interpretation,
  symbols: Symbol[]
) {
  return await db.transaction(async (tx) => {
    // 1. 해석 저장
    await tx.insert(interpretations).values({
      dreamId,
      ...interpretation,
    })

    // 2. 상징 저장
    if (symbols.length > 0) {
      await tx.insert(symbolsTable).values(
        symbols.map(s => ({ dreamId, ...s }))
      )
    }

    return { success: true }
  })
}
```

---

## 📁 디렉토리 구조

```
dream-journal/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # 대시보드 레이아웃 그룹
│   │   ├── page.tsx             # 오늘 탭
│   │   ├── calendar/            # 캘린더 탭
│   │   ├── stats/               # 통계 탭
│   │   ├── interpret/           # 해석 탭
│   │   └── patterns/            # 패턴 탭
│   ├── api/                     # API Routes
│   │   ├── interpret/route.ts   # AI 꿈 해석
│   │   ├── symbols/route.ts     # AI 상징 추출
│   │   ├── patterns/route.ts    # AI 패턴 탐지
│   │   └── insights/route.ts    # AI 주간 인사이트
│   ├── actions/                 # Server Actions
│   │   └── dreams.ts            # 꿈 CRUD
│   ├── layout.tsx               # 루트 레이아웃
│   └── globals.css              # 글로벌 스타일
├── components/                   # React 컴포넌트
│   ├── ui/                      # shadcn/ui 컴포넌트
│   ├── dream-form.tsx           # 꿈 작성 폼
│   ├── dream-card.tsx           # 꿈 카드
│   ├── calendar-view.tsx        # 캘린더
│   └── stats-charts.tsx         # 통계 차트
├── db/                          # 데이터베이스
│   ├── schema.ts                # Drizzle 스키마
│   └── index.ts                 # DB 클라이언트
├── lib/                         # 유틸리티
│   ├── ai.ts                    # AI 설정
│   ├── ai-service.ts            # AI 함수 4개
│   ├── errors.ts                # 에러 클래스
│   ├── error-handler.ts         # 에러 핸들러
│   └── utils.ts                 # 헬퍼 함수
├── docs/                        # 문서
│   ├── PRD.md                   # 제품 요구사항
│   ├── ARCHITECTURE.md          # 아키텍처
│   ├── DATABASE.md              # DB 설계
│   └── IMPLEMENTATION.md        # 구현 로그
├── drizzle/                     # 마이그레이션 파일
├── .env.local                   # 환경 변수
├── drizzle.config.ts            # Drizzle 설정
├── tsconfig.json                # TypeScript 설정
└── CLAUDE.md                    # 이 파일
```

---

## 📐 코딩 규칙

### TypeScript

#### 1. Strict Mode 사용
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}
```

#### 2. Type vs Interface
```typescript
// ✅ Type 사용 (Union, Intersection에 유리)
type Dream = {
  id: string
  title: string
  content: string
}

type DreamWithInterpretation = Dream & {
  interpretation: Interpretation | null
}

// ❌ Interface 사용 지양 (확장성이 필요한 경우만)
```

#### 3. Zod로 타입 추론
```typescript
// db/schema.ts에서 타입 export
export type Dream = z.infer<typeof selectDreamSchema>
export type InsertDream = z.infer<typeof insertDreamSchema>

// 사용
import { Dream, InsertDream } from '@/db/schema'
```

### Next.js App Router

#### 1. Server Components 우선
```typescript
// ✅ 기본은 Server Component (빠르고 SEO 좋음)
export default async function DreamsPage() {
  const dreams = await db.query.dreams.findMany()
  return <DreamList dreams={dreams} />
}

// ❌ 불필요한 'use client'
'use client'
export default function DreamsPage() {
  // ...
}
```

#### 2. Client Components는 최소화
```typescript
// ✅ 상호작용이 필요한 경우만 'use client'
'use client'

import { useState } from 'react'

export function DreamForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  // ...
}
```

#### 3. Server Actions 활용
```typescript
// app/actions/dreams.ts
'use server'

export async function createDream(data: FormData) {
  const validated = dreamSchema.parse({
    title: data.get('title'),
    content: data.get('content'),
    // ...
  })

  const dream = await db.insert(dreams).values(validated).returning()

  revalidatePath('/') // 캐시 무효화
  return { success: true, data: dream[0] }
}
```

### 에러 처리

#### 1. 에러 클래스 계층 구조
```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string
  ) {
    super(message)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR')
  }
}

export class AIServiceError extends AppError {
  constructor(message: string) {
    super(503, message, 'AI_SERVICE_ERROR')
  }
}
```

#### 2. 사용자 친화적 메시지
```typescript
// ✅ 구체적인 메시지
throw new ValidationError('제목은 최소 1자 이상이어야 합니다')

// ❌ 모호한 메시지
throw new Error('Invalid input')
```

#### 3. 일관된 응답 형식
```typescript
// 성공
{ success: true, data: {...} }

// 실패
{ success: false, error: { code: 'VALIDATION_ERROR', message: '...' } }
```

### 스타일링

#### 1. Tailwind CSS 우선
```typescript
// ✅ Tailwind utility classes
<div className="flex flex-col gap-4 p-6">
  <h1 className="text-2xl font-bold">제목</h1>
</div>

// ❌ 인라인 스타일
<div style={{ display: 'flex', flexDirection: 'column' }}>
```

#### 2. shadcn/ui 컴포넌트 활용
```bash
# 버튼, 폼, 다이얼로그 등 설치
npx shadcn@latest add button form dialog card
```

---

## 🌐 API 엔드포인트

### 1. POST /api/interpret - AI 꿈 해석
```typescript
// 요청
{
  "dreamId": "uuid",
  "content": "꿈 내용",
  "emotion": "positive",
  "vividness": 5
}

// 응답
{
  "success": true,
  "data": {
    "interpretation": "전체 해석...",
    "psychological": "심리학적 관점...",
    "symbolic": "상징적 의미...",
    "message": "메시지..."
  }
}
```

### 2. POST /api/symbols - AI 상징 추출
```typescript
// 요청
{
  "dreamId": "uuid",
  "content": "꿈 내용"
}

// 응답
{
  "success": true,
  "data": [
    {
      "symbol": "물",
      "category": "place",
      "meaning": "무의식의 세계"
    }
  ]
}
```

### 3. POST /api/patterns - AI 패턴 탐지
```typescript
// 요청
{
  "dreams": [
    { "id": "uuid1", "content": "..." },
    { "id": "uuid2", "content": "..." }
  ]
}

// 응답
{
  "success": true,
  "data": [
    {
      "type": "theme",
      "name": "물 관련 꿈",
      "description": "...",
      "occurrences": 3,
      "significance": "..."
    }
  ]
}
```

### 4. GET /api/insights?week=2026-W03 - AI 주간 인사이트
```typescript
// 응답
{
  "success": true,
  "data": {
    "summary": "이번 주 요약...",
    "mainThemes": ["자유", "여행", "새로운 시작"],
    "emotionalFlow": "긍정적 감정이 70%...",
    "subconscious": "새로운 도전에 대한 준비...",
    "nextWeek": "대인 관계 관련 꿈..."
  }
}
```

---

## 🎨 AI 프롬프트 작성 가이드

### Anthropic 모범 사례

#### 1. 명확한 역할 부여
```typescript
// ✅ 좋은 예
const prompt = `당신은 20년 경력의 꿈 해석 전문가이자 심리학자입니다.
프로이트와 융의 이론을 기반으로 꿈을 분석합니다.`

// ❌ 나쁜 예
const prompt = `꿈을 해석해주세요.`
```

#### 2. 구조화된 출력 요청
```typescript
// ✅ 좋은 예 (Zod + generateObject)
const schema = z.object({
  interpretation: z.string(),
  psychological: z.string(),
  symbolic: z.string(),
  message: z.string(),
})

const result = await generateObject({ model, schema, prompt })

// ❌ 나쁜 예 (자유 형식 텍스트)
const result = await generateText({ model, prompt })
```

#### 3. 예시 제공 (Few-shot Learning)
```typescript
const prompt = `다음과 같은 형식으로 분석해주세요:

예시:
꿈: "하늘을 날았다"
해석: "자유와 해방을 갈망하는 마음..."

실제 꿈:
${content}`
```

#### 4. 간결한 프롬프트 (토큰 절약)
```typescript
// ✅ 좋은 예 (50 tokens)
const prompt = `꿈 해석 전문가. 다음 JSON 형식으로 응답: {...}`

// ❌ 나쁜 예 (500 tokens)
const prompt = `당신은 세계 최고의 꿈 해석 전문가이며, 수많은 논문을 발표했고...`
```

#### 5. 한국어 프롬프트 사용
```typescript
// ✅ 좋은 예 (Claude는 한국어 능통)
const prompt = `다음 꿈을 분석해주세요: ${content}`

// ⚠️ 영어 변환 불필요
// const prompt = `Please analyze this dream: ${content}`
```

---

## 🧪 테스트 전략

### 1. 타입 안정성
```bash
# 빌드로 타입 에러 체크
npm run build

# 성공 시: ✓ Compiled successfully
# 실패 시: Type error 메시지 표시
```

### 2. 수동 테스트 (PRD Section 8)

#### 꿈 기록
- [ ] 꿈 작성 (제목, 내용, 감정, 생생함)
- [ ] 꿈 수정
- [ ] 꿈 삭제
- [ ] 태그 부여/제거

#### AI 기능
- [ ] AI 꿈 해석 요청 → 결과 저장
- [ ] 상징 자동 추출
- [ ] 패턴 탐지
- [ ] 주간 인사이트 생성
- [ ] AI 에러 시 적절한 메시지

#### 뷰
- [ ] 캘린더에서 날짜 선택 → 꿈 표시
- [ ] 검색 동작
- [ ] 감정별 색상 구분

#### 통계
- [ ] 감정 분포 차트 정확
- [ ] 생생함 추이 차트 정확
- [ ] 태그 통계 정확

### 3. 브라우저 콘솔 확인
```typescript
// lib/logger.ts 활용
import { logger } from '@/lib/logger'

// AI 호출 로깅
logger.ai('interpretDream', duration)

// 에러 로깅
logger.error('Failed to save dream', error)
```

---

## 🛠 문제 해결 가이드

### 1. PostgreSQL 연결 실패
```bash
# 에러: "connection refused"

# 해결 1: Docker 컨테이너 확인
docker ps

# 해결 2: PostgreSQL 시작
docker start <container-name>

# 해결 3: .env.local 확인
DATABASE_URL=postgresql://budget:budget123@localhost:5432/dream_journal
```

### 2. AI API 에러
```typescript
// 에러: "OpenRouter API key not found"

// 해결 1: .env.local에 키 추가
OPENROUTER_API_KEY=sk-or-v1-...

// 해결 2: 서버 재시작
npm run dev

// 에러: "Rate limit exceeded"
// 해결: 1분 대기 후 재시도 (자동 재시도 로직 있음)
```

### 3. Drizzle 마이그레이션 실패
```bash
# 에러: "relation does not exist"

# 해결 1: 마이그레이션 재실행
npx drizzle-kit push

# 해결 2: DB 초기화 (개발 환경만)
# PostgreSQL에서 테이블 드롭 후 재생성
```

### 4. 빌드 에러
```bash
# 에러: "Type error: Property 'X' does not exist"

# 해결 1: 타입 확인
# db/schema.ts의 타입 정의와 사용처 일치 확인

# 해결 2: Zod 스키마 검증
# insertDreamSchema, selectDreamSchema 사용

# 에러: "Module not found"
# 해결: 패키지 재설치
npm install
```

### 5. AI 응답이 너무 느림
```typescript
// 원인 1: 프롬프트가 너무 김
// 해결: 프롬프트 간소화 (50-100 tokens)

// 원인 2: 네트워크 지연
// 해결: 타임아웃 설정 (30초)
const controller = new AbortController()
setTimeout(() => controller.abort(), 30000)

// 원인 3: 모델 문제
// 해결: Haiku 모델 사용 확인 (Sonnet/Opus는 느림)
```

---

## 📚 참고 문서

### 프로젝트 문서
- **PRD.md** - 제품 요구사항 정의서 (9개 기능, 구현 계획)
- **ARCHITECTURE.md** - 시스템 아키텍처 (에러 핸들링, 최적화)
- **DATABASE.md** - DB 설계 (4개 테이블, Drizzle 스키마)

### 외부 문서
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)
- [AI SDK](https://sdk.vercel.ai/)
- [Open Router](https://openrouter.ai/)
- [Claude API](https://docs.anthropic.com/)

### Anthropic Resources
- [Prompt Engineering Guide](https://docs.anthropic.com/en/docs/prompt-engineering)
- [Claude Best Practices](https://docs.anthropic.com/en/docs/build-with-claude/best-practices)

---

## ✅ 최종 체크리스트

프로젝트 완료 전 확인:

### 기능
- [ ] 9개 기능 모두 동작
- [ ] AI 해석 정확도 검증
- [ ] 차트 시각화 확인
- [ ] 검색/필터 동작

### 코드 품질
- [ ] `npm run build` 성공 (타입 에러 없음)
- [ ] 에러 핸들링 완벽 (AI, DB, 입력)
- [ ] 로딩 상태 표시
- [ ] 사용자 친화적 에러 메시지

### 문서
- [ ] `docs/IMPLEMENTATION.md` 업데이트
- [ ] 각 Phase 커밋 완료
- [ ] README.md 작성

### 환경
- [ ] `.env.local` 설정 확인
- [ ] PostgreSQL 연결 확인
- [ ] Open Router API 키 유효성 확인

---

## 🎯 성공 기준

- ✅ 9개 피처 모두 동작
- ✅ AI 해석 정확도 높음
- ✅ 상징/패턴 분석 의미 있음
- ✅ 차트 시각화 명확
- ✅ 반응형 UI
- ✅ 에러 핸들링 완벽
- ✅ 예상 시간: 90분

---

**Happy Coding with Claude! 🚀🌙**
