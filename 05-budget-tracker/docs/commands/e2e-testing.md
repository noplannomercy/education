# E2E 테스트

`playwright-cli` (탐색) + `@playwright/test` (spec 실행) 기반. MCP 미사용.

> phase3, phase4에서 필요 시 호출하는 독립 도구 문서.

---

## 도구 역할

| 도구 | 역할 | 사용 시점 |
|------|------|-----------|
| `playwright-cli` | 브라우저 탐색 / 스냅샷 / 셀렉터 파악 | spec 작성 전 |
| `@playwright/test` | spec 파일 작성 및 실행 | spec 작성 후 |

---

## 초기 설정 (프로젝트 최초 1회)

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
npm install -g playwright-cli  # 이미 설치됐으면 skip
```

`playwright.config.js`:
```js
const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,  // dev 서버 환경 — DB 응답 지연 고려
  workers: 1,  // dev 서버 환경 — 과부하 방지. CI에서는 올려도 됨
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:[포트]',
    headless: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:[포트]',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
```

> **포트 고정 금지**: `baseURL`을 하드코딩하면 다른 포트를 쓰는 프로젝트에서 오작동. 반드시 `PLAYWRIGHT_BASE_URL` env로 주입하고 기본값에 실제 포트 기재.

`package.json` scripts:
```json
"test:e2e": "playwright test"
```

---

## 워크플로우

### 0단계: 환경 체크 (테스트 전 필수)

테스트 실패 시 로직보다 환경을 먼저 의심한다. 환경 문제는 모든 테스트를 한꺼번에 실패시키기 때문에 가장 먼저 제거해야 한다.

**체크 순서 (이 순서대로)**

1. **서버 포트** — 앱이 예상 포트에서 실행 중인지 확인
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:[PORT]
   ```

2. **env 변수** — 포트, URL, 인증 키가 실제 실행 환경과 일치하는지 확인
   ```bash
   grep -E "URL|PORT|SECRET" .env.local
   ```
   특히 `NEXT_PUBLIC_*` 변수는 클라이언트 번들에 포함되므로 서버와 포트가 다르면 **요청이 엉뚱한 서버로** 간다. 변경 후 서버 재시작 필수.

3. **DB 연결** — 인증·데이터 API가 모두 실패하면 DB 연결 문제일 가능성
   ```bash
   curl -X POST http://localhost:[PORT]/api/auth/sign-up/email \
     -H "Content-Type: application/json" \
     -d '{"name":"test","email":"test@t.com","password":"password123"}'
   ```

4. **lock 파일** — dev 서버 재시작 실패 시 `.next/dev/lock` 확인 후 삭제

> **판단 기준**: 동일 오류가 테스트 10개 이상에서 동시에 발생한다면 환경 문제다. 1~2개 특정 테스트만 실패하면 로직 문제다.

---

### 1단계: 앱 탐색 (playwright-cli)

```bash
playwright-cli -s=app open http://localhost:[포트]
playwright-cli -s=app snapshot   # .yml 읽어서 ref 파악
playwright-cli -s=app click e17  # 버튼 클릭해보며 동작 확인
playwright-cli -s=app close
```

**탐색 범위 — spec 작성 전 반드시 모두 확인**

| 확인 항목 | 이유 |
|-----------|------|
| 모든 페이지의 기본 렌더 | 라우트 확인 |
| 생성 폼 열기 + 필드 확인 | 실제 placeholder/버튼 이름 파악 |
| 수정 폼 열기 + 필드 확인 | 생성 폼과 다를 수 있음 |
| 삭제 플로우 — confirm 다이얼로그 여부 | `page.on('dialog')` 처리 필요 여부 |
| 성공/실패 후 리다이렉트 URL | 소스 보지 않고 추측 금지 |
| 같은 텍스트가 여러 섹션에 있는지 | strict mode violation 사전 방지 |

> 탐색을 마친 후에만 spec을 작성한다. 추측으로 쓰면 반드시 실패한다.

---

### 2단계: 테스트 케이스 선별 (LLM 판단)

**작성 기준**
- 작성: 비즈니스 로직, 상태 전환, 데이터 저장/복원, 다단계 플로우
- 생략: 시각적 스타일·애니메이션, 정적 콘텐츠 표시

**셀렉터 전략**
- ID 있음 → ID 셀렉터 우선
- ID 없음 → `getByRole` → 클래스/data 속성 순

**waitForTimeout 사용 여부**
- 사용: 비동기 상태 변화, 애니메이션 완료 후 결과 읽기
- 생략: 클릭 즉시 반영되는 동기 상태 변경

**인증 최적화**
- 인증이 필요한 테스트가 3개 이상이면 → 매번 로그인 금지, `storageState` 패턴 사용
- 로그인/로그아웃 플로우 테스트 자체는 직접 로그인 (storageState 미사용)
- 여러 역할(admin, user)이 필요하면 역할별로 auth 파일 분리 (`.auth/admin.json`, `.auth/user.json`)

선별 후 표로 정리:

| 기능 | 케이스 | 판단 |
|------|--------|------|
| ... | 상태 전환 | 작성 — 비즈니스 로직 |
| ... | 애니메이션 효과 | 생략 — 시각적 스타일 |

---

### 3단계: TEST-DECISIONS.md 작성

spec 작성 전, 판단 근거를 루트에 기록. 생략된 항목까지 남겨야 추적 가능.

```markdown
# TEST-DECISIONS.md

## 탐색한 기능 목록

| 기능 | 판단 | 근거 |
|------|------|------|
| 로그인 성공 | 작성 | 상태 전환 |
| 권한 없는 접근 | 작성 | 비즈니스 로직 |
| 버튼 색상 | 생략 | 시각적 스타일 |
```

---

### 4단계: spec 파일 작성

파일 첫 줄에 `# covers:` 선언 필수:
```js
// covers: src/app/api/tasks/, src/components/tasks/
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});
```

#### 인증 있는 앱 — storageState 패턴

인증 필요 테스트가 3개 이상이면 `beforeAll`로 한 번만 로그인하고 세션을 재사용한다.

```js
const { test, expect } = require('@playwright/test');

const ADMIN = { email: 'admin@test.com', password: 'password123' };

// ── 1. 세션 저장 (파일 최상단)
test.beforeAll(async ({ browser }) => {
  // test.use의 storageState 상속 방지 — 파일이 없으면 newContext()가 터짐
  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const p = await ctx.newPage();
  await p.goto('/login');
  await p.fill('input[name="email"]', ADMIN.email);
  await p.fill('input[name="password"]', ADMIN.password);
  await p.click('button[type="submit"]');
  await p.waitForURL('/');
  await ctx.storageState({ path: '.auth/admin.json' });
  await ctx.close();
});

// ── 2. 인증 필요 테스트 전체에 적용
test.use({ storageState: '.auth/admin.json' });

// ── 3. 로그인/로그아웃 테스트는 별도 describe로 분리 (빈 세션)
test.describe('로그인 플로우', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('로그인 성공 → 대시보드', async ({ page }) => { /* ... */ });
  test('로그아웃 → /login', async ({ page }) => { /* ... */ });
});

// ── 4. 나머지는 storageState 자동 적용 (로그인 불필요)
test('대시보드 표시', async ({ page }) => {
  await page.goto('/');
  // 이미 로그인된 상태
});
```

> `.auth/` 폴더는 `.gitignore`에 추가 (`**/.auth/`)

---

### 5단계: 실행

**병렬 여부 판단 (LLM 판단)**

각 테스트가 독립 유저/세션을 생성하는지 먼저 확인한다.

| 조건 | 판단 | 설정 |
|------|------|------|
| 각 테스트가 독립 계정 생성 + 공유 상태 없음 | 병렬 가능 | `workers: N` |
| 테스트 간 데이터 의존 (A가 만든 걸 B가 읽음) | 순차 필수 | `workers: 1` |
| dev 서버 환경 (리소스 제한) | 과부하 방지 | `workers: 1` 또는 `2` |

> **판단 기준**: 독립적이라도 dev 서버 + Chromium N개 동시 실행은 `ERR_INSUFFICIENT_RESOURCES` 유발. CI/프로덕션 빌드 서버면 `workers` 높여도 됨.

`playwright.config.js`에 명시적으로 기록:
```js
module.exports = defineConfig({
  workers: 1,  // dev 서버 환경 — 과부하 방지. CI에서는 올려도 됨
  ...
});
```

```bash
npm run test:e2e                          # 전체
npx playwright test --grep "키워드"       # 특정 테스트만
npx playwright test tests/e2e/chunk1-auth.spec.js  # 특정 파일만
```

---

## 실행 대상 선정 (LLM 판단)

각 테스트 파일 첫 줄 `# covers:` 경로와 변경된 파일 경로를 비교:
- 경로 겹치는 테스트 파일만 실행
- 공통 레이어(미들웨어·스키마·인증) 변경 시 전체 실행
- 변경 없는 레이어의 테스트는 스킵

---

## 흔한 실수

| 실수 | 원인 | 해결 |
|------|------|------|
| 전체 테스트 동시 실패 (연결 오류) | 환경 문제 (포트, env, DB) | **0단계 환경 체크 먼저** |
| `NEXT_PUBLIC_*` URL이 엉뚱한 서버로 | env에 포트 오기재 | `.env.local` 확인, 서버 재시작 |
| `beforeAll`에서 `browser.newContext()` 실패 | `test.use({ storageState: '...' })`가 파일 없는 상태에서 상속됨 | `browser.newContext({ storageState: { cookies: [], origins: [] } })` 명시 |
| `getByLabel` timeout | label-input `htmlFor`/`id` 미연결 | 소스에 `htmlFor`+`id` 추가 |
| `getByRole`이 여러 개 매칭 (strict mode violation) | 같은 텍스트가 여러 섹션에 존재 | 탐색 시 중복 확인 후 상위 컨테이너로 scope — `page.getByRole('list').first().getByRole('listitem')` |
| 버튼/input 이름이 소스와 다름 | 추측으로 spec 작성 | **탐색 먼저** — snapshot yml의 실제 이름 확인 후 작성 |
| 삭제 클릭 후 요소가 여전히 보임 | `confirm()` 다이얼로그 미처리 | `page.on('dialog', d => d.accept())` 등록 후 클릭 |
| 연속 클릭 후 기대값 미반영 | 첫 번째 클릭의 네비게이션 완료 전 두 번째 클릭 | `waitForURL()` 로 네비게이션 완료 확인 후 클릭 |
| 병렬 실행 중 timeout/ERR_INSUFFICIENT_RESOURCES | dev 서버 과부하 | `workers: 1` 설정 |
| 요소 클릭 timeout | 선행 동작 후에만 나타나는 UI | 선행 동작 먼저 수행 |
| 클리어 후 `toHaveCount(0)` 실패 | placeholder 요소 잔존 | count 대신 텍스트 검증 |
| 애니메이션 후 텍스트 못 읽음 | 애니메이션 완료 전 읽음 | `waitForTimeout` 충분히 |
| `page.url()` 체크가 항상 이전 URL 반환 | `page.url()`은 동기 값 — 클릭 직후 네비게이션 완료 전에 읽힘 | `expect(page).toHaveURL(pattern)` 사용. `await expect(page.url()).toMatch(...)` 절대 금지 |
| dev 서버에서 타임아웃 flaky | 누적된 테스트 후 DB/서버 응답 느려짐 | `playwright.config.js`에 `timeout: 60_000` 설정 |
