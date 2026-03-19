# Phase 2: 브레인스토밍 + 구현계획 작성

## 언제 사용
SRS 작성 완료 후, 개발 시작 전

---

## Step 1. 브레인스토밍

```
docs/SRS.md 기반으로 브레인스토밍 해줘.

결과는 docs/IMPLEMENTATION.md 로 저장해줘.
구현계획은 만들지 마. 브레인스토밍 결과만 정리해줘.
```

> **LLM 필수 행동:** Skill 도구로 `superpowers:brainstorming` 을 **명시적으로 호출**할 것.
> 결과물: `docs/IMPLEMENTATION.md` (설계 탐색, 기술 결정, 엣지케이스)

---

## Step 2. IMPLEMENTATION.md 검토

```
docs/IMPLEMENTATION.md 읽고 아래 기준으로 검토 보고해줘.

1. docs/SRS.md 의 기능 요구사항이 모두 반영됐는가
2. [프로젝트 스킬]의 아키텍처 패턴(레이어 구조, 파일 위치)과 일치하는가
3. [프레임워크 스킬]의 패턴과 일치하는가
3. 엣지케이스/에러 처리 누락 없는가
4. 기술 결정에 모순이 있는가

검토 후:
- 문제 있으면 → 직접 수정 후 "수정 완료: [변경 내용]" 보고
- 문제 없으면 → "검토 완료. Step 3 진행 가능합니다." 보고
```

> **사람 OK 대기 기준 (LLM 판단)**
> - 대기 필요: 새로운 아키텍처 패턴, SRS와 충돌 가능성, 기술 결정 불확실성이 있는 경우
> - 생략 가능: 기존 패턴의 단순 반복, SRS와 명확히 일치, 결정 사항이 자명한 경우

---

## Step 3. 구현계획 작성

```
docs/SRS.md 와 docs/IMPLEMENTATION.md 기반으로 구현계획 작성해줘.
[프로젝트 스킬] 참고해서 패턴 맞춰줘.

저장 위치: docs/superpowers/plans/YYYY-MM-DD-[feature].md
```

> **LLM 필수 행동:** Skill 도구로 `superpowers:writing-plans` 을 **명시적으로 호출**할 것.

> **구현계획 코드 포함 수준 기준 (LLM 판단)**
> - 코드 포함: 복잡한 비즈니스 로직, 권한 체크, 상태 머신, 비표준 패턴
> - 패턴 참조로 대체: 보일러플레이트성 CRUD, 기존 패턴과 동일한 반복 구조

**각 Chunk 끝에 반드시 포함할 스텝 (생략 불가)**

구현계획을 작성할 때, 모든 Chunk의 마지막에 아래 두 스텝을 포함해야 한다. executing-plans 스킬이 계획만 보고 실행하기 때문에, 계획 안에 없으면 실행되지 않는다.

```markdown
- [ ] **smoke test** ([필수/생략 가능] — [이유])
  서버 신원 확인 후 진행:
  \```bash
  # 1. 서버가 우리 앱인지 확인 (better-auth 응답 스키마로 판별)
  curl -s -X POST http://localhost:[PORT]/api/auth/sign-up/email \
    -H "Content-Type: application/json" \
    -d '{"name":"id","email":"idcheck_[timestamp]@test.com","password":"password123"}' \
    | grep -o '"emailVerified"'
  # → "emailVerified" 포함 시 우리 앱 확인. 없으면 다른 서버 — 포트 확인 필요.

  # 2. Chunk 핵심 기능 검증
  [curl 또는 playwright-cli 검증 커맨드]
  \```

- [ ] **dev-log 작성** `docs/dev-log/chunk{N}.md` (생략 불가)
  - TDD 적용 여부 + 근거
  - 빌드 검증 시점 + 근거
  - smoke test 실행 여부 + 근거 + 결과
  - 스킬 참조 여부 + 근거
  - 트러블슈팅 (발생한 경우)
```

---

## Step 4. 구현계획 검증

```
작성된 구현계획을 아래 기준으로 검토해줘.
문제 있으면 계획 직접 수정 후 보고해줘.

1. 외부 라이브러리 의존성 완비
   - 사용하는 라이브러리가 요구하는 schema 테이블/설정이 계획에 포함됐는가
   - 예: better-auth + drizzle → user/session/account/verification 테이블 필수
   - 예: 새 라이브러리 도입 시 → 필수 초기화 코드/config 포함됐는가

2. 환경변수 완비
   - 앱이 사용하는 모든 env 변수가 .env.local 설명에 포함됐는가
   - 클라이언트 번들에 필요한 NEXT_PUBLIC_* 변수 누락 없는가

3. Chunk 순서 검증
   - 각 Chunk 완료 시점에 서버가 기동 가능한 상태인가
   - 의존성 순서가 맞는가 (schema → migration → service → API → UI)

4. 누락 파일/설정 확인
   - 기존 프로젝트(참조 코드) 대비 누락된 설정 파일, 미들웨어, 라우트 없는가

5. smoke test 실행 가능성 검증
   - 각 chunk의 smoke test 커맨드를 지금 당장 실행한다고 가정했을 때,
     성공하기 위해 필요한 모든 조건이 해당 chunk 또는 선행 스텝에 명시됐는가
```

> 검증 완료 → "계획 검증 완료. Phase 3 진행 가능합니다." 보고

---

## 완료 기준
- [ ] `docs/IMPLEMENTATION.md` 존재 (브레인스토밍 결과, 검토 완료)
- [ ] `docs/superpowers/plans/` 에 계획 파일 존재
- [ ] 각 Chunk에 파일 경로, 핵심 코드, 검증 방법, 커밋 메시지 포함
- [ ] Step 4 구현계획 검증 완료
