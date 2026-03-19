# AI Journal - PRD

## 1. Project Overview

### 1.1 Purpose
AI 기반 일기 앱. 일기 작성, 감정 분석, AI 요약, 주간 인사이트 제공.

### 1.2 Tech Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Database: PostgreSQL + Drizzle ORM
- UI: shadcn/ui + Tailwind CSS
- AI: AI SDK + Open Router
- Container: Docker (PostgreSQL - 기존 사용)

### 1.3 Target Users
- 일기 쓰는 습관 기르려는 사람
- 감정 패턴 파악하고 싶은 사람
- AI 도움으로 자기 성찰하려는 사람

---

## 2. Features (10개)

### Feature 1: Journal Entry CRUD
일기 등록/수정/삭제
- 제목, 내용
- 날짜 (기본: 오늘)
- 태그 (선택)

### Feature 2: Date View
날짜별 일기 보기
- 캘린더에서 날짜 선택
- 해당 날짜 일기 표시
- 일기 없는 날 표시

### Feature 3: Tag System
태그 관리
- 태그 생성/삭제
- 일기에 태그 부여
- 태그별 필터링

### Feature 4: AI Emotion Analysis ⭐
AI 감정 분석
- 일기 내용 기반 감정 파악
- 감정: 행복, 슬픔, 분노, 불안, 평온, 기대, 감사 등
- 감정 점수 (1-10)
- 분석 결과 저장

### Feature 5: AI Journal Summary ⭐
AI 일기 요약
- 긴 일기 → 핵심 요약
- 주요 키워드 추출
- 요약 결과 저장

### Feature 6: AI Weekly Insight ⭐
AI 주간 인사이트
- 이번 주 일기 전체 분석
- 감정 패턴 파악
- 개선 제안
- 긍정적인 점 강조

### Feature 7: Search
일기 검색
- 제목/내용 전문 검색
- 날짜 범위 필터
- 태그 필터

### Feature 8: Statistics Dashboard
통계 대시보드
- 월별 작성 일수
- 감정 분포 (Pie Chart)
- 감정 추이 (Line Chart)
- 자주 쓴 태그

### Feature 9: Prompt Templates
AI 프롬프트 템플릿
- 감정 분석 프롬프트
- 요약 프롬프트
- 인사이트 프롬프트
- (시스템에서 관리, 사용자 수정 X)

### Feature 10: Export
내보내기
- 일기 Markdown 내보내기
- 기간 선택

---

## 3. Data Structure

### 3.1 JournalEntry (일기)
```typescript
interface JournalEntry {
  id: string
  title: string
  content: string
  date: Date
  emotionAnalysis: EmotionAnalysis | null
  summary: string | null
  createdAt: Date
  updatedAt: Date
}
```

### 3.2 EmotionAnalysis (감정 분석)
```typescript
interface EmotionAnalysis {
  primaryEmotion: string    // 주요 감정
  emotionScore: number      // 1-10
  emotions: {               // 감정별 점수
    happiness: number
    sadness: number
    anger: number
    anxiety: number
    calm: number
    gratitude: number
  }
  keywords: string[]        // 핵심 키워드
  analyzedAt: Date
}
```

### 3.3 Tag (태그)
```typescript
interface Tag {
  id: string
  name: string
  color: string
}
```

### 3.4 JournalTag (일기-태그 연결)
```typescript
interface JournalTag {
  journalId: string
  tagId: string
}
```

### 3.5 WeeklyInsight (주간 인사이트)
```typescript
interface WeeklyInsight {
  id: string
  weekStart: Date           // 주 시작일
  weekEnd: Date             // 주 종료일
  insight: string           // AI 분석 결과
  emotionSummary: object    // 감정 요약
  createdAt: Date
}
```

---

## 4. Database Schema (Drizzle)

```typescript
// journal_entries 테이블
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  date: date('date').notNull(),
  summary: text('summary'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// emotion_analyses 테이블
export const emotionAnalyses = pgTable('emotion_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  journalId: uuid('journal_id').references(() => journalEntries.id, { onDelete: 'cascade' }).notNull().unique(),
  primaryEmotion: varchar('primary_emotion', { length: 50 }).notNull(),
  emotionScore: integer('emotion_score').notNull(),
  emotions: jsonb('emotions').notNull(),  // { happiness: 7, sadness: 2, ... }
  keywords: jsonb('keywords').notNull(),  // ["성취", "감사", ...]
  analyzedAt: timestamp('analyzed_at').defaultNow(),
})

// tags 테이블
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 7 }).notNull().default('#3B82F6'),
})

// journal_tags 연결 테이블
export const journalTags = pgTable('journal_tags', {
  journalId: uuid('journal_id').references(() => journalEntries.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.journalId, t.tagId] }),
}))

// weekly_insights 테이블
export const weeklyInsights = pgTable('weekly_insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  weekStart: date('week_start').notNull(),
  weekEnd: date('week_end').notNull(),
  insight: text('insight').notNull(),
  emotionSummary: jsonb('emotion_summary').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  uniqueWeek: unique().on(t.weekStart, t.weekEnd),
}))

// Indexes
// CREATE INDEX idx_journal_entries_date ON journal_entries(date DESC);
// CREATE INDEX idx_emotion_analyses_journal ON emotion_analyses(journal_id);
// CREATE INDEX idx_journal_tags_journal ON journal_tags(journal_id);
// CREATE INDEX idx_journal_tags_tag ON journal_tags(tag_id);
```

---

## 5. AI Integration

### 5.1 Tech Stack
- AI SDK: `ai` (Vercel)
- Provider: `@openrouter/ai-sdk-provider`
- Model: `anthropic/claude-sonnet-4-20250514` (via Open Router)

### 5.2 Environment Variables
```
OPENROUTER_API_KEY=sk-or-...
```

### 5.3 AI Functions

#### analyzeEmotion(content: string)
```
Input: 일기 내용
Output: {
  primaryEmotion: "감사",
  emotionScore: 8,
  emotions: { happiness: 8, gratitude: 9, calm: 7, ... },
  keywords: ["성취감", "감사", "평화"]
}
```

#### summarizeJournal(content: string)
```
Input: 일기 내용
Output: "오늘은 프로젝트 완료에 대한 성취감과 동료들에 대한 감사함이 담긴 하루였다."
```

#### generateWeeklyInsight(journals: JournalEntry[])
```
Input: 이번 주 일기 목록
Output: "이번 주는 전반적으로 긍정적인 감정이 우세했습니다. 특히 수요일의 프로젝트 완료 후 성취감이 높았고..."
```

### 5.4 AI Prompt Templates

#### Emotion Analysis Prompt
```
당신은 감정 분석 전문가입니다.

다음 일기를 읽고 감정을 분석해주세요:

[일기 내용]
{content}

다음 JSON 형식으로 응답해주세요:
{
  "primaryEmotion": "주요 감정 (한글)",
  "emotionScore": 1-10 점수,
  "emotions": {
    "happiness": 0-10,
    "sadness": 0-10,
    "anger": 0-10,
    "anxiety": 0-10,
    "calm": 0-10,
    "gratitude": 0-10
  },
  "keywords": ["키워드1", "키워드2", "키워드3"]
}
```

#### Summary Prompt
```
당신은 요약 전문가입니다.

다음 일기를 2-3문장으로 핵심만 요약해주세요:

[일기 내용]
{content}

요약:
```

#### Weekly Insight Prompt
```
당신은 심리 상담 전문가입니다.

다음은 한 주간의 일기입니다. 전체적인 감정 패턴과 인사이트를 제공해주세요.

[일기 목록]
{journals}

다음을 포함해서 분석해주세요:
1. 이번 주 전반적인 감정 상태
2. 감정 변화 패턴
3. 긍정적인 점
4. 개선할 점 (부드럽게)
5. 다음 주를 위한 제안
```

---

## 6. UI Layout

### 6.1 Main Layout
```
┌─────────────────────────────────────────────────────────┐
│  📔 AI Journal                    [+ 새 일기] [검색]    │
├─────────────────────────────────────────────────────────┤
│  Tabs: [오늘] [캘린더] [통계] [인사이트]                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                  Tab Content Area                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Today Tab (일기 작성/보기)
```
┌─────────────────────────────────────────────────────────┐
│  📅 2025년 1월 13일 월요일                              │
├─────────────────────────────────────────────────────────┤
│  제목: [오늘 하루를 정리하며                    ]       │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 오늘은 정말 뜻깊은 하루였다.                        ││
│  │ 아침에 일찍 일어나서 운동을 하고...                 ││
│  │                                                     ││
│  │                                                     ││
│  │                                                     ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  태그: [#일상] [#감사] [+ 태그 추가]                    │
│                                                         │
│  [저장] [🤖 AI 분석하기]                               │
├─────────────────────────────────────────────────────────┤
│  AI 분석 결과                                           │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 😊 주요 감정: 감사 (8/10)                          ││
│  │ 키워드: #성취감 #감사 #평화                        ││
│  │                                                     ││
│  │ 요약: 오늘은 운동과 업무 완료로 성취감을 느낀      ││
│  │ 하루였으며, 전반적으로 평화롭고 감사한 감정이...   ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 6.3 Calendar Tab
```
┌─────────────────────────────────────────────────────────┐
│  [< 이전] 2025년 1월 [다음 >]                           │
├─────────────────────────────────────────────────────────┤
│     일  월  화  수  목  금  토                          │
│     ░░  📔  📔  📔  ░░  📔  ░░   ← 일기 있는 날        │
│     📔  📔  ░░  📔  📔  📔  📔                          │
│     📔  ░░  📔  ★   ░░  ░░  ░░   ← ★ = 오늘           │
│     ...                                                 │
├─────────────────────────────────────────────────────────┤
│  선택한 날짜: 1월 13일                                  │
│  제목: 오늘 하루를 정리하며                             │
│  감정: 😊 감사 (8/10)                                  │
│  [일기 보기]                                            │
└─────────────────────────────────────────────────────────┘
```

### 6.4 Statistics Tab
```
┌─────────────────────────────────────────────────────────┐
│  Stats Cards (4개)                                       │
│  [이번 달: 15일] [연속: 7일] [평균 감정: 7.2] [총: 45]  │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌───────────────────────────┐ │
│  │ 감정 분포           │  │ 감정 추이 (월간)         │ │
│  │ (Pie Chart)         │  │ (Line Chart)             │ │
│  │ 감사: 30%           │  │                          │ │
│  │ 행복: 25%           │  │     ___/\___/\           │ │
│  │ 평온: 20%           │  │ ___/        \___        │ │
│  └─────────────────────┘  └───────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  자주 사용한 태그                                        │
│  [#일상 (12)] [#감사 (8)] [#성찰 (5)] [#운동 (3)]       │
└─────────────────────────────────────────────────────────┘
```

### 6.5 Insight Tab
```
┌─────────────────────────────────────────────────────────┐
│  📊 주간 인사이트                    [🤖 새로 분석하기] │
├─────────────────────────────────────────────────────────┤
│  1월 2주차 (1/6 - 1/12)                                 │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 🌟 이번 주 요약                                    ││
│  │                                                     ││
│  │ 이번 주는 전반적으로 긍정적인 감정이 우세했습니다. ││
│  │ 특히 수요일의 프로젝트 완료 후 성취감이 높았고,    ││
│  │ 주말에는 가족과의 시간으로 감사함을 느꼈습니다.    ││
│  │                                                     ││
│  │ 💡 인사이트                                        ││
│  │ - 업무 성취가 감정에 긍정적 영향                   ││
│  │ - 주중 스트레스 → 주말 회복 패턴                   ││
│  │                                                     ││
│  │ 🎯 다음 주 제안                                    ││
│  │ - 평일에도 짧은 휴식 시간 확보하기                 ││
│  │ - 작은 성취도 기록해보기                           ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 7. Implementation Phases

### Phase 1: Project Setup & Database (10분)
- Next.js 프로젝트 설정
- Drizzle ORM 설정
- 5개 테이블 스키마 생성
- PostgreSQL 연결 (기존 DB)
- Migration 실행
- npm run build 검증

### Phase 2: AI SDK Setup (10분)
- AI SDK + Open Router 설치
- 환경변수 설정
- AI 유틸 함수 생성 (lib/ai/)
- 프롬프트 템플릿 정의
- npm run build 검증

### Phase 3: Journal CRUD & Tag (20분)
- Feature 1: Journal Entry CRUD
- Feature 3: Tag System
- 기본 일기 작성/보기 UI
- npm run build 검증

### Phase 4: AI Features (25분)
- Feature 4: AI Emotion Analysis
- Feature 5: AI Journal Summary
- Feature 9: Prompt Templates
- AI 분석 버튼 + 결과 표시
- npm run build 검증

### Phase 5: Views & Search (20분)
- Feature 2: Date View (Calendar)
- Feature 7: Search
- Feature 10: Export
- npm run build 검증

### Phase 6: Statistics & Insight (15분)
- Feature 6: AI Weekly Insight
- Feature 8: Statistics Dashboard
- 차트 (Recharts)
- npm run build 검증

---

## 8. Critical Rules

### 8.1 AI API Usage
- Open Router API 키 필수
- Rate limiting 고려
- 에러 핸들링 필수
- 분석 결과 DB 저장 (재요청 방지)

### 8.2 JSON Parsing
- AI 응답 JSON 파싱 시 try-catch 필수
- 파싱 실패 시 재시도 또는 에러 표시

### 8.3 Build 검증
- 각 Phase 완료 후 npm run build 필수
- 빌드 에러 0개 확인 후 다음 Phase

### 8.4 Emotion Score
- 1-10 범위 유지
- 0 이하, 10 초과 방지

---

## 9. Success Criteria

### 9.1 Functional
- [ ] 일기 CRUD 동작
- [ ] AI 감정 분석 동작
- [ ] AI 요약 동작
- [ ] AI 주간 인사이트 동작
- [ ] 캘린더 뷰 동작
- [ ] 검색/필터 동작
- [ ] 통계 차트 정확

### 9.2 Technical
- [ ] TypeScript 에러 없음
- [ ] 빌드 에러 없음
- [ ] AI API 에러 핸들링
- [ ] JSON 파싱 안정적

### 9.3 AI Quality
- [ ] 감정 분석 적절함
- [ ] 요약 핵심 포착
- [ ] 인사이트 유용함

---

## 10. Testing Checklist

### 10.1 Journal CRUD
- [ ] 일기 생성 (제목, 내용, 날짜)
- [ ] 일기 수정
- [ ] 일기 삭제
- [ ] 태그 부여/제거

### 10.2 AI Features
- [ ] 감정 분석 요청 → 결과 저장
- [ ] 요약 요청 → 결과 저장
- [ ] 주간 인사이트 생성
- [ ] AI 에러 시 적절한 메시지

### 10.3 Views
- [ ] 캘린더에서 날짜 선택 → 일기 표시
- [ ] 검색 동작
- [ ] 내보내기 동작

### 10.4 Statistics
- [ ] 감정 분포 차트 정확
- [ ] 감정 추이 차트 정확