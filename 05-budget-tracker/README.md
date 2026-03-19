# 05-budget-tracker

바이브코딩 워크샵 3막 — 스펙 주도 개발 시연용 가계부 앱.
SRS 기반 설계 → 구현 → E2E 테스트까지 전 과정.

---

## 어떻게 만들었나

### 1단계 — SRS 작성

```
Neo-Brutalism 스타일 가계부 앱 SRS 작성해줘.
스택: Next.js 15 App Router, better-auth, Drizzle ORM (SQLite)
기능: 인증, 카테고리 관리, 거래 관리, 월별 대시보드
```

→ `docs/SRS.md` 생성 (인증/카테고리/거래/대시보드 요구사항 ID별 정의)

### 2단계 — 구현 플랜 생성

Superpowers가 SRS를 읽고 Phase별 구현 플랜 자동 생성.

### 3단계 — Phase별 구현

| Phase | 내용 |
|-------|------|
| Phase 1 | 프로젝트 초기 설정 (Next.js + Drizzle + better-auth) |
| Phase 2 | DB 스키마 + 마이그레이션 |
| Phase 3 | 인증 (회원가입/로그인/로그아웃) |
| Phase 4 | 카테고리 CRUD |
| Phase 5 | 거래 CRUD |
| Phase 6 | 대시보드 (월별 요약, 카테고리별 집계) |
| Phase 7 | E2E 테스트 (Playwright) |

### 4단계 — E2E 테스트

Playwright로 실제 브라우저 기반 전 기능 검증.
실제 UI를 탐색해서 테스트 스펙 작성 → 전 케이스 통과 확인.

→ `TEST-DECISIONS.md` — UI 실측 결과 및 테스트 결정 사항

---

## 실행 방법

```bash
npm install
npm run dev
# → http://localhost:3000
```

E2E 테스트:
```bash
npx playwright test
npx playwright show-report
```

---

## 스택

- **프레임워크**: Next.js 15 App Router
- **인증**: better-auth
- **ORM**: Drizzle ORM
- **DB**: SQLite (dev) / PostgreSQL (prod)
- **스타일**: Tailwind CSS (Neo-Brutalism)
- **테스트**: Playwright

---

## 기능

- 이메일/비밀번호 회원가입 · 로그인
- 카테고리 관리 (수입/지출 구분, 색상)
- 거래 CRUD (금액, 카테고리, 날짜, 메모)
- 월별 대시보드 (총 수입/지출/잔액, 카테고리별 집계)
- 사용자별 데이터 격리

---

## 이전 막과의 차이점

| | 1막 (맨손/PRD) | 2막 (Superpowers) | 3막 (SRS) |
|--|--------------|-------------------|-----------|
| 설계 문서 | 없음 / PRD | PRD | SRS (요구사항 ID) |
| 스택 | HTML/CSS/JS | HTML/CSS/JS | Next.js + DB + 인증 |
| 테스트 | 없음 | 없음 | Playwright E2E |
| 배포 가능 | 정적 파일 | 정적 파일 | 서버 필요 |

---

## 문서

- `docs/SRS.md` — 기능 요구사항 명세
- `docs/IMPLEMENTATION.md` — 구현 상세
- `TEST-DECISIONS.md` — E2E 테스트 결정 사항
