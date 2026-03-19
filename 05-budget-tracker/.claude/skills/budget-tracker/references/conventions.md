# Conventions

## 네이밍

- 컴포넌트: PascalCase (`TransactionCard`, `CategoryList`)
- 서비스 함수: camelCase (`getTransactions`, `createCategory`)
- DB 테이블 변수: camelCase + Table suffix (`transactionsTable`, `categoriesTable`)
- API route 파일: `route.ts`

## 타입

- Zod로 request body 검증
- DB 조회 결과 타입은 Drizzle `InferSelectModel` 사용
- `any` 사용 금지

```ts
import { z } from 'zod';

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});

const createCategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['income', 'expense']),
  color: z.string().default('#6366f1'),
});
```

## 컴포넌트 분류

- Server Component (기본): 데이터 fetching, 페이지 레이아웃
- Client Component (`'use client'`): 폼, 버튼 클릭, 상태 변경 UI

## 스타일링

- Tailwind CSS v4
- Neo-Brutalism 스타일: 굵은 border, 강한 그림자, 원색 계열

## 파일 구조 컨벤션

```ts
// route.ts 구조
export async function GET(request: Request) { ... }
export async function POST(request: Request) { ... }

// service 구조
export async function getTransactions(userId: string, filters?: TransactionFilters) { ... }
export async function createTransaction(userId: string, data: CreateTransactionData) { ... }
```

## 금액 처리

- DB 저장: `real` 타입 (소수점 지원)
- 화면 표시: `toLocaleString('ko-KR')` 포맷 (예: 1,000,000)
- 음수 없음: amount는 항상 양수, type으로 수입/지출 구분
