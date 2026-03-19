# Chunk 3 Dev Log: 거래 API + 거래 목록 페이지

## TDD 적용 여부

미적용. E2E/unit 테스트 없이 구현 후 smoke test로 검증. 거래 CRUD는 category 서비스와 동일한 패턴이므로 TDD 없이 충분히 안전하게 구현 가능하다고 판단.

## 빌드 검증 시점

파일 6개 작성 완료 후 `next build`로 확인. 첫 빌드에서 타입 오류 1건 발생:
- `/api/transactions/[id]/route.ts`의 updateSchema에서 `categoryId: z.string().nullable().optional()`을 사용하는데, `CreateTransactionData.categoryId`가 `string | undefined`로 정의되어 `null`을 받지 못함.
- `CreateTransactionData.categoryId`를 `string | null | undefined`로 수정하여 해결.
- 두 번째 빌드 성공.

## smoke test 결과

서버: http://localhost:3012 (dev server 가동 중)

```
Step 1: 회원가입 → "emailVerified" ✓
Step 2: 로그인 (쿠키 저장) → "token" ✓
Step 3: 거래 생성 (POST /api/transactions) → "id" ✓
Step 4: 월별 거래 목록 조회 (GET /api/transactions?year=YYYY&month=MM) → "amount" ✓
```

핵심 검증 완료: transaction create + list with month filter 정상 동작.
