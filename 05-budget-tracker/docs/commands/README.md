# 개발 워크플로우 가이드

이 문서 하나로 다음 프로젝트를 시작할 수 있다.

---

## 전체 흐름

```
Phase 0: 스킬 수립 + 프로젝트 초기 설정    → 프로젝트 시작 시 1회
    ↓
Phase 1: SRS 작성                          → 요구사항 확정 시
    ↓
Phase 2: 브레인스토밍 + 구현계획             → 개발 시작 전
    SRS → 브레인스토밍 → IMPLEMENTATION.md (검토) → 구현계획
    ↓
Phase 3: 개발 실행                          → Chunk 단위 반복
    ↓
Phase 4: 결과 리뷰                          → Chunk 완료 후 or 전체 완료 후

[독립 도구] E2E 테스트                      → Phase 3/4에서 필요 시 호출
```

---

## 핵심 원칙

```
스킬(references)  = 어떻게 만들지  (Phase 0에 수립, 개발 중 수정 금지)
SRS               = 무엇을 만들지  (Phase 1 작성, 기능 추가 시 업데이트)
구현계획           = 언제 무엇을    (Phase 2 작성, 매 기능마다)
```

- **스킬 = 표준.** 개발 과정에서 건드리지 않는다
- 스킬은 구조/패턴 일관성 보장, 비즈니스 로직은 SRS가 보장
- 구현계획이 상세하면 실행 시 스킬 참조 불필요
- 계획에 없는 작업은 `[프로젝트 스킬] 참고해서` 명시

---

## LLM 판단 원칙

### 개념

기존 방식은 규칙을 **항상** 적용한다.
- "항상 TDD", "항상 전체 테스트 실행", "항상 빌드 검증"

이 워크플로우는 다르다. **규칙의 목적이 지금 상황에 필요한지 LLM이 먼저 판단**하고, 필요할 때만 적용한다.

```
기존: 규칙 → 무조건 실행
이 방식: 변경 내용 분석 → 규칙의 목적이 필요한가? → 필요하면 실행, 아니면 스킵
```

예시:
- UI 컴포넌트만 추가했는데 TDD? → 회귀 위험 없음 → 생략
- auth 미들웨어 수정했는데 E2E 전체 실행? → 공통 레이어 → 전체 실행
- 단순 CRUD API인데 TDD? → 계획에 코드 명시됨 → 생략

### 판단 기준 요약

| 판단 기준 | 적용 | 생략 |
|-----------|------|------|
| TDD | 회귀 위험 있는 복잡한 로직 | UI·단순 CRUD·계획에 코드 명시된 경우 |
| 사람 OK 대기 | 새 패턴·SRS 충돌 가능성 | 기존 패턴 반복·결정 사항 자명 |
| 계획 코드 포함 | 복잡한 비즈니스 로직 | 보일러플레이트·반복 패턴 |
| 빌드 검증 | 타입·의존성·API 변경 | 순수 UI·스타일만 변경 |
| 전체 코드 리뷰 | 비즈니스 로직·인증·DB 변경 | UI·레이아웃만 변경 |
| E2E 전체 실행 | 공통 레이어(미들웨어·스키마·인증) 변경, 배포 전 | 특정 레이어만 변경된 경우 |
| E2E 대상 선정 | 테스트 파일 첫 줄 `# covers:` 경로와 변경 파일이 겹치는 것만 | 경로 겹치지 않는 테스트 |

### 판단 로그 (dev-log)

LLM이 판단한 근거는 `docs/dev-log/chunk{N}.md` 에 기록한다.
생략된 항목까지 남겨야 "왜 이걸 안 했지?" 추적 가능.

E2E 테스트 케이스 선별 판단은 `TEST-DECISIONS.md` 에 기록한다 → `e2e-testing.md` 참고.

---

## 스킬 구성

### 1. 프로젝트 표준 스킬 (직접 만드는 것)

새 프로젝트마다 하나 만든다. 역할: **아키텍처/DB/API/컨벤션 표준 문서**.

```
.claude/skills/[프로젝트명]/
├── SKILL.md          ← 스킬 트리거 조건 + 참고 문서 사용 규칙
└── references/
    ├── architecture.md   ← 레이어 구조, 파일 위치, 설계 결정
    ├── database.md       ← 스키마 패턴, ORM 사용법, 마이그레이션
    ├── api.md            ← API 설계 규칙, 응답 형식, 에러 처리
    └── conventions.md    ← 네이밍, 타입, 파일 구조 컨벤션
```

**스킬 등록 위치:**
- 글로벌: `C:\Users\[유저]\.claude\skills\[프로젝트명]\`
- 프로젝트: `[프로젝트루트]\.claude\skills\[프로젝트명]\`

> 글로벌 등록 시 어느 세션에서도 트리거됨. 프로젝트 등록 시 해당 프로젝트 세션에서만 트리거됨.

---

### 2. Superpowers 스킬 (이미 설치된 것)

| 스킬 | 역할 | 사용 시점 |
|------|------|-----------|
| `brainstorming` | SRS 검증 + 설계 탐색 + IMPLEMENTATION.md 생성 | Phase 2 |
| `writing-plans` | 구현계획 작성 (코드/명령어 포함) | Phase 2 |
| `executing-plans` | 계획 단계별 실행 | Phase 3 |
| `requesting-code-review` | 코드 품질 검토 | Phase 4 |

설치 확인: `C:\Users\[유저]\.claude\plugins\cache\claude-plugins-official\superpowers\`

---

## Phase별 상세

### Phase 0: 스킬 수립 + 프로젝트 초기 설정

> 자세한 프롬프트 → `phase0-setup.md`

**할 일:**
1. `references/` 4개 문서 작성 (architecture, database, api, conventions)
2. `SKILL.md` 작성 후 `.claude/skills/[프로젝트명]/` 에 등록
3. 패키지 설치, `.env.local`, `CLAUDE.md` 생성
4. DB 초기화
5. `@playwright/test` + `playwright-cli` 설치, `playwright.config.js` 생성

**완료 기준:** 스킬 트리거 확인 + `npm run test:e2e` 실행 가능

---

### Phase 1: SRS 작성

> 자세한 프롬프트 → `phase1-srs.md`

**SRS는 무엇을 만들지 정의한다. 스킬은 건드리지 않는다.**

포함 항목: 기능 요구사항 (ID 부여) / 데이터 모델 / 상태 정의 / 화면 목록 (URL) / 범위 외

저장: `docs/SRS.md`

---

### Phase 2: 브레인스토밍 + 구현계획

> 자세한 프롬프트 → `phase2-plan.md`

```
Step 1. 브레인스토밍 → IMPLEMENTATION.md
Step 2. 검토 (LLM 판단: 사람 OK 필요 여부)
Step 3. 구현계획 작성 → docs/superpowers/plans/YYYY-MM-DD-[feature].md
Step 4. 구현계획 검증 (외부 라이브러리 의존성, 환경변수, Chunk 순서)
```

---

### Phase 3: 개발 실행

> 자세한 프롬프트 → `phase3-dev.md`

```
전체 실행:  [파일명].md 구현계획 실행해줘.
특정 Chunk: [파일명].md 의 Chunk N 실행해줘.
세션 재개:  [파일명].md 에서 완료된 Chunk 확인하고 이어서 진행해줘.
```

- Chunk 완료마다: 빌드 검증 → smoke test (LLM 판단) → dev-log 작성
- smoke test = playwright-cli로 해당 Chunk 핵심 기능 빠르게 확인 (전체 E2E 아님)
- 판단 기록 → `docs/dev-log/chunk{N}.md`

---

### Phase 4: 결과 리뷰

> 자세한 프롬프트 → `phase4-review.md`

**코드 리뷰 기준 (순서대로):**
1. 구현계획 Chunk 모두 구현됐는가
2. SRS 요구사항과 실제 코드 일치 여부
3. 프로젝트 스킬 컨벤션 준수 (레이어 분리, 네이밍, 에러 처리)
4. TypeScript strict 준수
5. 인증 처리 누락
6. 비즈니스 로직 엣지케이스

출력: `Critical / Important / Minor / 잘된 점 / 종합 평가`

- E2E 전체 실행으로 최종 검증 → `e2e-testing.md` 참고

---

## 다음 프로젝트 체크리스트

```
[ ] Phase 0: references/ 4개 문서 작성
[ ] Phase 0: SKILL.md 작성 + 스킬 등록
[ ] Phase 0: 스킬 트리거 동작 확인
[ ] Phase 0: 패키지 설치 + .env.local + CLAUDE.md
[ ] Phase 0: @playwright/test + playwright-cli 설치 + playwright.config.js (PLAYWRIGHT_BASE_URL env + webServer 포함)
[ ] Phase 0: .env.local에 NEXT_PUBLIC_* 변수 포함 확인
[ ] Phase 1: docs/SRS.md 작성
[ ] Phase 2: 브레인스토밍 → IMPLEMENTATION.md
[ ] Phase 2: 검토 확인 후 구현계획 작성
[ ] Phase 2: 구현계획 검증 (Step 4) — 외부 라이브러리 의존성·env·Chunk 순서
[ ] Phase 3: Chunk 단위 실행 + 빌드 검증 (LLM 판단)
[ ] Phase 3: Chunk별 smoke test (LLM 판단) — DB/인증/API/데이터 연결 포함 시 필수
[ ] Phase 3: docs/dev-log/chunk{N}.md 판단 기록
[ ] Phase 4: 코드 리뷰 + Critical 0개 확인
[ ] Phase 4: E2E 전체 실행 최종 검증
```

---

## 파일 목록

- `phase0-setup.md` - 스킬 수립 + 프로젝트 초기 설정
- `phase1-srs.md` - SRS 작성
- `phase2-plan.md` - 브레인스토밍 + 구현계획 작성
- `phase3-dev.md` - Chunk 단위 개발 + 세션 재개
- `phase4-review.md` - 코드 리뷰 + 동작 검증
- `e2e-testing.md` - E2E 테스트 워크플로우 (phase3/4에서 호출)
