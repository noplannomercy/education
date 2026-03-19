# 🚀 AI Study Planner 시작 가이드

## Step 1: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## Step 2: 첫 사용 가이드

### 1️⃣ 과목 생성하기 (Plan 탭)

1. 상단 탭에서 **"Plan"** 클릭
2. 왼쪽 "New Subject" 카드에서:
   - Subject Name 입력 (예: "Mathematics")
   - Color 선택 (색상 피커 또는 hex 코드)
3. **"Create"** 버튼 클릭
4. 오른쪽 "Subjects" 목록에 추가된 과목 확인

**여러 과목 추가 예시:**
- Mathematics (파란색 #3b82f6)
- Physics (초록색 #10b981)
- English (빨간색 #ef4444)

---

### 2️⃣ 학습 세션 기록하기 (Today 탭)

1. 상단 탭에서 **"Today"** 클릭
2. 오른쪽 "Log Study Session" 카드에서:
   - **Subject**: 방금 만든 과목 선택
   - **Duration**: 학습한 시간(분) 입력 (예: 60)
   - **Comprehension Level**: 이해도 선택 (1~5)
     - 1: 전혀 이해 못함
     - 3: 보통
     - 5: 완벽하게 이해함
   - **Notes**: 메모 입력 (선택사항)
3. **"Log Session"** 버튼 클릭

**자동으로 일어나는 일:**
- ✅ 복습 스케줄이 자동 생성됩니다!
- ✅ 이해도에 따라 복습 날짜가 조정됩니다
  - 이해도 4-5: 간격 ×1.5 (더 길게)
  - 이해도 1-2: 간격 ×0.5 (더 짧게)

---

### 3️⃣ 오늘의 복습 완료하기 (Today 탭)

왼쪽 "Today's Reviews" 카드에 복습할 항목이 표시됩니다.

1. 복습 항목 확인
2. **"How well do you remember this?"** 드롭다운에서 선택
   - 1: 기억 안남
   - 5: 완벽하게 기억
3. **"Complete Review"** 버튼 클릭

**자동으로 일어나는 일:**
- ✅ 다음 복습 날짜가 자동 생성됩니다!
- ✅ Toast 알림으로 다음 복습일을 알려줍니다

---

### 4️⃣ 복습 스케줄 확인하기 (Calendar 탭)

1. 상단 탭에서 **"Calendar"** 클릭
2. 달력에서 파란색으로 표시된 날짜 = 복습 예정일
3. 날짜를 클릭하면 오른쪽에 그날의 복습 항목 표시

---

### 5️⃣ 학습 통계 보기 (Statistics 탭)

1. 상단 탭에서 **"Statistics"** 클릭
2. 3가지 차트 확인:
   - **과목별 총 학습 시간** (시간 단위)
   - **최근 7일 일별 학습 시간** (분 단위)
   - **과목별 평균 이해도** (1-5점)

---

### 6️⃣ AI 학습 계획 생성하기 (Plan 탭)

1. Plan 탭의 "Generate Learning Plan" 카드에서:
   - **Subject**: 과목 선택
   - **Study Goal**: 학습 목표 입력
     - 예: "Master calculus fundamentals and solve derivative problems"
   - **Weeks Available**: 기간 입력 (예: 8주)
2. **"Generate Plan"** 버튼 클릭
3. AI가 주간 학습 계획 생성 (20~30초 소요)
4. 생성된 계획이 오른쪽 "Learning Plans"에 표시됩니다

**계획 내용:**
- Week 1, 2, 3... 주차별 학습 내용
- 학습 목표
- 권장 학습 시간
- 성공 지표

---

### 7️⃣ AI 분석 받기 (Analysis 탭)

1. 상단 탭에서 **"Analysis"** 클릭
2. 과목 선택
3. 3가지 버튼 중 선택:

**Get Progress Analysis**
- 학습 진행 상황 분석
- 트렌드 (개선/정체/하락)
- 다음 2주 목표 제안

**Get Study Method Recommendations**
- 최근 학습 세션 분석
- 최적 학습 방법 추천
- 세션 구조 제안

**Get Motivation**
- 이번 주 학습 통계 기반
- 개인화된 동기부여 메시지
- 실용적인 팁 제공

---

## Step 3: 테스트 데이터로 시작하기 (선택)

처음부터 데이터 입력하기 귀찮다면:

```bash
# 터미널에서 실행
npx tsx scripts/seed-test-data.ts
```

**자동 생성되는 것:**
- 4개 과목 (Mathematics, Physics, Computer Science, English)
- 20개 학습 세션 (과거 14일간)
- 복습 스케줄
- 통계 데이터

그 후 http://localhost:3000 새로고침하면 데이터가 채워진 앱을 볼 수 있습니다!

---

## 💡 사용 팁

### 복습 알고리즘
- **1일** 후 첫 복습
- **3일** 후 두 번째 복습
- **7일** 후 세 번째 복습
- **14일** → **30일** → **60일** → **90일**

### 이해도 점수 기준
- **5점**: 완벽하게 이해, 설명 가능
- **4점**: 잘 이해, 약간의 확인 필요
- **3점**: 보통 수준, 복습 필요
- **2점**: 잘 기억 안남, 다시 학습 필요
- **1점**: 전혀 기억 안남, 처음부터 다시

### 학습 세션 기록 시점
- 학습 직후에 기록하는 것이 정확합니다
- 이해도는 솔직하게! (복습 간격이 자동 조정됩니다)

### AI 기능 활용
- 학습 계획: 새 과목 시작 시
- 진행 분석: 2주마다
- 학습 방법: 효과가 없다고 느낄 때
- 동기부여: 의욕이 떨어질 때

---

## ⚠️ 문제 해결

### PostgreSQL 연결 오류
```bash
# Docker 컨테이너 확인
docker ps | grep budget-tracker-db

# 없으면 시작
docker start budget-tracker-db
```

### AI API 오류
- `.env.local`에 OPENROUTER_API_KEY 확인
- API 크레딧 잔액 확인

### 빌드 오류
```bash
npm install
npm run build
```

---

## 📱 화면 구성

```
┌─────────────────────────────────────┐
│  AI Study Planner                   │
│  [Today] [Calendar] [Statistics]    │
│  [Plan] [Analysis]                  │
├─────────────────────────────────────┤
│                                     │
│  선택한 탭의 내용                    │
│                                     │
└─────────────────────────────────────┘
```

**Today**: 오늘 할 일 (복습 + 세션 기록)
**Calendar**: 복습 스케줄 달력
**Statistics**: 학습 통계 차트
**Plan**: 과목 관리 + AI 계획
**Analysis**: AI 분석 + 추천

---

## 🎯 추천 워크플로우

### 매일
1. Today 탭 열기
2. 오늘의 복습 완료
3. 학습 후 세션 기록

### 매주
1. Statistics 탭에서 주간 통계 확인
2. Analysis 탭에서 동기부여 메시지 받기

### 매달
1. Analysis 탭에서 진행 분석 받기
2. 학습 방법 추천 확인 및 조정

### 새 과목 시작 시
1. Plan 탭에서 과목 추가
2. AI 학습 계획 생성
3. 계획에 따라 학습 시작

---

이제 http://localhost:3000 으로 가서 직접 사용해보세요! 🚀
