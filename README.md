# 바이브코딩 → LLM Native

LLM으로 소프트웨어를 **만들고**, 나아가 LLM이 소프트웨어를 **사용하는** 단계까지.

바이브코딩 실습 자료와 구현 예제, 그리고 LLM Native 전환 방법론을 담은 레포지토리입니다.

---

## 강의 구성

### 1막 — 맨손 딸깍

아이디어를 자연어로 설명하면 LLM이 앱을 만든다.
계획 없이, 빠르게. 방향만 잡으면 된다.

- Todo App: 4분 생성
- 단위 변환기: PRD 작성 → 앱 생성 흐름 체험

### 2막 — Superpowers 장착

PRD 작성 → 구현 계획 → TDD → 자동 검증.
속도는 줄지만 버그가 없다. 팀 프로젝트에 쓸 수 있는 수준.

- 단위 변환기 (경량): 9분
- 프로젝트 매니저: 16분

### 3막 — 스펙 주도 개발

설계 문서 기반의 체계적 개발.
references 폴더, E2E 테스트, 서브에이전트까지 활용한다.

- 가계부 앱 (Neo-Brutalism): Next.js + better-auth + Drizzle + E2E 테스트

---

## 프로젝트

| 폴더 | 앱 | 막 | 설명 |
|------|----|----|------|
| `01-todo` | Todo App | 1막 | 단일 HTML 파일, 로컬스토리지, 4분 생성 |
| `02-unit-converter` | 단위 변환기 | 1막 | PRD 기반 생성, 문서 → 앱 흐름 |
| `03-unit-converter-lite` | 단위 변환기 (경량) | 2막 | Superpowers 적용, 9분 생성 |
| `04-project-manager` | 프로젝트 매니저 | 2막 | 칸반 보드, 16분 생성 |
| `05-budget-tracker` | 가계부 앱 | 3막 | Next.js + better-auth + Drizzle, E2E 테스트 포함 |

---

## 문서

| 파일 | 내용 |
|------|------|
| `docs/바이브코딩_교육_기획.md` | 강의 전체 구성 및 실측 데이터 |
| `docs/바이브코딩_교육_대본.md` | 강사 대본 |
| `docs/사전_설치_가이드.md` | 수강생 환경 설정 가이드 |
| `docs/Claude_Code_프롬프트_치트시트.md` | 자주 쓰는 프롬프트 모음 |
| `docs/pptx/llm-native-roadmap-대본.md` | LLM Native 로드맵 발표 대본 |

---

## LLM Native (진행중)

바이브코딩은 시작점이다.

> 만드는 것에서 → 시키는 것으로

### 핵심 아이디어

웹앱을 만드는 순간 에이전트 인프라가 따라온다.

- **사람용:** 웹 UI
- **에이전트용:** CLI + SKILL.md

웹앱의 UI를 걷어내고 비즈니스 로직만 CLI로 뜯어낸다.
SKILL.md로 LLM에게 사용법을 알려주면, LLM이 자연어 한 마디로 복합 워크플로우를 직접 실행한다.
n8n, Zapier 없이.

### 실증 데이터

| 앱 | 앱 개발 | CLI 변환 |
|----|---------|----------|
| unit-converter | - | 5분 |
| idea-generator | - | 5분 |
| note-taker | - | 10분 |
| mini-crm | - | 15분 |
| wikiflow | 5시간 | 5분 |

### 전환 구조

```
웹앱 (사람이 사용)
  └── UI 제거 → CLI 변환 (5분)
        └── SKILL.md 작성 (LLM 사용법 등록)
              └── MCP Aggregate (여러 CLI 묶기)
                    └── LLM이 자연어로 오케스트레이션
```

### 시연 예시

```
사용자: "Platform Wiki 만들고, 멤버 3명 추가하고,
         폴더 3개에 문서 작성, 배포, 즐겨찾기, 코멘트, 대시보드 출력해줘"

→ LLM이 9단계를 스스로 계획하고 실행
→ 워크플로우 사전 정의 없음
→ 노드 그래프 없음
```

### 로드맵

```
바이브코딩 → CLI 변환 → MCP 등록 → Skills → LLM Native
```

자세한 내용: `docs/pptx/llm-native-roadmap-대본.md`
