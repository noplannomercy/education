# Chunk 4 Dev Log: 대시보드 + Summary API

**Date:** 2026-03-19

## 구현 내용

### 신규 파일
- `src/app/api/summary/route.ts` — 월별 수입/지출/잔액 집계 API. `like` 패턴 매칭으로 날짜 필터, groupBy로 type별 합산, 카테고리별 집계 포함.
- `src/components/dashboard/SummaryCards.tsx` — 수입/지출/잔액 3개 카드 UI (Neo-Brutalism 스타일).
- `src/components/dashboard/RecentTransactions.tsx` — 최근 5개 거래 목록 컴포넌트.

### 수정 파일
- `src/app/(dashboard)/dashboard/page.tsx` — placeholder에서 실제 구현으로 교체. Server Component에서 직접 `getTransactions` 호출해 집계, 월 이동 네비게이션 포함.

## 설계 결정
- 대시보드 페이지는 `/api/summary` 직접 호출 대신 `getTransactions` 서비스 레이어를 직접 호출해 중복 HTTP 요청 방지.
- `/api/summary`는 외부 클라이언트(e.g., 향후 모바일 앱) 대응용으로 별도 유지.

## 빌드
```
✓ Compiled successfully
/api/summary ƒ Dynamic
/dashboard ƒ Dynamic
```

## Smoke Test 결과
- 회원가입/로그인: OK
- 수입 거래(1,000,000원) 추가: OK
- 지출 거래(50,000원) 추가: OK
- `/api/summary` 응답:
  - income: 1000000
  - expense: 50000
  - balance: 950000 (= 1000000 - 50000) ✓
