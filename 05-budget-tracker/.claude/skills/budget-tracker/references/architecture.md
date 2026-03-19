# Architecture

## 레이어 구조

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 페이지
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/              # 인증 필요 페이지
│   │   ├── layout.tsx            # 대시보드 레이아웃 (사이드바 포함)
│   │   ├── page.tsx              # 대시보드 홈 (월별 요약 + 최근 거래)
│   │   ├── transactions/         # 거래 내역
│   │   │   └── page.tsx          # 거래 목록 (필터: 월/카테고리/타입)
│   │   └── categories/           # 카테고리 관리
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/[...all]/        # better-auth 핸들러
│   │   ├── transactions/         # 거래 CRUD
│   │   │   ├── route.ts          # GET(목록), POST(생성)
│   │   │   └── [id]/route.ts     # GET, PATCH, DELETE
│   │   ├── categories/           # 카테고리 CRUD
│   │   │   ├── route.ts          # GET(목록), POST(생성)
│   │   │   └── [id]/route.ts     # GET, PATCH, DELETE
│   │   └── summary/              # 월별 요약
│   │       └── route.ts          # GET (year, month 쿼리 파라미터)
│   └── layout.tsx
├── components/
│   ├── layout/
│   ├── transactions/
│   ├── categories/
│   ├── dashboard/
│   └── ui/
├── lib/
│   ├── auth.ts
│   ├── auth-client.ts
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts
│   └── services/
│       ├── transaction.service.ts
│       └── category.service.ts
└── middleware.ts
```

## 설계 원칙

- **Server Component 우선**: 데이터 fetching은 Server Component에서
- **Client Component 최소화**: 폼 인터랙션, 상태 관리만 Client
- **서비스 레이어 분리**: 비즈니스 로직은 `lib/services/`에, API Route는 얇게
- **인증 필수**: 모든 API와 대시보드 페이지는 세션 검증 필수
- **소유권 검증**: 거래/카테고리 접근 시 userId 일치 확인 필수

## 파일 위치 규칙

- 페이지: `src/app/(dashboard)/[기능]/page.tsx`
- API: `src/app/api/[기능]/route.ts`
- 서비스: `src/lib/services/[기능].service.ts`
- 컴포넌트: `src/components/[기능]/[컴포넌트명].tsx`
