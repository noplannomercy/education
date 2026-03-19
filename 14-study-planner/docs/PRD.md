# AI Study Planner - PRD

## 1. Project Overview

### 1.1 Purpose
AI 기반 학습 계획 및 관리 앱. 과목별 학습 기록, AI 학습 계획 생성, 망각 곡선 기반 복습 스케줄링, 학습 패턴 분석.

### 1.2 Tech Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript (strict mode)
- Database: PostgreSQL + Drizzle ORM
- UI: shadcn/ui + Tailwind CSS
- Charts: Recharts (dynamic import 필수)
- AI: AI SDK + Open Router
- Model: `anthropic/claude-haiku-4-5-20250514` (빠른 응답, 비용 효율)
- Validation: Zod (입/출력 검증)
- Container: Docker (PostgreSQL - 기존 사용)

### 1.3 Target Users
- 체계적으로 공부하고 싶은 학생
- 자격증/시험 준비하는 사람
- 효율적인 복습 스케줄이 필요한 사람
- AI 도움으로 학습 최적화하려는 사람

---

## 2. Features (12개)

### Feature 1: Subject Management
과목/토픽 관리
- 과목 등록/수정/삭제
- 목표 설정 (시험일, 목표 점수)
- 난이도 레벨
- 색상 지정

### Feature 2: Study Session Recording
학습 세션 기록
- 날짜, 시간, 과목
- 학습 내용 (토픽)
- 소요 시간
- 이해도 (1-5)
- 메모

### Feature 3: Progress Tracking
진행도 추적
- 과목별 총 학습 시간
- 토픽별 완료도
- 이해도 평균
- 목표 대비 진행률

### Feature 4: Calendar View
캘린더 뷰
- 월별 학습 기록
- 날짜별 학습 세션
- 복습 일정 표시
- 색상으로 과목 구분

### Feature 5: Statistics Dashboard
통계 대시보드
- 주간/월간 학습 시간 (Bar Chart)
- 과목별 분포 (Pie Chart)
- 이해도 추이 (Line Chart)
- 학습 패턴 분석

### Feature 6: Goal Setting
목표 설정
- 주간 학습 시간 목표
- 과목별 목표
- 시험일 카운트다운
- 목표 달성률

### Feature 7: Search & Filter
검색 및 필터
- 날짜 범위
- 과목별
- 토픽별
- 이해도별

### Feature 8: AI Learning Plan Generation ⭐
AI 학습 계획 생성
- 목표 입력 (시험일, 과목, 현재 수준)
- AI가 주간 학습 계획 생성
- 일별 학습량 배분
- 우선순위 설정
- 계획 저장 및 수정

### Feature 9: AI Review Scheduling ⭐
AI 복습 스케줄링
- 망각 곡선 기반 알고리즘
- 이해도에 따라 복습 간격 조정
- 복습 일정 자동 생성
- 복습 완료 체크
- 다음 복습일 갱신

### Feature 10: AI Study Method Recommendation ⭐
AI 학습 방법 추천
- 과목 특성 분석
- 학습자 패턴 분석
- 효과적인 학습 방법 제안
- 참고 자료 추천

### Feature 11: AI Progress Analysis ⭐
AI 진도 분석
- 강점/약점 과목 파악
- 학습 효율성 분석
- 개선 제안
- 목표 달성 가능성 예측

### Feature 12: AI Motivation Message ⭐
AI 동기부여 메시지
- 매일 학습 독려
- 목표 달성 축하
- 슬럼프 극복 조언
- 개인화된 메시지

---

## 3. Data Structure

### 3.1 Tables (5개)

#### subjects (과목)
```typescript
{
  id: string (uuid)
  name: string
  color: string
  difficulty: enum ('easy', 'medium', 'hard')
  targetDate: date | null (시험일)
  targetScore: number | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### study_sessions (학습 세션)
```typescript
{
  id: string (uuid)
  subjectId: string (FK → subjects)
  topic: string
  duration: number (minutes)
  comprehension: number (1-5)
  notes: text | null
  date: date
  createdAt: timestamp
}
```

#### learning_plans (AI 학습 계획)
```typescript
{
  id: string (uuid)
  subjectId: string (FK → subjects)
  title: string
  description: text
  weekStart: date
  weekEnd: date
  dailyPlan: jsonb {
    monday: { topic: string, duration: number, priority: string }
    tuesday: { ... }
    ...
  }
  createdAt: timestamp
}
```

#### review_schedules (복습 일정)
```typescript
{
  id: string (uuid)
  sessionId: string (FK → study_sessions)
  reviewDate: date
  completed: boolean
  completedAt: timestamp | null
  nextReviewDate: date | null
  repetitionCount: number (복습 횟수)
  createdAt: timestamp
}
```

#### motivations (동기부여 메시지)
```typescript
{
  id: string (uuid)
  message: text
  type: enum ('daily', 'achievement', 'advice')
  generatedAt: timestamp
}
```

---

## 4. AI Implementation

### 4.1 AI SDK Setup
```bash
npm install ai @ai-sdk/openai
```

### 4.2 Open Router Configuration
```typescript
import { createOpenAI } from '@ai-sdk/openai'

// IMPORTANT: baseURL 필수 설정
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

// Haiku 4.5 - 빠른 응답, 비용 효율
const model = openrouter('anthropic/claude-haiku-4-5-20250514')
```

### 4.3 AI Functions

#### generateLearningPlan(subject, targetDate, currentLevel)
```typescript
Input: {
  subject: "자료구조",
  targetDate: "2026-03-15",
  currentLevel: "중급",
  weeklyHours: 20
}

Output: {
  weekStart: "2026-01-20",
  weekEnd: "2026-01-26",
  dailyPlan: {
    monday: {
      topic: "트리 구조 복습",
      duration: 120,
      priority: "high",
      tasks: ["이진 트리 개념", "순회 알고리즘"]
    },
    ...
  }
}
```

#### calculateReviewSchedule(session, comprehension)
```typescript
Input: {
  sessionId: "uuid",
  topic: "정렬 알고리즘",
  comprehension: 4,
  studiedAt: "2026-01-15"
}

Output: {
  reviewDates: [
    "2026-01-16", // +1일 (comprehension 높으면 간격 증가)
    "2026-01-18", // +3일
    "2026-01-25", // +7일
    "2026-02-08"  // +14일
  ]
}
```

#### recommendStudyMethod(subject, learningPattern)
```typescript
Input: {
  subject: "영어",
  subjectType: "language",
  recentSessions: [
    { comprehension: 3, duration: 60 },
    { comprehension: 4, duration: 90 }
  ],
  learnerStyle: "visual"
}

Output: {
  methods: [
    "시각 자료 활용 (flashcard, diagram)",
    "간격 반복 학습 (spaced repetition)",
    "실전 문제 풀이 (매일 30분)"
  ],
  resources: [
    "Anki 앱 활용",
    "YouTube 영어 채널 추천",
    "원서 읽기"
  ]
}
```

#### analyzeProgress(sessions, goals)
```typescript
Input: {
  sessions: [...],
  goals: {
    weeklyHours: 20,
    targetDate: "2026-03-15"
  }
}

Output: {
  strengths: ["자료구조", "알고리즘"],
  weaknesses: ["데이터베이스", "네트워크"],
  efficiency: 0.75,
  onTrack: true,
  recommendations: [
    "데이터베이스 학습 시간 30% 증가 필요",
    "복습 주기 단축 권장"
  ]
}
```

#### generateMotivation(context)
```typescript
Input: {
  type: "daily",
  recentProgress: "good",
  streakDays: 7,
  userName: "학생"
}

Output: {
  message: "🔥 7일 연속 학습 달성! 꾸준함이 실력이 됩니다. 오늘도 화이팅!"
}
```

### 4.4 AI Prompt Templates

#### Learning Plan Prompt
```
당신은 학습 계획 전문가입니다.

다음 정보를 바탕으로 효과적인 주간 학습 계획을 작성해주세요:

[과목 정보]
- 과목: {subject}
- 시험일: {targetDate}
- 현재 수준: {currentLevel}
- 주간 가능 시간: {weeklyHours}시간

요구사항:
1. 일별로 학습 주제 배분
2. 우선순위 설정 (high/medium/low)
3. 적정 학습 시간 할당
4. 복습 시간 포함

다음 JSON 형식으로 응답:
{
  "dailyPlan": {
    "monday": { "topic": "", "duration": 0, "priority": "", "tasks": [] },
    ...
  }
}
```

#### Study Method Prompt
```
당신은 학습 방법 전문가입니다.

다음 학습자 정보를 분석하고 효과적인 학습 방법을 추천해주세요:

[과목 정보]
- 과목: {subject}
- 과목 유형: {subjectType}

[학습 패턴]
- 최근 이해도 평균: {avgComprehension}
- 선호 학습 시간대: {preferredTime}
- 학습 스타일: {learnerStyle}

추천 내용:
1. 효과적인 학습 방법 3가지
2. 추천 학습 자료
3. 시간 배분 전략
```

#### Progress Analysis Prompt
```
당신은 학습 분석 전문가입니다.

다음 학습 데이터를 분석하고 인사이트를 제공해주세요:

[학습 세션 데이터]
{sessions}

[목표]
- 주간 목표: {weeklyGoal}시간
- 시험일: {targetDate}

분석 내용:
1. 강점 과목 (이해도 높음)
2. 약점 과목 (이해도 낮음)
3. 학습 효율성 평가
4. 목표 달성 가능성
5. 개선 제안
```

#### Motivation Prompt
```
당신은 학습 코치입니다.

다음 상황에 맞는 동기부여 메시지를 작성해주세요:

[상황]
- 유형: {type} (daily/achievement/advice)
- 최근 진행 상황: {progress}
- 연속 학습 일수: {streakDays}

요구사항:
- 긍정적이고 격려하는 톤
- 구체적인 칭찬 또는 조언
- 이모지 1-2개 포함
- 2-3문장

메시지:
```

---

## 5. UI Layout

### 5.1 Main Layout
```
┌─────────────────────────────────────────────────────────┐
│  📚 AI Study Planner              [+ 학습 기록] [목표]   │
├─────────────────────────────────────────────────────────┤
│  Tabs: [오늘] [캘린더] [통계] [계획] [분석]              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                  Tab Content Area                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Today Tab
```
┌─────────────────────────────────────────────────────────┐
│  📅 2026년 1월 15일 수요일                              │
│  🎯 오늘 목표: 3시간 | 완료: 1.5시간 (50%)              │
├─────────────────────────────────────────────────────────┤
│  💪 오늘의 동기부여                                      │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 🔥 어제보다 30분 더 공부했어요! 꾸준함이 실력이    ││
│  │ 됩니다. 오늘도 화이팅!                              ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  📖 오늘 학습 세션                                       │
│  ┌─────────────────────────────────────────────────────┐│
│  │ [자료구조] 트리 구조 - 90분 | 이해도: ⭐⭐⭐⭐     ││
│  │ 10:00 - 11:30                                       ││
│  │ [편집] [삭제]                                       ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  [+ 새 학습 세션 추가]                                  │
│                                                         │
│  📋 오늘 복습 일정                                       │
│  ┌─────────────────────────────────────────────────────┐│
│  │ □ [알고리즘] 정렬 알고리즘 (3일차 복습)            ││
│  │ □ [데이터베이스] SQL 기초 (7일차 복습)             ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 5.3 Calendar Tab
```
┌─────────────────────────────────────────────────────────┐
│  ◀ 2026년 1월 ▶                                         │
├─────────────────────────────────────────────────────────┤
│  일  월  화  수  목  금  토                              │
│            1●  2●  3●  4   5                            │
│  6   7   8●  9● 10● 11  12                              │
│ 13  14  15● 16  17  18  19                              │
│ 20  21  22  23  24  25  26                              │
│ 27  28  29  30  31                                      │
│                                                         │
│  ● 학습 세션 있음 | ◆ 복습 일정                         │
├─────────────────────────────────────────────────────────┤
│  2026년 1월 15일 (수)                                    │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 📘 자료구조 - 90분 (이해도: 4/5)                   ││
│  │ 📗 알고리즘 - 60분 (이해도: 5/5)                   ││
│  │ 총 학습 시간: 2.5시간                               ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 5.4 Statistics Tab
```
┌─────────────────────────────────────────────────────────┐
│  통계 대시보드                   [이번 주] [이번 달]     │
├─────────────────────────────────────────────────────────┤
│  📊 주간 학습 시간: 15.5시간 / 20시간 (78%)             │
│  🔥 연속 학습 일수: 7일                                  │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  과목별 분포    │  │  일별 학습 시간 (Bar Chart)│  │
│  │  (Pie Chart)    │  │                            │  │
│  │                 │  │  ▓▓▓▓▓ 3h                  │  │
│  │  자료구조 40%   │  │  ▓▓▓▓  2.5h                │  │
│  │  알고리즘 30%   │  │  ▓▓▓   2h                  │  │
│  │  DB 20%         │  │  ...                       │  │
│  │  네트워크 10%   │  │  월 화 수 목 금 토 일      │  │
│  └─────────────────┘  └─────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  이해도 추이 (Line Chart)                       │   │
│  │  5 ━━━━━━━━━━━━━━━━━                            │   │
│  │  4 ━━━━  자료구조                               │   │
│  │  3 ━━    알고리즘                               │   │
│  │  2                                              │   │
│  │  1                                              │   │
│  │    1/1  1/7  1/14                               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 5.5 Plan Tab (AI 학습 계획)
```
┌─────────────────────────────────────────────────────────┐
│  🤖 AI 학습 계획                                         │
├─────────────────────────────────────────────────────────┤
│  [+ 새 계획 생성]                                        │
│                                                         │
│  📋 이번 주 계획 (1/13 - 1/19)                          │
│  과목: 자료구조 | 목표: 3개 챕터 완료                    │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 월요일 (1/13)                                       ││
│  │ • 트리 구조 기초 - 120분 [우선순위: 높음]          ││
│  │   - 이진 트리 개념                                  ││
│  │   - 순회 알고리즘                                   ││
│  │                                                     ││
│  │ 화요일 (1/14)                                       ││
│  │ • BST 구현 - 90분 [우선순위: 높음]                 ││
│  │   - insert, search, delete                         ││
│  │                                                     ││
│  │ 수요일 (1/15)                                       ││
│  │ • AVL 트리 - 120분 [우선순위: 중간]                ││
│  │ • 복습: 이진 트리 - 30분                           ││
│  │ ...                                                 ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  [편집] [삭제] [다음 주 자동 생성]                      │
└─────────────────────────────────────────────────────────┘
```

### 5.6 Analysis Tab (AI 분석)
```
┌─────────────────────────────────────────────────────────┐
│  📈 AI 학습 분석                     [분석 새로고침]     │
├─────────────────────────────────────────────────────────┤
│  🎯 진도 분석                                            │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 목표 달성률: 78% (예상 80%)                         ││
│  │ 시험까지: 59일 남음                                 ││
│  │ 현재 진도로는 목표 달성 가능성: 높음                ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  💪 강점 과목                                            │
│  • 알고리즘 (평균 이해도: 4.5/5)                        │
│  • 자료구조 (평균 이해도: 4.2/5)                        │
│                                                         │
│  ⚠️ 약점 과목                                            │
│  • 데이터베이스 (평균 이해도: 2.8/5)                    │
│  • 네트워크 (평균 이해도: 3.0/5)                        │
│                                                         │
│  🤖 AI 추천                                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 1. 데이터베이스 학습 시간을 주 3시간 → 5시간으로   ││
│  │    증가 권장                                         ││
│  │                                                     ││
│  │ 2. 복습 주기를 단축하세요 (현재 7일 → 5일)         ││
│  │                                                     ││
│  │ 3. 실전 문제 풀이 비중을 높이세요 (현재 30% →     ││
│  │    50%)                                             ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  📚 추천 학습 방법                                       │
│  • 데이터베이스: 실습 위주 학습 (프로젝트 진행)         │
│  • 간격 반복 학습 (Spaced Repetition) 적용              │
│  • 주말 집중 학습 세션 (4시간)                          │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Plan

### Phase 1: 프로젝트 셋업 (15분)
- Next.js 프로젝트 생성
- PostgreSQL 연결 (기존 컨테이너)
- Drizzle ORM 설정
- shadcn/ui 설치
- Recharts 설치
- AI SDK + Open Router 설정

### Phase 2: DB & 기본 CRUD (25분)
- 5개 테이블 스키마
- Subject CRUD
- Study Session CRUD
- Goal Management

### Phase 3: AI 기능 (35분)
- AI SDK 연동
- 학습 계획 생성 API
- 복습 스케줄링 알고리즘
- 학습 방법 추천 API
- 진도 분석 API
- 동기부여 메시지 API

### Phase 4: UI 구현 (30분)
- Today Tab (학습 기록)
- Calendar Tab
- Statistics Tab (차트)
- Plan Tab (AI 계획)
- Analysis Tab (AI 분석)

### Phase 5: 통합 & 테스트 (15분)
- 검색/필터
- 전체 통합
- E2E 테스트

---

## 7. Environment Variables

```env
# Database
DATABASE_URL=postgresql://budget:budget123@localhost:5432/study_planner

# Open Router
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

---

## 8. Testing Checklist

### 8.1 Subject & Session
- [ ] 과목 생성/수정/삭제
- [ ] 학습 세션 기록
- [ ] 이해도 입력 (1-5)
- [ ] 진행도 추적

### 8.2 AI Features
- [ ] AI 학습 계획 생성
- [ ] 복습 일정 자동 생성
- [ ] 학습 방법 추천
- [ ] 진도 분석
- [ ] 동기부여 메시지

### 8.3 Views
- [ ] 캘린더 보기
- [ ] 통계 차트 정확성
- [ ] 검색/필터 동작

### 8.4 Edge Cases

#### 데이터 무결성
- [ ] 과목 삭제 시 연관 데이터 CASCADE 삭제 확인
- [ ] 세션 삭제 시 복습 일정 CASCADE 삭제 확인
- [ ] 과목 0개일 때 세션 추가 시도 → 안내 메시지
- [ ] duration 범위 (1-480) 검증
- [ ] comprehension 범위 (1-5) 검증

#### AI 관련
- [ ] AI API 타임아웃 (30초) 처리
- [ ] AI API Rate Limit (429) 시 재시도
- [ ] AI API 크레딧 부족 (402) 처리
- [ ] AI 응답 JSON 파싱 실패 시 fallback
- [ ] API 키 무효/만료 시 에러 메시지

#### 복습 관련
- [ ] 복습 기한 지난 경우 (밀린 복습) 조회
- [ ] 밀린 복습 일괄 완료 기능
- [ ] 복습 완료 시 이해도 재평가
- [ ] repetitionCount > 6 시 마지막 간격 (90일) 유지

#### UI/UX
- [ ] 차트 SSR 에러 방지 (dynamic import)
- [ ] 빈 데이터 상태 UI 표시
- [ ] 로딩 상태 표시
- [ ] 캘린더 년도 이동

---

## 9. Success Criteria

- ✅ 12개 피처 모두 동작
- ✅ AI 계획 생성 정확도 높음
- ✅ 복습 알고리즘 동작
- ✅ 차트 시각화 명확
- ✅ 반응형 UI
- ✅ 에러 핸들링 완벽
- ✅ 예상 시간: 120분

---

**Day 14: AI Study Planner - Let's Build! 🚀**