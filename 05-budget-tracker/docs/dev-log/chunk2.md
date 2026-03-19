# Chunk 2 Dev Log: 카테고리 API + 관리 페이지

## 작업 내용

- `src/lib/services/category.service.ts` — getCategories, createCategory, updateCategory, deleteCategory 구현
- `src/app/api/categories/route.ts` — GET, POST 엔드포인트
- `src/app/api/categories/[id]/route.ts` — PATCH, DELETE 엔드포인트
- `src/components/categories/CategoryForm.tsx` — 카테고리 추가 폼 (Client Component)
- `src/components/categories/CategoryList.tsx` — 카테고리 목록 + 삭제 (Client Component)
- `src/app/(dashboard)/categories/page.tsx` — 카테고리 관리 페이지 (Server Component)

## TDD 적용 여부

미적용. 서비스 레이어 함수가 단순한 CRUD 패턴이고 Drizzle ORM 쿼리 결과가 타입으로 보장되므로 단위 테스트 대신 smoke test로 검증. E2E 레이어에서 통합 검증이 더 효율적인 구조.

## 빌드 검증 시점

파일 6개 모두 작성 완료 후 `next build` 실행. 빌드 성공 확인 후 smoke test 진행. 중간 빌드는 생략(독립적 파일이라 상호 의존 없음).

## Smoke Test 결과

| 항목 | 명령 | 결과 |
|------|------|------|
| 회원가입 | POST /api/auth/sign-up/email | `"emailVerified"` OK |
| 로그인 + 쿠키 | POST /api/auth/sign-in/email | `"token"` OK |
| 카테고리 생성 | POST /api/categories | `"id"` OK |
| 카테고리 목록 | GET /api/categories | `"name"` x5 OK (기본4 + 생성1) |
| CAT-06: 신규 유저 기본 카테고리 | GET /api/categories (cat06 유저) | `"급여"` OK |

모든 항목 통과. databaseHooks를 통한 기본 카테고리 자동 생성(급여/식비/교통/주거) 확인.
