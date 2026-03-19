# SRS — 가계부 (Budget Tracker)

**버전:** 1.0
**작성일:** 2026-03-19

---

## 1. 프로젝트 개요

Neo-Brutalism 스타일의 개인 가계부 앱.
수입/지출 거래를 카테고리별로 관리하고, 월별 요약으로 재정 흐름을 파악한다.
회원가입/로그인 기반 — 사용자별 데이터 격리.

---

## 2. 기능 요구사항

### 인증

| ID | 요구사항 |
|----|---------|
| AUTH-01 | 이메일 + 비밀번호로 회원가입 |
| AUTH-02 | 이메일 + 비밀번호로 로그인 |
| AUTH-03 | 로그아웃 |
| AUTH-04 | 미인증 사용자는 `/login`으로 리다이렉트 |

### 카테고리

| ID | 요구사항 |
|----|---------|
| CAT-01 | 카테고리 생성 (이름, 타입: 수입/지출, 색상) |
| CAT-02 | 카테고리 목록 조회 (타입별 필터) |
| CAT-03 | 카테고리 수정 (이름, 색상) |
| CAT-04 | 카테고리 삭제 (연결된 거래는 categoryId → null) |
| CAT-05 | 카테고리는 사용자 소유 — 타인 카테고리 접근 불가 |
| CAT-06 | 회원가입 시 기본 카테고리 4개 자동 생성 (급여/식비/교통/주거) |

### 거래

| ID | 요구사항 |
|----|---------|
| TRX-01 | 거래 생성 (금액, 타입: 수입/지출, 카테고리, 설명, 날짜) |
| TRX-02 | 거래 목록 조회 (최신순 정렬) |
| TRX-03 | 거래 필터 — 연/월, 카테고리, 타입 |
| TRX-04 | 거래 수정 |
| TRX-05 | 거래 삭제 |
| TRX-06 | 거래는 사용자 소유 — 타인 거래 접근 불가 |
| TRX-07 | 금액은 양수만 허용, 타입(income/expense)으로 구분 |

### 대시보드 요약

| ID | 요구사항 |
|----|---------|
| DASH-01 | 선택한 월의 총 수입 합계 표시 |
| DASH-02 | 선택한 월의 총 지출 합계 표시 |
| DASH-03 | 선택한 월의 잔액 (수입 - 지출) 표시 |
| DASH-04 | 카테고리별 지출 집계 표시 |
| DASH-05 | 최근 거래 5건 표시 |
| DASH-06 | 월 선택 UI (이전/다음 월 이동) |

---

## 3. 데이터 모델

### 엔티티 관계

```
user (better-auth 관리)
  ├── categories (1:N) — userId FK
  └── transactions (1:N) — userId FK
           └── categories (N:1) — categoryId FK (nullable)
```

### 핵심 필드

**categories**
- id, userId, name, type(income|expense), color, createdAt, updatedAt

**transactions**
- id, userId, categoryId(nullable), amount(양수), type(income|expense), description, date(YYYY-MM-DD), createdAt, updatedAt

---

## 4. 화면 목록

| URL | 화면 | 인증 |
|-----|------|------|
| `/login` | 로그인 | 불필요 |
| `/register` | 회원가입 | 불필요 |
| `/dashboard` | 월별 요약 + 최근 거래 5건 | 필요 |
| `/transactions` | 거래 목록 + 필터 + CRUD | 필요 |
| `/categories` | 카테고리 목록 + CRUD | 필요 |

---

## 5. 상태 정의

### 거래 타입
- `income` — 수입
- `expense` — 지출

### 카테고리 타입
- `income` — 수입 카테고리
- `expense` — 지출 카테고리

---

## 6. 개발 범위 외

- 소셜 로그인 (Google, GitHub 등)
- 반복 거래 자동 생성
- 예산 목표 설정
- 파일 첨부 (영수증 이미지)
- 다중 통화 지원
- 데이터 내보내기 (CSV/Excel)
- 푸시 알림
