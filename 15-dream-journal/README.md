# AI Dream Journal

AI 기반 꿈 일기 애플리케이션 - Claude Haiku 4.5를 활용한 지능형 꿈 분석 시스템

## 주요 기능

### 1. 꿈 기록 (오늘 탭)
- **간편한 입력 폼**: 제목, 내용, 날짜, 감정, 생생함, 자각몽 여부
- **자동 저장**: Server Actions를 통한 실시간 데이터 저장
- **최근 꿈 목록**: 최근 10개의 꿈 기록을 카드 형태로 표시

### 2. AI 해석 (해석 탭)
- **4가지 관점의 종합 분석**:
  - 전체적인 해석
  - 심리학적 관점 (프로이트, 융)
  - 상징적 의미
  - 꿈이 전하는 메시지
- **Claude Haiku 4.5 모델** 사용으로 빠르고 정확한 분석

### 3. 상징 추출
- **5개 카테고리로 분류**: person, place, object, action, emotion
- **의미 설명**: 각 상징의 일반적 의미 자동 생성
- **빈도 추적**: 반복되는 상징 패턴 분석

### 4. 패턴 분석 (패턴 탭)
- **4가지 패턴 유형**: theme, person, place, emotion
- **반복 패턴 탐지**: 최근 20개 꿈에서 공통 요소 발견
- **주간 인사이트**: 지난 7일간의 꿈 종합 분석

### 5. 통계 & 캘린더
- **감정 분포 차트**: 긍정/중립/부정 비율 시각화
- **월별 기록**: 꿈 기록 빈도 추적
- **생생함 추이**: 시간에 따른 꿈의 생생함 변화

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS 3, shadcn/ui
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Anthropic Claude Haiku 4.5 (via Open Router)
- **Validation**: Zod
- **Charts**: Recharts
- **Forms**: react-hook-form

## 프로젝트 구조

```
day15-dream-journal/
├── app/
│   ├── api/              # AI API routes
│   │   ├── interpret/    # 꿈 해석 API
│   │   ├── symbols/      # 상징 추출 API
│   │   ├── patterns/     # 패턴 분석 API
│   │   └── insights/     # 주간 인사이트 API
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page with 5 tabs
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── dreams/           # Dream-related components
│   ├── calendar/         # Calendar view
│   ├── stats/            # Statistics charts
│   ├── interpretation/   # AI interpretation display
│   └── patterns/         # Pattern analysis
├── lib/
│   ├── db/              # Database
│   │   ├── schema.ts    # Drizzle schema (4 tables)
│   │   └── index.ts     # DB client
│   ├── actions/         # Server Actions
│   │   └── dreams.ts    # CRUD operations
│   ├── ai/              # AI integration
│   │   ├── config.ts    # Open Router setup
│   │   └── functions.ts # 4 AI functions
│   ├── errors.ts        # Custom error classes
│   ├── error-handler.ts # Error handling & retry logic
│   ├── logger.ts        # Logging utility
│   └── utils.ts         # Helper functions
├── docs/
│   ├── PRD.md           # Product Requirements
│   ├── ARCHITECTURE.md  # System architecture
│   ├── DATABASE.md      # Database design
│   └── IMPLEMENTATION_PLAN.md
├── drizzle/             # Migration files
└── scripts/
    └── create-db.js     # Database creation script
```

## 설치 및 실행

### 1. 필수 요구사항

- Node.js 18+
- PostgreSQL 14+
- Open Router API Key (Claude 접근용)

### 2. 프로젝트 설정

```bash
cd day15-dream-journal

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
```

### 3. 환경 변수 (.env.local)

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dream_journal"

# Open Router AI API
OPENROUTER_API_KEY="sk-or-v1-your-api-key"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. 데이터베이스 설정

```bash
# 데이터베이스 생성 (필요시)
node scripts/create-db.js

# 스키마 마이그레이션
npm run db:migrate

# 또는 직접 푸시
npm run db:push

# Drizzle Studio로 확인 (선택사항)
npm run db:studio
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 6. 프로덕션 빌드

```bash
npm run build
npm start
```

## 주요 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build
npm start

# 타입 체크
npm run type-check

# 린트
npm run lint

# 데이터베이스
npm run db:generate    # 마이그레이션 생성
npm run db:migrate     # 마이그레이션 실행
npm run db:push        # 스키마 직접 푸시
npm run db:studio      # Drizzle Studio 실행
```

## 데이터베이스 스키마

### 4개의 주요 테이블

1. **dreams**: 꿈 기록 (9 필드)
   - 제목, 내용, 날짜, 감정, 생생함, 자각몽 여부 등

2. **interpretations**: AI 해석 (7 필드)
   - 1:1 관계, CASCADE DELETE
   - 전체 해석, 심리학적, 상징적, 메시지

3. **symbols**: 상징 (7 필드)
   - 1:N 관계
   - 상징명, 카테고리, 의미, 빈도

4. **patterns**: 패턴 (9 필드)
   - M:N 관계 (TEXT[] 배열 사용)
   - 패턴 유형, 설명, 발생 횟수, 의미

### 관계도

```
dreams 1──1 interpretations
dreams 1──N symbols
patterns N──M dreams (TEXT[] array)
```

## API 엔드포인트

### POST /api/interpret
꿈 해석 생성 (Claude Haiku 4.5)

```json
{
  "dreamId": "uuid"
}
```

### POST /api/symbols
상징 추출 및 저장

```json
{
  "dreamId": "uuid"
}
```

### POST /api/patterns
패턴 분석 (최근 20개 꿈)

```json
{}
```

### POST /api/insights
주간 인사이트 (최근 7일)

```json
{}
```

## 개발 가이드

### 새 컴포넌트 추가

```bash
# shadcn/ui 컴포넌트
npx shadcn-ui@latest add [component-name]
```

### 데이터베이스 스키마 수정

1. `lib/db/schema.ts` 수정
2. 마이그레이션 생성: `npm run db:generate`
3. 마이그레이션 실행: `npm run db:migrate`

### AI 함수 추가

`lib/ai/functions.ts`에 새 함수 추가 후 `lib/error-handler.ts`의 `callAIWithRetry`로 래핑

## 에러 처리

### 계층 구조

- `AppError`: 기본 에러 클래스
- `ValidationError`: 입력 검증 실패 (400)
- `AIServiceError`: AI 서비스 오류 (503)
- `DatabaseError`: 데이터베이스 오류 (500)
- `NotFoundError`: 리소스 없음 (404)

### 재시도 로직

- **3회 재시도** with exponential backoff
- Rate limit 에러 시 5배 더 긴 대기 시간
- 모든 AI 호출에 자동 적용

## 성능 최적화

### Database
- 11개 전략적 인덱스
- CASCADE DELETE로 참조 무결성
- TEXT[] 배열로 M:N 관계 단순화

### AI API
- Claude Haiku 4.5 사용 (빠르고 경제적)
- 재시도 로직으로 안정성 확보
- 결과 DB 저장으로 중복 호출 방지

### Frontend
- Server Components로 초기 로딩 최적화
- Server Actions로 클라이언트 번들 크기 감소
- Dynamic imports로 코드 분할

## 보안

- ✅ 환경 변수로 민감 정보 관리
- ✅ SQL Injection 방지 (Drizzle ORM)
- ✅ XSS 방지 (React 자동 이스케이핑)
- ✅ Zod 검증으로 입력 유효성 확인
- ✅ Server Actions로 API 엔드포인트 보호

## 트러블슈팅

### 데이터베이스 연결 실패
```bash
# PostgreSQL 서버 상태 확인
psql -h host -U user -d postgres

# 연결 문자열 확인
echo $DATABASE_URL
```

### AI API 오류
- Open Router API 키 확인
- 잔액 확인 (https://openrouter.ai/credits)
- Rate limit 확인

### 빌드 오류
```bash
# 클린 빌드
rm -rf .next node_modules
npm install
npm run build
```

## 라이선스

MIT

## 제작

- **AI Model**: Claude Haiku 4.5 (Anthropic)
- **Framework**: Next.js 14
- **Database**: PostgreSQL + Drizzle ORM
- **UI**: shadcn/ui + Tailwind CSS

---

**Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>**
