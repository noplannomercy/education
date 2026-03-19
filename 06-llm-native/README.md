# 06-llm-native

바이브코딩의 다음 단계 — **만드는 것**에서 **시키는 것**으로.

웹앱의 백엔드 로직을 CLI로 변환하고,
LLM이 자연어로 전체 시스템을 오케스트레이션한다.

---

## 핵심 아이디어

바이브코딩으로 웹앱을 만들면 에이전트 인프라가 자동으로 따라온다.

```
사람용:    웹 UI (바이브코딩으로 생성)
에이전트용: CLI + SKILL.md → MCP → 자연어 오케스트레이션
```

**변환 비용:** 5시간 짜리 웹앱 → CLI 변환 5분, 오류 0.

---

## 구현된 CLI

| CLI | 원본 앱 | 데이터 계층 | 변환 시간 |
|-----|---------|-----------|---------|
| `cli-anything-unit-converter` | day1-unit-converter | 파일 기반 | ~5분 |
| `cli-anything-idea-generator` | day2-idea-generator | 파일 기반 | ~5분 |
| `cli-anything-note-taker` | day5-note-taker | 파일 기반 | ~5분 |
| `cli-anything-mini-crm` | day11-mini-crm | PostgreSQL | ~15분 |
| `cli-anything-wikiflow` | day52-wikiflow (5시간) | 파일 기반 | ~5분 |

---

## 설치

```bash
pip install -e unit-converter/agent-harness
pip install -e idea-generator/agent-harness
pip install -e note-taker/agent-harness
pip install -e mini-crm/agent-harness
pip install -e wikiflow/agent-harness
```

---

## LLM Native 시연

이 디렉토리에서 Claude Code를 열면 `CLAUDE.md`가 자동 로딩된다.
자연어만 입력하면 Claude가 CLI를 골라서 실행한다.

```
# 단순
100kg이 몇 파운드야?
코딩 아이디어 하나 줘봐

# 체이닝
코딩 아이디어 생성해서 즐겨찾기에 저장하고 노트에도 남겨줘

# 복합
신규 고객사 바포럼 온보딩해줘.
회사 등록하고, 담당자 추가하고, 딜 생성하고,
위키에 고객 페이지 만들고, 노트에 요약 저장해줘.
```

→ 전체 시나리오: [DEMO-SCENARIOS.md](DEMO-SCENARIOS.md)

---

## 왜 CLI인가

MCP는 "표준화된 인터페이스"고 덩치가 크다.
CLI는 Python 파일 하나, pip install 하면 끝.

```
검증 전:  LLM → CLI (직접, 5분 변환)
검증 후:  LLM → MCP → CLI (표준화, 필요 시)
```

SKILL.md를 MCP tool description으로 1:1 변환하면 MCP 전환 비용도 사실상 0.

---

## 변환 방법론

새 앱을 CLI로 변환할 때 코드베이스에서 세 가지만 찾는다.

```
찾을 것:  데이터 모델 / 데이터 접근 / 비즈니스 로직
버릴 것:  UI 전부 / 프레임워크 / 이벤트 / 인증
```

→ [CONVERSION-METHODOLOGY.md](CONVERSION-METHODOLOGY.md)
→ [CLI-COMPONENT-RUNBOOK.md](CLI-COMPONENT-RUNBOOK.md)

---

## 로드맵

```
바이브코딩 → CLI 변환 → SKILL.md → MCP 승격 → IRM 오케스트레이션
```

이게 LLM Native다.
