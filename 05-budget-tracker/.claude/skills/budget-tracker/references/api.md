# API

## 설계 규칙

- Route Handler는 인증 검증 → 서비스 호출 → 응답 반환만 담당
- 비즈니스 로직은 `lib/services/`에서 처리
- 모든 엔드포인트는 세션 검증 필수

## 인증 검증 패턴

```ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const session = await auth.api.getSession({ headers: await headers() });
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const userId = session.user.id;
```

## 응답 형식

```ts
// 성공
NextResponse.json({ data: result }, { status: 200 });
NextResponse.json({ data: result }, { status: 201 }); // 생성

// 실패
NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
NextResponse.json({ error: 'Not found' }, { status: 404 });
NextResponse.json({ error: 'Bad request' }, { status: 400 });
```

## 엔드포인트 목록

### Transactions
- `GET /api/transactions?year=&month=&categoryId=&type=` — 거래 목록 (필터 가능)
- `POST /api/transactions` — 거래 생성
- `PATCH /api/transactions/[id]` — 거래 수정
- `DELETE /api/transactions/[id]` — 거래 삭제

### Categories
- `GET /api/categories?type=` — 카테고리 목록 (type 필터 가능)
- `POST /api/categories` — 카테고리 생성
- `PATCH /api/categories/[id]` — 카테고리 수정
- `DELETE /api/categories/[id]` — 카테고리 삭제

### Summary
- `GET /api/summary?year=&month=` — 월별 수입/지출 합계 + 카테고리별 집계

## Summary 응답 형식

```ts
{
  data: {
    income: number,
    expense: number,
    balance: number,
    byCategory: Array<{
      categoryId: string,
      categoryName: string,
      type: 'income' | 'expense',
      total: number,
    }>
  }
}
```

## 에러 처리

```ts
try {
  // ...
} catch (error) {
  console.error(error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```
