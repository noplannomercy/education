# AI Personal Finance - Deployment Guide

## 1. 배포 전 체크리스트

### 1.1 코드 준비
- [ ] TypeScript 컴파일 에러 없음 (`npm run build`)
- [ ] ESLint 경고/에러 해결 (`npm run lint`)
- [ ] 모든 테스트 통과 (`npm run test`)
- [ ] 환경 변수 확인 (`.env.local`, `.env.production`)
- [ ] 불필요한 console.log 제거
- [ ] API 키가 코드에 하드코딩되지 않음

### 1.2 데이터베이스 준비
- [ ] 로컬 DB 스키마 최신화
- [ ] 개발 DB 스키마 최신화
- [ ] 시드 데이터 적용 (카테고리)
- [ ] 인덱스 생성 확인

### 1.3 외부 서비스
- [ ] OpenRouter API 키 유효성 확인
- [ ] API 사용량 한도 확인
- [ ] Vercel 프로젝트 연결

---

## 2. 로컬 DB 생성

### 2.1 Docker PostgreSQL 컨테이너 실행
```bash
# PostgreSQL 컨테이너 시작 (이미 실행 중이면 생략)
docker run -d \
  --name postgres-local \
  -e POSTGRES_USER=budget \
  -e POSTGRES_PASSWORD=budget123 \
  -p 5432:5432 \
  postgres:15

# 컨테이너 상태 확인
docker ps
```

### 2.2 데이터베이스 생성
```bash
# 컨테이너 접속
docker exec -it postgres-local psql -U budget

# DB 생성 (psql 내부)
CREATE DATABASE personal_finance;

# 확인
\l

# 종료
\q
```

### 2.3 연결 테스트
```bash
# 연결 문자열
postgresql://budget:budget123@localhost:5432/personal_finance

# psql로 직접 연결
docker exec -it postgres-local psql -U budget -d personal_finance
```

---

## 3. 개발 DB 생성 (Hostinger SSH)

### 3.1 SSH 접속
```bash
# Hostinger VPS 접속
ssh user@193.168.195.222
```

### 3.2 PostgreSQL 설치 (최초 1회)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.3 사용자 및 DB 생성
```bash
# postgres 유저로 전환
sudo -u postgres psql

# 사용자 생성
CREATE USER budget WITH PASSWORD 'budget123';

# DB 생성
CREATE DATABASE personal_finance OWNER budget;

# 권한 부여
GRANT ALL PRIVILEGES ON DATABASE personal_finance TO budget;

# 확인
\l

# 종료
\q
```

### 3.4 원격 접속 허용
```bash
# postgresql.conf 수정
sudo nano /etc/postgresql/15/main/postgresql.conf

# 아래 줄 수정
listen_addresses = '*'

# pg_hba.conf 수정
sudo nano /etc/postgresql/15/main/pg_hba.conf

# 아래 줄 추가 (파일 끝)
host    all    all    0.0.0.0/0    md5

# PostgreSQL 재시작
sudo systemctl restart postgresql
```

### 3.5 연결 테스트
```bash
# 로컬에서 개발 DB 연결 테스트
psql postgresql://budget:budget123@193.168.195.222:5432/personal_finance
```

---

## 4. 마이그레이션

### 4.1 환경 변수 설정
```bash
# .env.local (로컬 개발)
DATABASE_URL=postgresql://budget:budget123@localhost:5432/personal_finance
OPENROUTER_API_KEY=your_openrouter_api_key

# .env.development (개발 서버)
DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/personal_finance
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 4.2 로컬 DB 마이그레이션
```bash
# 마이그레이션 생성
npx drizzle-kit generate:pg

# 로컬 DB에 적용
npx drizzle-kit push:pg

# 또는 명시적 URL 지정
DATABASE_URL=postgresql://budget:budget123@localhost:5432/personal_finance npx drizzle-kit push:pg
```

### 4.3 개발 DB 마이그레이션
```bash
# 개발 DB에 적용 (Windows CMD)
set DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/personal_finance && npx drizzle-kit push:pg

# 개발 DB에 적용 (Windows PowerShell)
$env:DATABASE_URL="postgresql://budget:budget123@193.168.195.222:5432/personal_finance"; npx drizzle-kit push:pg

# 개발 DB에 적용 (Linux/Mac)
DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/personal_finance npx drizzle-kit push:pg
```

### 4.4 양쪽 DB 동시 마이그레이션 스크립트
```bash
# scripts/migrate-all.sh
#!/bin/bash

echo "=== 로컬 DB 마이그레이션 ==="
DATABASE_URL=postgresql://budget:budget123@localhost:5432/personal_finance npx drizzle-kit push:pg

echo ""
echo "=== 개발 DB 마이그레이션 ==="
DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/personal_finance npx drizzle-kit push:pg

echo ""
echo "=== 마이그레이션 완료 ==="
```

```powershell
# scripts/migrate-all.ps1 (Windows PowerShell)
Write-Host "=== 로컬 DB 마이그레이션 ===" -ForegroundColor Green
$env:DATABASE_URL="postgresql://budget:budget123@localhost:5432/personal_finance"
npx drizzle-kit push:pg

Write-Host ""
Write-Host "=== 개발 DB 마이그레이션 ===" -ForegroundColor Green
$env:DATABASE_URL="postgresql://budget:budget123@193.168.195.222:5432/personal_finance"
npx drizzle-kit push:pg

Write-Host ""
Write-Host "=== 마이그레이션 완료 ===" -ForegroundColor Green
```

### 4.5 package.json 스크립트 추가
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:push:local": "DATABASE_URL=postgresql://budget:budget123@localhost:5432/personal_finance drizzle-kit push:pg",
    "db:push:dev": "DATABASE_URL=postgresql://budget:budget123@193.168.195.222:5432/personal_finance drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx lib/db/seed.ts"
  }
}
```

---

## 5. Vercel 환경 변수

### 5.1 Vercel 대시보드 설정
1. Vercel 프로젝트 → Settings → Environment Variables
2. 다음 변수 추가:

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://budget:budget123@193.168.195.222:5432/personal_finance` | Production, Preview |
| `OPENROUTER_API_KEY` | `sk-or-v1-xxxxx` | Production, Preview |

### 5.2 Vercel CLI로 설정
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 환경 변수 추가
vercel env add DATABASE_URL production
vercel env add OPENROUTER_API_KEY production

# 환경 변수 확인
vercel env ls
```

### 5.3 vercel.json 설정 (선택)
```json
{
  "framework": "nextjs",
  "regions": ["icn1"],
  "env": {
    "DATABASE_URL": "@database_url",
    "OPENROUTER_API_KEY": "@openrouter_api_key"
  }
}
```

---

## 6. React 배포 주의사항

### 6.1 Hydration 에러 방지

**문제:** 서버 렌더링과 클라이언트 렌더링 결과 불일치

```typescript
// ❌ 잘못된 예 - 서버/클라이언트 불일치
function Component() {
  return <p>{new Date().toLocaleString()}</p>  // 시간 차이로 불일치
}

// ✅ 올바른 예 - useEffect로 클라이언트에서만 실행
function Component() {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    setTime(new Date().toLocaleString())
  }, [])

  return <p>{time || '로딩 중...'}</p>
}
```

### 6.2 Dynamic Import (차트, 클라이언트 전용 컴포넌트)

```typescript
// ❌ 잘못된 예 - SSR에서 에러
import { PieChart } from 'recharts'

// ✅ 올바른 예 - Dynamic Import
import dynamic from 'next/dynamic'

const PieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false, loading: () => <div>차트 로딩...</div> }
)

// 또는 전체 컴포넌트를 dynamic import
const CategoryPieChart = dynamic(
  () => import('@/components/charts/category-pie-chart'),
  { ssr: false }
)
```

### 6.3 localStorage 사용

```typescript
// ❌ 잘못된 예 - 서버에서 에러
const theme = localStorage.getItem('theme')

// ✅ 올바른 예 - 클라이언트 체크
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key)
      if (stored) {
        setValue(JSON.parse(stored))
      }
    }
  }, [key])

  const setStoredValue = (newValue: T) => {
    setValue(newValue)
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(newValue))
    }
  }

  return [value, setStoredValue] as const
}
```

### 6.4 'use client' 지시어

```typescript
// 클라이언트 컴포넌트 명시
'use client'

import { useState, useEffect } from 'react'

export function InteractiveComponent() {
  const [count, setCount] = useState(0)
  // ...
}
```

### 6.5 환경 변수 접근

```typescript
// ❌ 서버 전용 변수를 클라이언트에서 사용
const apiKey = process.env.OPENROUTER_API_KEY  // undefined in client

// ✅ 클라이언트용 변수는 NEXT_PUBLIC_ 접두사
const publicKey = process.env.NEXT_PUBLIC_APP_URL

// ✅ 서버 전용 변수는 Server Component/Action에서만
// app/actions/ai-actions.ts
'use server'
const apiKey = process.env.OPENROUTER_API_KEY  // OK
```

---

## 7. 배포 후 확인

### 7.1 기능 체크리스트
- [ ] 메인 페이지 로딩
- [ ] 거래 목록 조회
- [ ] 거래 추가/수정/삭제
- [ ] 카테고리 관리
- [ ] 예산 설정
- [ ] AI 분석 기능 (지출 패턴, 예산 제안, 이상 거래, 저축 조언)
- [ ] 차트 렌더링 (Pie, Line, Bar)
- [ ] 모바일 반응형

### 7.2 성능 확인
```bash
# Lighthouse 점수 확인
# Chrome DevTools → Lighthouse → Generate report

# 목표 점수
# - Performance: 90+
# - Accessibility: 90+
# - Best Practices: 90+
# - SEO: 90+
```

### 7.3 에러 모니터링
```bash
# Vercel 대시보드에서 확인
# - Functions 탭: 서버 에러
# - Analytics 탭: 성능 메트릭
# - Logs 탭: 실시간 로그
```

---

## 8. 트러블슈팅

### 8.1 DB 연결 실패
```
Error: connect ECONNREFUSED 193.168.195.222:5432
```
**해결:**
1. PostgreSQL 서비스 실행 확인: `sudo systemctl status postgresql`
2. 방화벽 포트 확인: `sudo ufw allow 5432`
3. pg_hba.conf 원격 접속 설정 확인

### 8.2 Drizzle 마이그레이션 실패
```
Error: relation "categories" does not exist
```
**해결:**
```bash
# 스키마 재생성
npx drizzle-kit push:pg --force
```

### 8.3 Hydration 에러
```
Error: Hydration failed because the initial UI does not match
```
**해결:**
1. 서버/클라이언트 불일치 코드 찾기
2. `useEffect`로 클라이언트 전용 로직 이동
3. `suppressHydrationWarning` 속성 추가 (임시)

### 8.4 차트 렌더링 에러
```
Error: "window" is not defined
```
**해결:**
```typescript
// Dynamic import with ssr: false
const Chart = dynamic(() => import('./chart'), { ssr: false })
```

### 8.5 API 키 누락
```
Error: OPENROUTER_API_KEY is not defined
```
**해결:**
1. Vercel 환경 변수 설정 확인
2. 재배포: `vercel --prod`

### 8.6 빌드 타임아웃
```
Error: Build exceeded maximum duration
```
**해결:**
1. 불필요한 의존성 제거
2. `next.config.js`에서 최적화:
```javascript
module.exports = {
  swcMinify: true,
  experimental: {
    optimizeCss: true,
  },
}
```

### 8.7 CORS 에러
```
Error: CORS policy blocked
```
**해결:**
- Server Action 사용 (CORS 우회)
- 또는 API Route에 CORS 헤더 추가

---

## 9. 배포 명령어 요약

```bash
# 1. 로컬 테스트
npm run dev
npm run build
npm run start

# 2. DB 마이그레이션
npm run db:push:local   # 로컬
npm run db:push:dev     # 개발

# 3. Vercel 배포
vercel                  # Preview 배포
vercel --prod           # Production 배포

# 4. 로그 확인
vercel logs
```
