# TEST-DECISIONS.md — Phase 4 E2E Testing

## Environment

- App URL: http://localhost:3012
- Framework: Next.js 15 App Router + better-auth + Drizzle ORM (SQLite in dev)
- Test runner: Playwright (chromium, headless)

## UI Differences from Reference (3.3)

The following actual UI elements were verified via Playwright browser exploration before writing specs.

### Auth / Navigation
- After registration: redirects to `/dashboard` (not `/`)
- Password field label: `"비밀번호 (6자 이상)"` — `getByLabel('비밀번호')` still matches via partial

### Dashboard (`/dashboard`)
- Summary card labels: `총 수입` / `총 지출` / `잔액`
- Empty state text: `거래 내역이 없습니다.` (ref tests had `이번 달 거래가 없습니다.`)
- Month navigation: rendered as `<link>` elements (`←` / `→`), not buttons
- Month display format: `2026년 3월` (year+month, same as ref)

### Transactions (`/transactions`)
- No `+ 추가` button — the add form is always visible inline
- Form heading: `거래 추가`
- Amount field: `spinbutton` with placeholder `금액` (no extra text)
- Memo field: `textbox` with placeholder `메모 (선택사항)`
- Type toggle buttons: `지출` (default) / `수입`
- Submit button: `거래 추가` (not `추가`)
- Delete uses `confirm()` dialog with message `삭제하시겠습니까?`
- Empty state text: `거래 내역이 없습니다.`

### Categories (`/categories`)
- Route: `/categories` (inside `(dashboard)` layout group)
- Add form placeholder: `카테고리 이름` (not `카테고리명`)
- Submit button: `카테고리 추가` (not `추가`)
- Type buttons in form: `수입` / `지출`
- Delete uses `confirm()` dialog with message `삭제하시겠습니까?`
- Default categories on registration: `급여` (수입), `식비` / `교통` / `주거` (지출)

## Bug Found and Fixed

- **Categories page server error**: `CategoriesPage` (Server Component) passed `onSuccess={() => {}}` arrow function to `CategoryForm` (Client Component), violating Next.js rules.
  - Fix: Made `onSuccess` optional (`onSuccess?: () => void`) and removed the prop from the page.
  - Files changed: `src/app/(dashboard)/categories/page.tsx`, `src/components/categories/CategoryForm.tsx`

## Test Design Decisions

### Unique email collision prevention
All tests that create users use:
```js
`prefix-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`
```
This prevents collisions even when tests run in parallel or in rapid sequence.

### Test chunking (same as 3.3)
- `chunk1-auth.spec.js` — AUTH: redirect, register, CAT-05, CAT-06 (new), login, logout
- `chunk2-3-api.spec.js` — Transaction CRUD + filter, Category CRUD
- `chunk5-dashboard.spec.js` — Dashboard summary cards, month navigation, empty state

### CAT-06 (new test)
After registration, navigate to `/categories` and verify 급여/식비/교통/주거 are present.
This tests that default category seeding works correctly for new users.

### Dashboard URL
All dashboard assertions use `/dashboard` (not `/`). The root `/` page redirects to `/dashboard` when logged in.

### Month nav assertion
Month nav uses `getByRole('link', { name: '←' })` instead of `getByRole('button', { name: '←' })`.
