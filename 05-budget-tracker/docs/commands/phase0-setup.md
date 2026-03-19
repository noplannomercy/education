```markdown
# Phase 0: 프로젝트 초기 설정

## 언제 사용
새 프로젝트 시작 시 1회 실행.
스킬은 이미 설치돼 있다. 여기서 새로 만들거나 수정하지 않는다.

---

## 프롬프트

```
새 프로젝트 초기 설정해줘.

1. 패키지 설치
   - [프로젝트 스택 패키지]

2. .env.local 생성
   - [환경변수 목록]

3. CLAUDE.md 작성
   - 프로젝트 개요, 스킬 위치(.claude/skills/[프로젝트 스킬명]/), 주요 명령어

4. DB 생성
   - Docker 컨테이너 확인 및 신규 DB 생성
```

---

## E2E 테스트 환경 설정 (CLI 기반, MCP 미사용)

```bash
# @playwright/test 설치
npm install --save-dev @playwright/test
npx playwright install chromium

# playwright-cli 전역 설치 (이미 설치됐으면 skip)
npm install -g playwright-cli
```

`playwright.config.js` 생성:
```js
const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/e2e',
  workers: 1,  // dev 서버 환경 — 과부하 방지
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:[포트]',
    headless: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx dotenv -e .env.local -- next dev',
    url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:[포트]',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
```

> **포트 고정 금지**: `baseURL` 하드코딩 금지. `PLAYWRIGHT_BASE_URL` env로 주입하고 기본값에 실제 포트 기재.
> `webServer`의 `command`도 dotenv로 `.env.local` 주입 필수 — 없으면 DB 연결 등 env가 누락된 채로 서버 기동.

`package.json` scripts에 추가:
```json
"test:e2e": "playwright test"
```

> 테스트 파일마다 첫 줄에 `# covers: [경로]` 선언 필수 → `e2e-testing.md` 참고

---

## .env.local 작성 시 주의

- `BETTER_AUTH_URL` — 서버 사이드 auth 요청 URL. 실행 포트와 반드시 일치
- `NEXT_PUBLIC_BETTER_AUTH_URL` — 클라이언트 번들용. `auth-client.ts`에서 사용. **서버와 포트 다르면 CORS 오류 발생**
- 포트를 바꿀 때마다 위 두 변수를 함께 변경하고 서버 재시작

---

## 설치된 스킬

| 스킬 | 역할 |
|------|------|
| `[프로젝트 스킬]` | 아키텍처, DB 스키마, API 규칙, 컨벤션 표준 |
| `[프레임워크 스킬]` | 프레임워크 패턴 (App Router 등) |
| `[DB 스킬]` | DB 쿼리, ORM 사용법 |

> 스킬은 `.claude/skills/` 에 이미 설치됨. 수정하지 않는다.

---

## 완료 기준
- [ ] `npm run dev` 정상 실행
- [ ] `.env.local` 설정 완료 (NEXT_PUBLIC_* 포함)
- [ ] `CLAUDE.md` 존재
- [ ] DB 생성 완료
- [ ] `@playwright/test` + chromium 설치 완료
- [ ] `playwright.config.js` 존재 (PLAYWRIGHT_BASE_URL env 패턴 + webServer 포함)
- [ ] `npm run test:e2e` 실행 가능
- [ ] 포트 일관성 확인 — `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `playwright.config.js` baseURL 이 모두 동일 포트

---

## 주의
스킬은 **절대 수정하지 않는다.**
스킬이 표준이다. 가져다 쓰는 것만 한다.
```