# Claude Code 프롬프트 치트시트
**3막 구성: 맨손 딸깍 → Superpowers → 스펙주도개발**

---

## 시작 전 필독

### 어떤 레벨을 써야 하나?
```
빠르게 프로토타입     → 1막 Level 1 (2~5분)
검증까지 포함         → 1막 Level 2 (5~10분)
제대로 된 앱          → 1막 Level 3 PRD 기반 (20~40분)
오류 없이 완성도 높게 → 2막 Superpowers (30~60분, Max 전용)
문서 기반 풀스택      → 3막 스펙주도개발 (Next.js + SQLite)
```

---

## 1막 — 맨손 딸깍 (HTML + CSS + JS + 로컬스토리지)

### Claude Code 실행
```
claude --dangerously-skip-permissions
```

### 🟢 Level 1 — 맨손 딸깍 (2~5분)

```
HTML CSS JS 로컬스토리지 기반 Todo 앱 만들어줘
```
```
HTML CSS JS 로컬스토리지 기반 메모장 앱 만들어줘
제목이랑 내용 저장되고 목록에서 클릭하면 보이게
```
```
HTML CSS JS 로컬스토리지 기반 용돈 기입장 만들어줘
수입/지출 입력하고 잔액 자동 계산되게
```
```
HTML CSS JS 로컬스토리지 기반 독서 기록장 만들어줘
책 제목, 저자, 읽은 날짜, 별점, 한줄 감상 저장
```
```
HTML CSS JS 로컬스토리지 기반 단어 암기장 만들어줘
단어/뜻 입력하고 플래시카드로 외울 수 있게
```
```
HTML CSS JS 로컬스토리지 기반 습관 트래커 만들어줘
매일 체크하는 습관 목록, 오늘 달성 여부 체크
```
```
HTML CSS JS 로컬스토리지 기반 뽀모도로 타이머 만들어줘
25분 집중 / 5분 휴식 사이클, 오늘 완료한 세션 수 저장
```

### 🟡 Level 2 — 검증 포함 (5~10분)

```
HTML CSS JS 로컬스토리지 기반 [앱이름] 만들어줘

완성되면 모든 기능이 정상 동작하는지
확인하고 안 되는 것 있으면 바로 수정해줘.
```
```
# 특정 기능만 타겟팅
완성된 앱에서 [특정 기능] 부분만
확인하고 이상한 것 있으면 수정해줘.
```
```
# 피쳐 추가
현재 앱에 [기능] 추가해줘.
기존 기능은 건드리지 마.
```
```
# 리팩토링
현재 코드 리팩토링해줘.
기능 변경 없이 코드 품질만 개선.
중복 제거하고 읽기 쉽게.
```

### 🟠 Level 3 — PRD 기반 (20~40분)

```
# PRD 먼저, 구현 나중
[앱이름] 웹앱 PRD를 docs/PRD.md로 작성해줘.
HTML CSS JS 로컬스토리지 기반으로.
```
```
# 경량 PRD + 즉시 구현
HTML CSS JS 로컬스토리지 기반 [앱이름] 앱을 만들거야.
PRD는 핵심만 docs/PRD.md로 작성하고 바로 구현해줘.
구현 후 모든 기능 정상 동작하는지 확인하고
안 되는 것 있으면 바로 수정해줘.
```
```
# 칸반 보드로 변환
현재 앱을 칸반보드로 변경해줘.
3개 컬럼: 할일 | 진행중 | 완료
카드 드래그앤드롭으로 컬럼 간 이동.
기존 데이터 그대로 유지.
```

---

## 2막 — Superpowers (Max 계정 전용)

> ⚠️ Superpowers 설치 필요: `/plugin marketplace add obra/superpowers-marketplace`

### 🔴 Superpowers 풀코스 (30~60분)

```
/superpowers:brainstorm

[앱이름] 앱 만들거야.
HTML CSS JS 로컬스토리지 기반으로.
```
```
(브레인스토밍 완료 후)
/superpowers:write-plan
```
```
(계획 확인 후)
/superpowers:execute-plan
```

### 🔴 Superpowers 피쳐 추가

```
현재 앱에 [기능] 추가해줘.
/superpowers:write-plan 으로 계획 먼저 짜줘.
```

---

## 3막 — 스펙주도개발 (Next.js + SQLite)

> 커맨드 파일 `.claude/commands/` 에 설치 후 사용

### 단계별 커맨드

```
/1.prd
→ docs/PRD.md 생성
```
```
/2.brainstorm
→ /superpowers:brainstorm
→ 설계 결정사항 docs/plans/design.md 저장
```
```
/3.1.docs
→ ARCHITECTURE.md, DATABASE.md, CLAUDE.md 생성
```
```
/3.5.review-docs        ← 체크포인트 1 (사람 검토)
→ 문서 요약 보고
→ 수정 요청 가능 → OK 후 다음 단계
```
```
/4.write-plan
→ /superpowers:writing-plans
→ docs/IMPLEMENTATION.md 생성 (코드 포함 단일 소스)
```
```
/5.1.review-implementation   ← 체크포인트 2 (LLM 자동 검토)
→ IMPLEMENTATION.md 검토 + 자동 수정
```
```
/5.5.setup-tasks
→ 태스크 등록 + docs/TASKS.md 생성
```
```
/6.execute-plan
→ /superpowers:executing-plans
→ IMPLEMENTATION.md 기반 순차 구현
→ TDD 자동
```
```
/7.code-review
→ /superpowers:requesting-code-review
→ 전체 코드 리뷰
```

### 세션 재개 시
```
docs/TASKS.md 에서 [x] 완료 확인 후
/6.execute-plan 으로 이어서 진행
```

---

## 🔧 오류 수정

```
# 전체 검증
완성된 앱의 모든 기능이 정상 동작하는지
확인하고 동작 안 하는 것 있으면 바로 수정해줘.
```
```
# 특정 기능 타겟팅
완성된 앱에서 [특정 기능] 부분만
확인하고 이상한 것 있으면 수정해줘.
```
```
# 에러 메시지 붙여넣기
이 에러 원인이 뭔지 설명하고 수정해줘.

[에러 메시지 붙여넣기]
```

> 💡 범위를 좁힐수록 빠르고 정확해요.

---

## ⚡ 핵심 원칙

```
PRD에 시간 투자할수록 구현이 빨라요.
  PRD 성의없음 → AI가 알아서 채움 → 내가 원하는 게 아님

도구를 상황에 맞게 골라요.
  빠르게:   맨손 딸깍 (1막)
  정확하게: Superpowers (2막)
  제대로:   스펙주도개발 (3막)

소스 오브 트루스는 하나로.
  3막에서 IMPLEMENTATION.md 가 유일한 실행 기준.
  문서가 많아도 실행은 하나만 봐요.
```
