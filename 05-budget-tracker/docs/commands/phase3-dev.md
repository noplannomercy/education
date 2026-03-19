# Phase 3: 개발 실행

## 언제 사용
구현계획 작성 완료 후, Chunk 단위로 반복 실행

---

## 프롬프트 (전체 실행 시작)
```
docs/superpowers/plans/[파일명].md 구현계획 실행해줘.
```

> **LLM 필수 행동:** Skill 도구로 `superpowers:subagent-driven-development` 를 **명시적으로 호출**할 것.
> "자동 발동"이 아님 — Skill 도구 호출을 생략하면 순차 실행으로 전락한다 (45분 소요 사례).
> Claude Code(서브에이전트 지원 환경)에서는 `executing-plans` 대신 `subagent-driven-development` 사용.

---

## 프롬프트 (특정 Chunk만 실행)
```
docs/superpowers/plans/[파일명].md 의 [Chunk N] 실행해줘.
```

---

## 프롬프트 (계획에 없는 작업 발생 시)
```
[작업 내용] 만들어줘.
구현계획 docs/superpowers/plans/[파일명].md 참고하고,
[프로젝트 스킬] 참고해서 컨벤션 맞춰줘.
```

---

## 개발 규칙

**Chunk 완료 사이클 (반드시 이 순서로)**
```
Chunk 구현 → 빌드 검증 → smoke test (LLM 판단) → dev-log 작성 (필수) → 다음 Chunk
```

> **dev-log는 생략 불가.** smoke test를 실행했는지, 왜 생략했는지 추적하는 유일한 수단이다. dev-log가 없으면 LLM 판단이 제대로 이뤄졌는지 확인할 방법이 없다.

- smoke test 실패 시 → 해당 Chunk 안에서 수정, 통과해야 다음 Chunk로
- 계획에 없는 패턴 필요 시 → [프로젝트 스킬] 명시적 호출
- 계획대로 되면 → 스킬 호출 없이 계획만 따라가도 됨

**dev-log 작성 (`docs/dev-log/chunk{N}.md`)**
- TDD 적용 여부 + 근거
- 빌드 검증 시점 + 근거
- smoke test 실행 여부 + 근거 + 결과
- 스킬 참조 여부 + 근거
- 트러블슈팅 (발생한 경우)

---

## LLM 판단 기준

**TDD 적용 여부**
- 적용: 비즈니스 로직, 권한 체크, 상태 변경처럼 나중에 수정 시 회귀 위험이 있는 복잡도
- 생략: UI 컴포넌트, 단순 CRUD, 계획서에 코드가 명시된 경우

**빌드 검증 시점**
- 필수: 타입/의존성/API 변경이 포함된 Chunk
- 묶어서 한 번: 순수 UI·스타일만 변경되는 연속 Chunk

**smoke test 실행 여부 (LLM 판단)**

smoke test = playwright-cli로 해당 Chunk 핵심 기능을 빠르게 확인하는 것. 전체 E2E spec 실행이 아님.

| 조건 | 판단 |
|------|------|
| DB schema 변경 포함 | 필수 — 마이그레이션 적용 + 실제 데이터 저장 확인 |
| 인증/세션 관련 Chunk | 필수 — 회원가입 or 로그인 실제 동작 확인 |
| API endpoint 신규 추가 | 필수 — curl 또는 playwright-cli로 응답 확인 |
| 서버-클라이언트 데이터 연결 | 필수 — 화면에 실제 데이터 표시 확인 |
| 순수 UI 스타일/레이아웃 | 생략 가능 |
| 계획에 코드까지 명시된 단순 CRUD | 생략 가능 (빌드 성공으로 대체) |

**smoke test 방법**
```bash
# [0] 서버 신원 확인 — smoke test 전 필수
# 포트에 우리 앱이 떠 있는지 반드시 확인한다. 다른 앱 서버에 테스트하면 결과가 무효.
curl -s -X POST http://localhost:[PORT]/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"id","email":"idcheck_'"$(date +%s)"'@test.com","password":"password123"}' \
  | grep -o '"emailVerified"'
# → "emailVerified" 포함 시 우리 앱(better-auth). 없거나 HTML 반환 시 → 다른 서버.
# 다른 서버인 경우: .env.local 포트 확인, 서버 재기동 후 재확인.

# [1] 서버 상태 확인
curl -s -o /dev/null -w "%{http_code}" http://localhost:[PORT]

# [2] DB 연결 + API 동작 확인
curl -X POST http://localhost:[PORT]/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"smoke","email":"smoke_'"$(date +%s)"'@test.com","password":"password123"}'

# [3] UI 동작 확인 (playwright-cli)
playwright-cli -s=smoke open http://localhost:[PORT]
playwright-cli -s=smoke snapshot   # 스냅샷으로 렌더 확인
playwright-cli -s=smoke close
```

> **서버 신원 확인이 실패하면 smoke test를 진행하지 않는다.** 잘못된 서버에서 통과한 테스트는 아무 의미가 없다.

**스킬 참조 여부**
- 참조: 계획이 모호하거나 새로운 패턴이 필요한 경우
- 생략: 계획서에 코드까지 명시된 경우

---

## 세션 재개 시
```
docs/superpowers/plans/[파일명].md 에서 완료된 Chunk 확인하고 이어서 진행해줘.
```

> 구현계획의 각 Chunk 완료 표시(`- [x]`)를 기준으로 이어서 진행.

## 완료 기준
- [ ] 모든 Chunk 완료
- [ ] `[빌드 명령]` 성공
- [ ] 각 Chunk의 smoke test 통과 (필요 판단된 Chunk만)
- [ ] 최종 환경 검증 — auth sign-up API → 세션 쿠키 반환 확인 (필수, LLM 판단 아님)
- [ ] phase3 완료 커밋
