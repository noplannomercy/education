# AI Dream Journal - 상세 구현 계획

> 5개 Phase로 나누어 진행하는 단계별 구현 체크리스트

---

## Phase 1: 프로젝트 셋업 (15분)

### 1.1 Next.js 프로젝트 생성
- [ ] `npx create-next-app@latest dream-journal --typescript --tailwind --app --no-src-dir` 실행
- [ ] 프로젝트 디렉토리로 이동: `cd dream-journal`
- [ ] `tsconfig.json`에서 strict mode 활성화 확인
- [ ] 불필요한 기본 파일 정리 (app/page.tsx 초기화)

### 1.2 PostgreSQL 연결 설정
- [ ] `.env.local` 파일 생성
- [ ] `DATABASE_URL=postgresql://budget:budget123@localhost:5432/dream_journal` 추가
- [ ] `OPENROUTER_API_KEY=` 추가 (API 키는 나중에 입력)
- [ ] Docker PostgreSQL 컨테이너 실행 확인: `docker ps`
- [ ] dream_journal 데이터베이스 생성 확인 (pgAdmin 또는 psql)

### 1.3 Drizzle ORM 설정
- [ ] Drizzle 패키지 설치: `npm install drizzle-orm postgres drizzle-zod`
- [ ] Dev 의존성 설치: `npm install -D drizzle-kit`
- [ ] `drizzle.config.ts` 파일 생성 (dialect: 'postgresql')
- [ ] `db/` 디렉토리 생성
- [ ] `db/schema.ts` 파일 생성 (빈 파일)
- [ ] `db/index.ts` 파일 생성 (DB 클라이언트 설정)

### 1.4 shadcn/ui 설치
- [ ] shadcn/ui 초기화: `npx shadcn@latest init`
- [ ] 기본 컴포넌트 설치: `npx shadcn@latest add button card input label textarea select`
- [ ] Form 관련 패키지 설치: `npm install react-hook-form @hookform/resolvers zod`
- [ ] 추가 UI 컴포넌트: `npx shadcn@latest add form dialog tabs badge`

### 1.5 Recharts 설치
- [ ] Recharts 패키지 설치: `npm install recharts`
- [ ] 타입 정의 설치: `npm install -D @types/recharts` (필요시)

### 1.6 AI SDK + Open Router 설정
- [ ] AI SDK 패키지 설치: `npm install ai @ai-sdk/openai`
- [ ] `lib/ai.ts` 파일 생성
- [ ] Open Router 클라이언트 설정 (baseURL, apiKey)
- [ ] Model 설정: `anthropic/claude-haiku-4.5`
- [ ] `lib/env.ts` 파일 생성 (환경 변수 검증)

### 1.7 추가 유틸리티 설정
- [ ] `lib/utils.ts` 확인 (shadcn/ui가 자동 생성)
- [ ] `lib/errors.ts` 파일 생성 (에러 클래스)
- [ ] `lib/error-handler.ts` 파일 생성 (에러 핸들러)
- [ ] `lib/logger.ts` 파일 생성 (로깅 유틸리티)

### 1.8 **CRITICAL: npm run build 검증**
- [ ] 터미널에서 `npm run build` 실행
- [ ] 빌드 성공 확인: `✓ Compiled successfully` 메시지 확인
- [ ] **CRITICAL: 빌드 에러 0 확인** - 타입 에러가 하나도 없어야 함

### 1.9 Test: 개발 서버 실행 검증
- [ ] `npm run dev` 실행
- [ ] 브라우저에서 `http://localhost:3000` 접속
- [ ] 빈 페이지 또는 기본 레이아웃 표시 확인
- [ ] 콘솔에 에러 없음 확인

### 1.10 Git 커밋
- [ ] `git add .`
- [ ] `git commit -m "Phase 1: 프로젝트 셋업 완료 - Next.js, Drizzle, shadcn/ui, AI SDK 설정"`
- [ ] `docs/IMPLEMENTATION.md` 파일 생성 및 Phase 1 완료 기록

---

## Phase 2: DB & 기본 CRUD (20분)

### 2.1 Drizzle 스키마 작성 (4개 테이블)
- [ ] `db/schema.ts`에 3개 pgEnum 정의: emotionEnum, symbolCategoryEnum, patternTypeEnum
- [ ] `dreams` 테이블 정의 (9개 필드: id, title, content, date, emotion, vividness, lucid, createdAt, updatedAt)
- [ ] `interpretations` 테이블 정의 (7개 필드, dreamId UNIQUE)
- [ ] `symbols` 테이블 정의 (7개 필드)
- [ ] `patterns` 테이블 정의 (8개 필드, dreamIds TEXT[])

### 2.2 Drizzle Relations 정의
- [ ] `dreamsRelations` 정의 (interpretation: one, symbols: many)
- [ ] `interpretationsRelations` 정의 (dream: one)
- [ ] `symbolsRelations` 정의 (dream: one)

### 2.3 Zod 검증 스키마 작성
- [ ] `insertDreamSchema` 작성 (title, content, date 검증 규칙)
- [ ] `insertInterpretationSchema` 작성
- [ ] `insertSymbolSchema` 작성
- [ ] `insertPatternSchema` 작성
- [ ] Select 스키마 작성 (createSelectSchema)

### 2.4 TypeScript 타입 추론
- [ ] `InsertDream`, `InsertInterpretation`, `InsertSymbol`, `InsertPattern` 타입 export
- [ ] `Dream`, `Interpretation`, `Symbol`, `Pattern` 타입 export
- [ ] `DreamWithInterpretation`, `DreamWithSymbols`, `DreamWithAll` 조인 타입 정의

### 2.5 DB 마이그레이션 실행
- [ ] `npx drizzle-kit push` 실행
- [ ] PostgreSQL에 4개 테이블 생성 확인
- [ ] 3개 Enum 타입 생성 확인
- [ ] 에러 없이 완료 확인

### 2.6 Dream CRUD - Server Actions 작성
- [ ] `app/actions/dreams.ts` 파일 생성
- [ ] `'use server'` 지시어 추가
- [ ] `createDream(data: InsertDream)` 함수 작성
  - Zod 검증
  - DB insert
  - revalidatePath('/')
  - 에러 핸들링
- [ ] `updateDream(id: string, data: Partial<InsertDream>)` 함수 작성
- [ ] `deleteDream(id: string)` 함수 작성
- [ ] `getDreams()` 함수 작성 (최근 10개)
- [ ] `getDreamById(id: string)` 함수 작성

### 2.7 Tag System (간단한 버전)
- [ ] dreams 테이블에 tags TEXT[] 컬럼 추가 (스키마 수정)
- [ ] `updateDreamTags(id: string, tags: string[])` 함수 작성
- [ ] `getPopularTags()` 함수 작성 (집계 쿼리)

### 2.8 **CRITICAL: npm run build 검증**
- [ ] 터미널에서 `npm run build` 실행
- [ ] 빌드 성공 확인
- [ ] **CRITICAL: 빌드 에러 0 확인**
- [ ] TypeScript 타입 에러 없음 확인

### 2.9 Test: Drizzle Studio 검증
- [ ] `npx drizzle-kit studio` 실행
- [ ] 브라우저에서 Drizzle Studio 접속 (https://local.drizzle.studio)
- [ ] 4개 테이블 확인 (dreams, interpretations, symbols, patterns)
- [ ] dreams 테이블에 수동으로 테스트 데이터 1개 삽입
- [ ] 데이터 저장 확인

### 2.10 Git 커밋
- [ ] `git add .`
- [ ] `git commit -m "Phase 2: DB 스키마 & CRUD 완료 - 4개 테이블, Server Actions"`
- [ ] `docs/IMPLEMENTATION.md` 업데이트

---

## Phase 3: AI 기능 (25분)

### 3.1 AI 유틸리티 함수 작성
- [ ] `lib/ai-service.ts` 파일 생성
- [ ] `callAIWithRetry<T>()` 헬퍼 함수 작성 (3회 재시도, delay)
- [ ] Rate limit 감지 로직 추가 (delay * 5)
- [ ] 타임아웃 설정 (30초)

### 3.2 AI 기능 1: interpretDream() 구현
- [ ] Zod 스키마 정의: `interpretationSchema` (interpretation, psychological, symbolic, message)
- [ ] `interpretDream(content: string, emotion: string, vividness: number)` 함수 작성
- [ ] generateObject() 사용
- [ ] 프롬프트 작성 (PRD Section 4.4 참조)
- [ ] callAIWithRetry()로 래핑
- [ ] 에러 핸들링 (AIServiceError)

### 3.3 AI 기능 2: extractSymbols() 구현
- [ ] Zod 스키마 정의: `symbolSchema` (symbols 배열)
- [ ] `extractSymbols(content: string)` 함수 작성
- [ ] 프롬프트 작성 (5가지 카테고리 명시)
- [ ] generateObject() 사용
- [ ] callAIWithRetry()로 래핑
- [ ] 에러 핸들링

### 3.4 AI 기능 3: detectPatterns() 구현
- [ ] Zod 스키마 정의: `patternSchema` (patterns 배열)
- [ ] `detectPatterns(dreams: Dream[])` 함수 작성
- [ ] 꿈 목록을 텍스트로 변환
- [ ] 프롬프트 작성 (4가지 패턴 유형)
- [ ] generateObject() 사용
- [ ] callAIWithRetry()로 래핑
- [ ] 에러 핸들링

### 3.5 AI 기능 4: generateWeeklyInsight() 구현
- [ ] Zod 스키마 정의: `insightSchema` (summary, mainThemes, emotionalFlow, subconscious, nextWeek)
- [ ] `generateWeeklyInsight(dreams: Dream[])` 함수 작성
- [ ] 이번 주 꿈 필터링 로직 추가
- [ ] 프롬프트 작성 (5가지 분석 내용)
- [ ] generateObject() 사용
- [ ] callAIWithRetry()로 래핑
- [ ] 에러 핸들링

### 3.6 API Route: /api/interpret 생성
- [ ] `app/api/interpret/route.ts` 파일 생성
- [ ] POST 핸들러 작성
- [ ] 요청 body 검증 (dreamId, content, emotion, vividness)
- [ ] interpretDream() 호출
- [ ] DB에 해석 저장 (interpretations 테이블)
- [ ] 에러 핸들링 (errorHandler 사용)
- [ ] 응답 형식: `{ success: true, data: {...} }`

### 3.7 API Route: /api/symbols 생성
- [ ] `app/api/symbols/route.ts` 파일 생성
- [ ] POST 핸들러 작성
- [ ] extractSymbols() 호출
- [ ] DB에 상징 저장 (symbols 테이블, 트랜잭션 사용)
- [ ] frequency 업데이트 로직 추가 (기존 상징 존재 시 +1)
- [ ] 에러 핸들링

### 3.8 API Route: /api/patterns 생성
- [ ] `app/api/patterns/route.ts` 파일 생성
- [ ] POST 핸들러 작성
- [ ] 최근 꿈 N개 조회 (기본 10개)
- [ ] detectPatterns() 호출
- [ ] DB에 패턴 저장 (patterns 테이블)
- [ ] 기존 패턴 업데이트 로직 (name 중복 시 occurrences +1, dreamIds 배열 추가)
- [ ] 에러 핸들링

### 3.9 API Route: /api/insights 생성
- [ ] `app/api/insights/route.ts` 파일 생성
- [ ] GET 핸들러 작성
- [ ] 쿼리 파라미터: `week` (예: 2026-W03)
- [ ] 해당 주의 꿈 조회
- [ ] generateWeeklyInsight() 호출
- [ ] 결과 반환 (DB 저장 안 함)
- [ ] 에러 핸들링

### 3.10 **CRITICAL: npm run build 검증**
- [ ] 터미널에서 `npm run build` 실행
- [ ] 빌드 성공 확인
- [ ] **CRITICAL: 빌드 에러 0 확인**
- [ ] TypeScript 타입 에러 없음 확인

### 3.11 Test: AI API 응답 검증
- [ ] Postman 또는 Thunder Client 사용
- [ ] POST `/api/interpret` 테스트
  - 요청: `{ dreamId: "test-uuid", content: "하늘을 날았다", emotion: "positive", vividness: 5 }`
  - 응답: interpretation, psychological, symbolic, message 존재 확인
- [ ] POST `/api/symbols` 테스트
  - 요청: `{ dreamId: "test-uuid", content: "숲 속에서 늑대를 만났다" }`
  - 응답: symbols 배열 (symbol, category, meaning)
- [ ] 에러 케이스 테스트: OPENROUTER_API_KEY 누락 시 503 에러

### 3.12 Git 커밋
- [ ] `git add .`
- [ ] `git commit -m "Phase 3: AI 기능 완료 - 4가지 AI API (해석, 상징, 패턴, 인사이트)"`
- [ ] `docs/IMPLEMENTATION.md` 업데이트

---

## Phase 4: UI 구현 (20분)

### 4.1 레이아웃 구조 설정
- [ ] `app/layout.tsx` 수정 (루트 레이아웃)
- [ ] `app/(dashboard)/layout.tsx` 생성 (대시보드 레이아웃 그룹)
- [ ] 헤더 컴포넌트 생성: `components/header.tsx`
  - 제목: "🌙 AI Dream Journal"
  - "새 꿈 기록" 버튼
- [ ] 네비게이션 탭 컴포넌트: `components/nav-tabs.tsx`
  - 5개 탭: 오늘, 캘린더, 통계, 해석, 패턴

### 4.2 UI 탭 1: 오늘 탭 (app/(dashboard)/page.tsx)
- [ ] 날짜 표시 컴포넌트 추가
- [ ] 연속 기록 스트릭 계산 및 표시
- [ ] DreamForm 컴포넌트 생성: `components/dream-form.tsx`
  - react-hook-form + zodResolver 사용
  - 필드: title, content, date, emotion (radio), vividness (slider), lucid (checkbox)
  - 태그 입력 (간단한 텍스트 입력)
  - "저장" 버튼 → createDream() Server Action 호출
  - "AI 해석 받기" 버튼 → /api/interpret 호출
- [ ] 최근 기록한 꿈 리스트 표시 (최근 5개)
- [ ] DreamCard 컴포넌트: `components/dream-card.tsx`
  - 제목, 날짜, 감정, 생생함 표시
  - "보기", "해석" 버튼

### 4.3 UI 탭 2: 캘린더 탭 (app/(dashboard)/calendar/page.tsx)
- [ ] CalendarView 컴포넌트: `components/calendar-view.tsx`
- [ ] 월별 캘린더 UI (7x6 그리드)
- [ ] 해당 월의 꿈 데이터 조회
- [ ] 꿈 있는 날짜에 감정별 색상 점 표시
  - 🟢 긍정 (green), 🟡 중립 (yellow), 🔴 부정 (red)
- [ ] 날짜 클릭 → 해당 날짜의 꿈 상세 표시 (하단)
- [ ] 이전/다음 달 네비게이션 버튼

### 4.4 UI 탭 3: 통계 탭 (app/(dashboard)/stats/page.tsx)
- [ ] 통계 요약 카드 3개
  - 이번 달 기록 일수
  - 최장 스트릭
  - 주된 감정 (백분율)
- [ ] StatsCharts 컴포넌트: `components/stats-charts.tsx`
- [ ] Recharts 사용
  - 감정 분포 Pie Chart (PieChart, Pie, Cell)
  - 월별 기록 일수 Bar Chart (BarChart, Bar, XAxis, YAxis)
  - 생생함 추이 Line Chart (LineChart, Line, XAxis, YAxis)
- [ ] 자주 나오는 태그 (Badge 컴포넌트 사용)
- [ ] 기간 필터: "이번 주", "이번 달" (Tabs 사용)

### 4.5 UI 탭 4: 해석 탭 (app/(dashboard)/interpret/page.tsx)
- [ ] 꿈 선택 드롭다운 (Select 컴포넌트)
- [ ] "AI 해석 생성" 버튼
  - 로딩 상태 표시 (Loader2 아이콘)
  - /api/interpret 호출
- [ ] 해석 결과 표시 (Card 컴포넌트)
  - 🎯 전체 해석
  - 🧠 심리학적 관점
  - 🔮 상징적 의미
  - 💬 메시지
- [ ] 발견된 상징 섹션
  - /api/symbols 호출 결과 표시
  - 상징별 카드 (이모지, 이름, 의미)

### 4.6 UI 탭 5: 패턴 탭 (app/(dashboard)/patterns/page.tsx)
- [ ] "패턴 재분석" 버튼
  - /api/patterns POST 호출
- [ ] 반복되는 테마 섹션
  - patterns 테이블 조회 (type: 'theme')
  - 각 패턴을 Card로 표시
  - 패턴 이름, 발생 횟수, 설명, 의미, 관련 꿈 날짜
- [ ] 자주 등장하는 인물 섹션 (type: 'person')
- [ ] 반복되는 장소 섹션 (type: 'place')
- [ ] AI 주간 인사이트 섹션
  - GET /api/insights 호출
  - 요약, 주요 테마, 감정 흐름, 잠재의식 메시지, 다음 주 포인트 표시

### 4.7 빈 상태 UI 처리
- [ ] EmptyState 컴포넌트: `components/empty-state.tsx`
- [ ] 꿈이 없을 때 표시
- [ ] 해석이 없을 때 표시
- [ ] 패턴이 없을 때 표시

### 4.8 로딩 & 에러 상태 처리
- [ ] 로딩 스피너 컴포넌트: `components/loading-spinner.tsx`
- [ ] AI 요청 중 로딩 상태 표시
- [ ] Toast 알림 설정 (shadcn/ui toast 또는 sonner)
- [ ] 에러 메시지 표시 (사용자 친화적)

### 4.9 **CRITICAL: npm run build 검증**
- [ ] 터미널에서 `npm run build` 실행
- [ ] 빌드 성공 확인
- [ ] **CRITICAL: 빌드 에러 0 확인**
- [ ] TypeScript 타입 에러 없음 확인
- [ ] 사용하지 않는 import 없음 확인

### 4.10 Test: 브라우저 수동 테스트
- [ ] `npm run dev` 실행
- [ ] 브라우저에서 http://localhost:3000 접속
- [ ] **오늘 탭**
  - 꿈 작성 폼 렌더링 확인
  - 제목, 내용 입력 테스트
  - 감정 선택 (라디오 버튼)
  - 생생함 슬라이더 (1-5)
  - 저장 버튼 클릭 → DB 저장 확인
  - AI 해석 받기 버튼 → 로딩 표시, 해석 결과 표시
- [ ] **캘린더 탭**
  - 월별 캘린더 렌더링
  - 꿈 있는 날짜에 색상 점 표시
  - 날짜 클릭 → 꿈 상세 표시
- [ ] **통계 탭**
  - 3개 차트 렌더링
  - 데이터 정확성 확인
- [ ] **해석 탭**
  - 꿈 선택 드롭다운
  - AI 해석 생성 및 결과 표시
- [ ] **패턴 탭**
  - 패턴 목록 표시
  - 주간 인사이트 표시

### 4.11 Git 커밋
- [ ] `git add .`
- [ ] `git commit -m "Phase 4: UI 구현 완료 - 5개 탭 (오늘, 캘린더, 통계, 해석, 패턴)"`
- [ ] `docs/IMPLEMENTATION.md` 업데이트

---

## Phase 5: 통합 & 테스트 (10분)

### 5.1 검색 & 필터 기능 구현
- [ ] SearchBar 컴포넌트: `components/search-bar.tsx`
- [ ] 검색 입력 필드 (제목, 내용 검색)
- [ ] 필터 옵션
  - 날짜 범위 (DatePicker 사용)
  - 감정별 (Checkbox 그룹)
  - 생생함 범위 (Slider)
  - 태그 선택 (Multi-select)
- [ ] Server Action: `searchDreams(filters: SearchFilters)` 작성
- [ ] Zod 검증 스키마: `searchSchema`
- [ ] 검색 결과 표시 (DreamCard 리스트)

### 5.2 전체 통합
- [ ] 모든 탭 간 네비게이션 동작 확인
- [ ] 꿈 작성 → 해석 → 패턴 탐지 전체 플로우 테스트
- [ ] 상태 관리 확인 (Server Actions revalidation)
- [ ] 에러 핸들링 통합 테스트
  - AI API 키 없을 때
  - DB 연결 실패 시
  - 잘못된 입력값

### 5.3 E2E 테스트 (수동)
- [ ] **시나리오 1: 새 꿈 작성 플로우**
  1. 오늘 탭에서 꿈 작성
  2. 저장 버튼 클릭
  3. 최근 꿈 리스트에 표시 확인
  4. 캘린더 탭에서 해당 날짜에 점 표시 확인
- [ ] **시나리오 2: AI 해석 플로우**
  1. 오늘 탭에서 "AI 해석 받기" 클릭
  2. 로딩 상태 표시 확인
  3. 해석 결과 표시 확인
  4. 해석 탭에서 동일한 해석 확인
- [ ] **시나리오 3: 패턴 분석 플로우**
  1. 여러 개의 꿈 작성 (최소 3개, 유사한 주제)
  2. 패턴 탭에서 "패턴 재분석" 클릭
  3. 반복되는 테마 표시 확인
- [ ] **시나리오 4: 통계 확인 플로우**
  1. 다양한 감정의 꿈 작성
  2. 통계 탭에서 감정 분포 차트 확인
  3. 생생함 추이 차트 확인
- [ ] **시나리오 5: 검색 & 필터 플로우**
  1. 검색바에 키워드 입력
  2. 필터 옵션 선택
  3. 검색 결과 정확성 확인

### 5.4 성능 최적화
- [ ] 이미지 최적화 (Next.js Image 컴포넌트 사용)
- [ ] 불필요한 리렌더링 방지 (React.memo 사용)
- [ ] DB 쿼리 최적화 (필요한 필드만 select)
- [ ] AI API 호출 최적화 (중복 호출 방지)

### 5.5 접근성 & UX 개선
- [ ] 키보드 네비게이션 확인 (Tab, Enter)
- [ ] 포커스 스타일 확인
- [ ] 에러 메시지 명확성 확인
- [ ] 로딩 상태 일관성 확인
- [ ] 반응형 디자인 확인 (모바일, 태블릿, 데스크톱)

### 5.6 **CRITICAL: npm run build 검증**
- [ ] 터미널에서 `npm run build` 실행
- [ ] 빌드 성공 확인
- [ ] **CRITICAL: 빌드 에러 0 확인**
- [ ] 빌드 크기 확인 (너무 크지 않은지)
- [ ] 프로덕션 빌드 실행: `npm start`
- [ ] 프로덕션 모드에서 동작 확인

### 5.7 Test: PRD Section 8 전체 체크리스트
- [ ] **8.1 꿈 기록**
  - [ ] 꿈 작성 (제목, 내용, 감정, 생생함)
  - [ ] 꿈 수정
  - [ ] 꿈 삭제
  - [ ] 태그 부여/제거
- [ ] **8.2 AI 기능**
  - [ ] AI 꿈 해석 요청 → 결과 저장
  - [ ] 상징 자동 추출
  - [ ] 패턴 탐지
  - [ ] 주간 인사이트 생성
  - [ ] AI 에러 시 적절한 메시지
- [ ] **8.3 뷰**
  - [ ] 캘린더에서 날짜 선택 → 꿈 표시
  - [ ] 검색 동작
  - [ ] 감정별 색상 구분
- [ ] **8.4 통계**
  - [ ] 감정 분포 차트 정확
  - [ ] 생생함 추이 차트 정확
  - [ ] 태그 통계 정확

### 5.8 코드 정리
- [ ] 사용하지 않는 파일 삭제
- [ ] 사용하지 않는 import 제거
- [ ] 콘솔 로그 제거 (프로덕션)
- [ ] 주석 정리 (불필요한 주석 삭제, 중요한 주석 유지)
- [ ] ESLint 경고 해결: `npm run lint`
- [ ] 코드 포맷팅: `npx prettier --write .` (선택)

### 5.9 문서 작성
- [ ] `README.md` 업데이트
  - 프로젝트 소개
  - 설치 방법
  - 환경 변수 설정
  - 실행 방법
  - 기능 목록
- [ ] `docs/IMPLEMENTATION.md` 최종 업데이트
  - 각 Phase 완료 날짜/시간 기록
  - 발생한 문제 및 해결 방법 기록
  - 최종 성공 기준 체크

### 5.10 Git 커밋 & 태그
- [ ] `git add .`
- [ ] `git commit -m "Phase 5: 통합 & 테스트 완료 - 검색/필터, E2E 테스트, 문서화"`
- [ ] `git tag -a v1.0.0 -m "AI Dream Journal v1.0.0 - 완성"`
- [ ] `git push origin main --tags`

---

## 최종 검증 체크리스트

### 기능 (9개 피처)
- [ ] ✅ 꿈 일기 CRUD
- [ ] ✅ 태그 시스템
- [ ] ✅ 캘린더 뷰
- [ ] ✅ 검색 & 필터
- [ ] ✅ 통계 대시보드
- [ ] ✅ AI 꿈 해석
- [ ] ✅ AI 상징 분석
- [ ] ✅ AI 패턴 발견
- [ ] ✅ AI 주간 인사이트

### 코드 품질
- [ ] ✅ TypeScript strict mode (타입 에러 0)
- [ ] ✅ Zod 검증 (클라이언트/서버)
- [ ] ✅ 에러 핸들링 (AppError, errorHandler)
- [ ] ✅ 로깅 (logger 사용)

### 성능
- [ ] ✅ DB 인덱스 최적화
- [ ] ✅ AI API 재시도 로직
- [ ] ✅ 캐싱 (Next.js cache)
- [ ] ✅ 병렬 처리 (Promise.all)

### 보안
- [ ] ✅ 환경 변수 보호 (.env.local, Zod 검증)
- [ ] ✅ SQL Injection 방지 (Drizzle ORM)
- [ ] ✅ XSS 방지 (React 기본 이스케이프)
- [ ] ✅ 입력 검증 (Zod 스키마)

### 문서
- [ ] ✅ PRD.md
- [ ] ✅ ARCHITECTURE.md
- [ ] ✅ DATABASE.md
- [ ] ✅ CLAUDE.md
- [ ] ✅ IMPLEMENTATION_PLAN.md (이 파일)
- [ ] ✅ IMPLEMENTATION.md (실제 구현 로그)
- [ ] ✅ README.md

---

## 성공 기준 (PRD Section 9)

- [ ] ✅ 9개 피처 모두 동작
- [ ] ✅ AI 해석 정확도 높음
- [ ] ✅ 상징/패턴 분석 의미 있음
- [ ] ✅ 차트 시각화 명확
- [ ] ✅ 반응형 UI
- [ ] ✅ 에러 핸들링 완벽
- [ ] ✅ 예상 시간: 90분

---

**프로젝트 완료! 🎉🌙✨**
