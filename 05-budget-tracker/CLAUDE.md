# 3.4.budget-tracker

## 프로젝트 개요

Neo-Brutalism 스타일의 가계부 앱.
수입/지출 관리, 카테고리별 분류, 월별 요약 및 통계 기능.
Next.js 15 App Router + better-auth + Drizzle ORM + SQLite 기반.

## 스킬 위치

`.claude/skills/budget-tracker/` — 아키텍처, DB 스키마, API 규칙, 컨벤션 표준

작업 시작 전 반드시 budget-tracker 스킬을 로드할 것.

## 주요 명령어

```bash
npm run dev          # 개발 서버 실행 (http://localhost:3012)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 실행

npx drizzle-kit generate   # 마이그레이션 파일 생성
npx drizzle-kit push       # 스키마 DB 적용
npx drizzle-kit studio     # Drizzle Studio (DB GUI)

npm run test:e2e     # E2E 테스트 실행
```

## 환경 설정

- `.env.local` — BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_BETTER_AUTH_URL
- DB: `budget.db` (SQLite)
- 포트: **3012** (BETTER_AUTH_URL, NEXT_PUBLIC_BETTER_AUTH_URL, playwright 모두 동일)

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Auth**: better-auth
- **ORM**: Drizzle ORM
- **DB**: SQLite (better-sqlite3)
- **Validation**: Zod
- **Styling**: Tailwind CSS v4
