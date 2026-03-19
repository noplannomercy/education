# AI Travel Planner - 제품 요구사항 정의서 (PRD)

## 1. 프로젝트 개요

### 1.1 목적
AI 기반 여행 계획 앱. 여행 일정 자동 생성, 장소 추천, 예산 최적화, 일정 조정 제안, 날씨 고려.

### 1.2 기술 스택
- 프레임워크: Next.js 14 (App Router)
- 언어: TypeScript
- 데이터베이스: PostgreSQL + Drizzle ORM
- UI: shadcn/ui + Tailwind CSS
- 차트: Recharts
- AI: AI SDK + Open Router
- 모델: `anthropic/claude-haiku-4.5`
- 컨테이너: Docker (PostgreSQL)

### 1.3 대상 사용자
- 여행 계획을 효율적으로 세우고 싶은 사람
- AI 추천으로 최적의 일정을 원하는 사람
- 예산 관리가 필요한 여행자
- 여행 기록을 체계적으로 남기고 싶은 사람

---

## 2. 기능 (12개)

### 기능 1: 여행 관리 CRUD
여행 생성/수정/삭제
- 여행 이름
- 목적지
- 출발일/종료일
- 예산
- 여행 인원
- 여행 유형 (휴양, 관광, 출장, 배낭여행)

### 기능 2: 목적지 데이터베이스
목적지 정보 관리
- 목적지 이름
- 국가/도시
- 카테고리 (관광지, 음식점, 숙소, 쇼핑)
- 평균 비용
- 추천 체류 시간
- 메모

### 기능 3: 일정 관리
날짜별 일정 관리
- 날짜별 활동 추가/수정/삭제
- 시간대 설정
- 목적지 연결
- 이동 시간 표시
- 우선순위

### 기능 4: 예산 추적
여행 경비 관리
- 카테고리별 지출 (교통, 숙박, 식비, 활동, 쇼핑)
- 실제 지출 기록
- 예산 대비 지출 추적
- 남은 예산 계산

### 기능 5: 타임라인 뷰
여행 일정 시각화
- 날짜별 타임라인
- 활동 시간대 표시
- 이동 경로 표시
- 색상으로 카테고리 구분

### 기능 6: 통계 대시보드
여행 통계
- 예산 사용 현황 (Pie Chart)
- 카테고리별 지출 (Bar Chart)
- 일별 활동 분포
- 목적지 방문 횟수

### 기능 7: 검색 & 필터
여행/일정 검색
- 여행 이름/목적지
- 날짜 범위
- 예산 범위
- 여행 유형별

### 기능 8: AI 일정 자동 생성 ⭐
AI 여행 일정 생성
- 입력: 목적지, 기간, 예산, 선호도
- AI가 일별 일정 생성
- 활동 추천 및 시간 배분
- 이동 시간 고려
- 예산 배분

### 기능 9: AI 장소 추천 ⭐
AI 추천 시스템
- 목적지 기반 장소 추천
- 사용자 선호도 반영
- 인기 관광지/음식점
- 숨은 명소 추천
- 계절/날씨 고려

### 기능 10: AI 예산 최적화 ⭐
AI 예산 분석
- 예산 대비 지출 분석
- 절약 가능한 항목 제안
- 카테고리별 예산 재배분
- 비용 효율적인 대안 제시

### 기능 11: AI 일정 조정 제안 ⭐
AI 일정 최적화
- 이동 동선 최적화
- 시간 효율성 분석
- 일정 재배치 제안
- 체력 분산 고려

### 기능 12: AI 여행 인사이트 ⭐
AI 여행 분석
- 여행 스타일 분석
- 선호 활동 패턴
- 다음 여행 추천
- 개선 제안

---

## 3. 데이터 구조

### 3.1 테이블 (5개)

#### trips (여행)
```typescript
{
  id: string (uuid)
  name: string
  destination: string
  country: string
  startDate: date
  endDate: date
  budget: number
  actualSpent: number
  travelers: number
  tripType: enum ('vacation', 'business', 'adventure', 'backpacking')
  status: enum ('planning', 'ongoing', 'completed')
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### destinations (목적지)
```typescript
{
  id: string (uuid)
  name: string
  city: string
  country: string
  category: enum ('attraction', 'restaurant', 'accommodation', 'shopping', 'activity')
  averageCost: number
  recommendedDuration: number (분)
  description: text
  notes: text | null
  createdAt: timestamp
}
```

#### itineraries (일정)
```typescript
{
  id: string (uuid)
  tripId: string (FK → trips)
  date: date
  startTime: time
  endTime: time
  destinationId: string (FK → destinations) | null
  activity: string
  notes: text | null
  priority: enum ('high', 'medium', 'low')
  completed: boolean
  order: number (일정 순서)
  createdAt: timestamp
}
```

#### expenses (지출)
```typescript
{
  id: string (uuid)
  tripId: string (FK → trips)
  category: enum ('transport', 'accommodation', 'food', 'activity', 'shopping', 'other')
  amount: number
  currency: string (기본 'KRW')
  description: string
  date: date
  createdAt: timestamp
}
```

#### ai_recommendations (AI 추천)
```typescript
{
  id: string (uuid)
  tripId: string (FK → trips)
  type: enum ('itinerary', 'place', 'budget', 'optimization', 'insight')
  title: string
  content: text
  metadata: jsonb (추가 정보)
  applied: boolean (사용자가 적용했는지)
  createdAt: timestamp
}
```

---

## 4. AI 구현

### 4.1 AI SDK 설정
```bash
npm install ai @ai-sdk/openai
```

### 4.2 Open Router 설정
```typescript
import { createOpenAI } from '@ai-sdk/openai'

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

const model = openrouter('anthropic/claude-haiku-4.5')
```

### 4.3 AI 함수

#### generateItinerary(tripInfo)
```typescript
입력: {
  destination: "파리",
  startDate: "2026-03-01",
  endDate: "2026-03-05",
  budget: 2000000,
  travelers: 2,
  preferences: ["미술관", "카페", "야경"]
}

출력: {
  dailyPlans: [
    {
      date: "2026-03-01",
      theme: "파리 도착 및 시내 탐방",
      activities: [
        {
          time: "10:00-12:00",
          activity: "에펠탑 방문",
          location: "Tour Eiffel",
          estimatedCost: 50000,
          priority: "high",
          tips: "온라인 예약 필수"
        },
        {
          time: "12:30-14:00",
          activity: "센강 근처 카페 점심",
          location: "Left Bank",
          estimatedCost: 40000,
          priority: "medium"
        }
      ],
      totalCost: 200000,
      notes: "첫날이므로 여유롭게 일정 구성"
    }
  ],
  budgetBreakdown: {
    transport: 300000,
    accommodation: 800000,
    food: 500000,
    activities: 400000
  },
  tips: ["파리 뮤지엄 패스 구매 추천", "메트로 티켓 미리 구입"]
}
```

#### recommendPlaces(destination, preferences)
```typescript
입력: {
  destination: "도쿄",
  tripType: "vacation",
  preferences: ["음식", "쇼핑", "전통문화"],
  budget: "medium"
}

출력: {
  mustVisit: [
    {
      name: "센소지 (浅草寺)",
      category: "attraction",
      reason: "도쿄 최고의 전통 사찰, 일본 문화 체험",
      estimatedTime: 120,
      estimatedCost: 0,
      bestTime: "오전 (관광객 적음)"
    },
    {
      name: "츠키지 외부시장",
      category: "food",
      reason: "신선한 해산물과 스시 체험",
      estimatedTime: 90,
      estimatedCost: 50000,
      bestTime: "아침 일찍"
    }
  ],
  hiddenGems: [
    {
      name: "나카메구로",
      category: "shopping",
      reason: "로컬 부티크와 카페가 있는 힙한 동네",
      estimatedTime: 180,
      estimatedCost: 100000
    }
  ],
  restaurants: [
    {
      name: "이치란 라멘",
      cuisine: "라멘",
      priceRange: "₩10,000-20,000",
      specialty: "개인 부스 라멘 전문점"
    }
  ]
}
```

#### optimizeBudget(trip, expenses)
```typescript
입력: {
  totalBudget: 2000000,
  currentSpending: {
    transport: 400000,
    accommodation: 900000,
    food: 300000,
    activities: 200000
  },
  remainingDays: 2
}

출력: {
  analysis: "예산 대비 85% 사용 중. 숙박비가 예상보다 높습니다.",
  recommendations: [
    {
      category: "accommodation",
      issue: "숙박비가 전체 예산의 45% 차지",
      suggestion: "마지막 이틀은 게스트하우스로 변경 (1박당 20만원 절약)",
      savingAmount: 400000
    },
    {
      category: "food",
      issue: "식비가 적절한 수준",
      suggestion: "현재 수준 유지"
    }
  ],
  adjustedBudget: {
    transport: 400000,
    accommodation: 700000,
    food: 400000,
    activities: 300000,
    buffer: 200000
  },
  warnings: ["예산 초과 위험 20%"]
}
```

#### optimizeItinerary(dailyPlan)
```typescript
입력: {
  date: "2026-03-02",
  activities: [
    { time: "09:00", location: "A", duration: 120 },
    { time: "13:00", location: "B", duration: 90 },
    { time: "16:00", location: "C", duration: 60 },
    { time: "18:00", location: "A", duration: 90 }
  ]
}

출력: {
  issues: [
    "A 지역을 두 번 방문 (비효율적 동선)",
    "13시-16시 사이 이동 시간 과소평가"
  ],
  optimizedPlan: [
    { time: "09:00", location: "A", duration: 120 },
    { time: "11:30", location: "A 근처 점심", duration: 60 },
    { time: "13:00", location: "B", duration: 90 },
    { time: "15:30", location: "C", duration: 90 }
  ],
  improvements: [
    "동선 효율 30% 개선",
    "이동 시간 40분 절약",
    "체력 분산 최적화"
  ],
  timeSaved: 40
}
```

#### analyzeTravelInsights(trips)
```typescript
입력: 사용자의 과거 여행 데이터

출력: {
  travelStyle: "문화 탐방형 여행자",
  preferences: {
    topCategories: ["미술관/박물관", "로컬 음식", "야경"],
    budgetStyle: "중간 예산, 숙박 중시",
    pace: "여유로운 일정 선호"
  },
  patterns: [
    "주로 봄/가을 여행",
    "3-5일 단기 여행 선호",
    "1인당 일일 예산 평균 20만원"
  ],
  nextTripRecommendations: [
    {
      destination: "교토",
      reason: "문화 탐방 성향과 완벽히 일치. 사찰, 정원, 전통 거리",
      bestSeason: "4월 (벚꽃 시즌)",
      estimatedBudget: 1800000
    },
    {
      destination: "바르셀로나",
      reason: "건축과 예술 중심 도시. 가우디 건축물",
      bestSeason: "5월-6월",
      estimatedBudget: 2500000
    }
  ],
  tips: [
    "박물관 패스 활용으로 30% 절약 가능",
    "숙박비 비중 낮춰 활동비 늘리기 추천"
  ]
}
```

### 4.4 AI 프롬프트 템플릿

#### 일정 생성 프롬프트
```
당신은 여행 계획 전문가입니다.

다음 정보를 바탕으로 최적의 여행 일정을 생성해주세요:

[여행 정보]
목적지: {destination}
기간: {startDate} ~ {endDate} ({days}일)
예산: {budget}원
인원: {travelers}명
선호도: {preferences}

요구사항:
1. 날짜별 일정 (활동, 시간, 장소, 예상 비용)
2. 이동 시간 고려
3. 예산 배분 (교통, 숙박, 식비, 활동)
4. 체력 분산 (피곤하지 않게)
5. 우선순위 설정
6. 실용적인 팁

YOU MUST respond with ONLY valid JSON.
No markdown code blocks.
No preamble.
Just pure JSON.

JSON 형식:
{
  "dailyPlans": [
    {
      "date": "YYYY-MM-DD",
      "theme": "주제",
      "activities": [
        {
          "time": "HH:MM-HH:MM",
          "activity": "활동명",
          "location": "장소",
          "estimatedCost": 비용,
          "priority": "high|medium|low",
          "tips": "팁"
        }
      ],
      "totalCost": 총비용,
      "notes": "참고사항"
    }
  ],
  "budgetBreakdown": {
    "transport": 금액,
    "accommodation": 금액,
    "food": 금액,
    "activities": 금액
  },
  "tips": ["팁1", "팁2"]
}
```

#### 장소 추천 프롬프트
```
당신은 여행 가이드 전문가입니다.

다음 여행에 맞는 장소를 추천해주세요:

[여행 정보]
목적지: {destination}
여행 유형: {tripType}
선호도: {preferences}
예산 수준: {budget}

추천 내용:
1. 필수 방문지 (mustVisit) 5곳
2. 숨은 명소 (hiddenGems) 3곳
3. 추천 레스토랑 (restaurants) 5곳

각 장소마다:
- 이름
- 카테고리
- 추천 이유
- 예상 시간/비용
- 베스트 타이밍

YOU MUST respond with ONLY valid JSON.
No markdown code blocks.
No preamble.
Just pure JSON.

JSON 형식:
{
  "mustVisit": [
    {
      "name": "장소명",
      "category": "attraction|food|shopping|activity",
      "reason": "추천 이유",
      "estimatedTime": 분,
      "estimatedCost": 금액,
      "bestTime": "방문 추천 시간"
    }
  ],
  "hiddenGems": [...],
  "restaurants": [
    {
      "name": "식당명",
      "cuisine": "음식 종류",
      "priceRange": "가격대",
      "specialty": "특징"
    }
  ]
}
```

#### 예산 최적화 프롬프트
```
당신은 여행 예산 관리 전문가입니다.

다음 여행 예산을 분석하고 최적화해주세요:

[예산 정보]
총 예산: {totalBudget}원
현재 지출:
- 교통: {transport}원
- 숙박: {accommodation}원
- 식비: {food}원
- 활동: {activities}원

남은 기간: {remainingDays}일

분석 내용:
1. 현재 지출 분석
2. 문제점 및 개선 제안
3. 카테고리별 예산 재배분
4. 절약 가능 항목
5. 경고 사항

YOU MUST respond with ONLY valid JSON.
No markdown code blocks.
No preamble.
Just pure JSON.

JSON 형식:
{
  "analysis": "전체 분석",
  "recommendations": [
    {
      "category": "카테고리",
      "issue": "문제점",
      "suggestion": "개선 제안",
      "savingAmount": 절약금액
    }
  ],
  "adjustedBudget": {
    "transport": 금액,
    "accommodation": 금액,
    "food": 금액,
    "activities": 금액,
    "buffer": 예비비
  },
  "warnings": ["경고1", "경고2"]
}
```

#### 일정 최적화 프롬프트
```
당신은 여행 동선 최적화 전문가입니다.

다음 일정을 분석하고 최적화해주세요:

[일정 정보]
날짜: {date}
활동 목록: {activities}

분석 기준:
1. 이동 동선 효율성
2. 시간 분배
3. 체력 분산
4. 이동 시간 고려

YOU MUST respond with ONLY valid JSON.
No markdown code blocks.
No preamble.
Just pure JSON.

JSON 형식:
{
  "issues": ["문제점1", "문제점2"],
  "optimizedPlan": [
    {
      "time": "HH:MM",
      "location": "장소",
      "duration": 분
    }
  ],
  "improvements": ["개선점1", "개선점2"],
  "timeSaved": 절약시간_분
}
```

#### 여행 인사이트 프롬프트
```
당신은 여행 데이터 분석가입니다.

사용자의 과거 여행 데이터를 분석해주세요:

[여행 데이터]
{trips}

분석 내용:
1. 여행 스타일 파악
2. 선호 활동/카테고리
3. 예산 사용 패턴
4. 여행 주기/기간
5. 다음 여행 추천 (3곳)
6. 개선 팁

YOU MUST respond with ONLY valid JSON.
No markdown code blocks.
No preamble.
Just pure JSON.

JSON 형식:
{
  "travelStyle": "스타일 설명",
  "preferences": {
    "topCategories": ["카테고리1", "카테고리2"],
    "budgetStyle": "예산 스타일",
    "pace": "일정 속도"
  },
  "patterns": ["패턴1", "패턴2"],
  "nextTripRecommendations": [
    {
      "destination": "목적지",
      "reason": "추천 이유",
      "bestSeason": "추천 시즌",
      "estimatedBudget": 예상금액
    }
  ],
  "tips": ["팁1", "팁2"]
}
```

---

## 5. UI 레이아웃

(별도 UI_DESIGN.md에서 상세 정의)

### 5.1 메인 레이아웃
```
┌─────────────────────────────────────────────────────────┐
│  ✈️ AI Travel Planner          [+ 새 여행] [프로필]     │
├─────────────────────────────────────────────────────────┤
│  탭: [여행 목록] [일정] [예산] [추천] [인사이트]        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                  탭 콘텐츠 영역                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 여행 목록 탭
```
현재/예정/완료된 여행 목록
카드 형태로 표시
- 여행 이름, 목적지, 기간
- 예산 사용률
- 진행 상태
```

### 5.3 일정 탭
```
선택한 여행의 날짜별 일정
타임라인 형태
- 날짜별 활동
- 시간대 표시
- 이동 시간
- AI 최적화 버튼
```

### 5.4 예산 탭
```
예산 사용 현황
- 카테고리별 차트
- 실제 지출 기록
- AI 예산 최적화 제안
```

### 5.5 추천 탭
```
AI 장소 추천
- 필수 방문지
- 숨은 명소
- 레스토랑
```

### 5.6 인사이트 탭
```
여행 스타일 분석
- 패턴 분석
- 다음 여행 추천
```

---

## 6. 구현 계획

### Phase 1: 프로젝트 셋업 (15분)
- Next.js 프로젝트 생성
- PostgreSQL 연결 (로컬 + 개발계)
- Drizzle ORM 설정
- shadcn/ui 설치
- Recharts 설치
- AI SDK + Open Router 설정

### Phase 2: DB & 기본 CRUD (25분)
- 5개 테이블 스키마
- Trip CRUD
- Destination CRUD
- Itinerary CRUD
- Expense CRUD

### Phase 3: AI 기능 (35분)
- AI SDK 연동
- 일정 자동 생성 API
- 장소 추천 API
- 예산 최적화 API
- 일정 조정 API
- 여행 인사이트 API

### Phase 4: UI 구현 (30분)
- 여행 목록 탭
- 일정 탭 (타임라인)
- 예산 탭 (차트)
- 추천 탭 (AI)
- 인사이트 탭 (AI)

### Phase 5: 통합 & 테스트 (15분)
- 검색/필터
- 전체 통합
- E2E 테스트

---

## 7. 환경 변수

### 7.1 로컬 개발
```env
# .env.local
DATABASE_URL=postgresql://budget:budget123@localhost:5432/travel_planner
OPENROUTER_API_KEY=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
```

### 7.2 개발계 (Vercel)
```env
# Vercel 환경 변수
DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/budget_tracker
OPENROUTER_API_KEY=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
```

---

## 8. 테스트 체크리스트

### 8.1 여행 관리
- [ ] 여행 생성/수정/삭제
- [ ] 목적지 추가
- [ ] 일정 CRUD
- [ ] 지출 기록

### 8.2 AI 기능
- [ ] AI 일정 자동 생성
- [ ] AI 장소 추천
- [ ] AI 예산 최적화
- [ ] AI 일정 조정
- [ ] AI 여행 인사이트

### 8.3 뷰
- [ ] 타임라인 표시
- [ ] 예산 차트 정확성
- [ ] 검색/필터 동작

### 8.4 Edge Cases
- [ ] 예산 초과 경고
- [ ] 일정 충돌 감지
- [ ] AI API 에러 처리

---

## 9. 성공 기준

- ✅ 12개 피처 모두 동작
- ✅ AI 일정 생성 실용적
- ✅ 예산 추적 정확
- ✅ 차트 시각화 명확
- ✅ 반응형 UI
- ✅ 에러 핸들링 완벽
- ✅ 로컬/개발계 DB 분리
- ✅ Vercel 배포 성공
- ✅ 예상 시간: 120분

---

**Day 16: AI Travel Planner - 똑똑한 여행을 떠나세요! ✈️🌍**