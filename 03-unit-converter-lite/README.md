# 1.3.test-unit-converter-lite

바이브코딩 워크샵 시연용 단위환산기 경량 버전.
Superpowers가 자동 발동된 사례.

---

## 핵심 포인트

**Superpowers를 직접 호출하지 않았다.**

아래 프롬프트만 입력했는데:

```
HTML CSS JS 로컬스토리지 기반 단위환산기 앱을 만들거야.
docs/PRD.md를 핵심만 간단하게 작성하고 바로 구현까지 해줘.
```

Claude Code가 문맥을 파악하고 스스로:
1. `writing-plans` 스킬 발동 → `docs/plans/` 에 구현 플랜 작성
2. `executing-plans` 스킬 발동 → 태스크별 순서대로 실행
3. PRD → 플랜 → 구현 전 과정 자동 처리

---

## 실행 순서 (phase 파일 기준)

**1.phase.md** — 첫 번째 프롬프트 (PRD + 구현 요청)
**2.phase.md** — 두 번째 프롬프트 (최근 변환 기록 버그 확인)

---

## 1.2와 차이점

| | 1.2 (풀스펙) | 1.3 (경량) |
|---|---|---|
| PRD | 상세 (12개 카테고리, 즐겨찾기, 히스토리 50건) | 핵심만 (6개 카테고리, 히스토리 5건) |
| 파일 | 단일 index.html | index.html + app.js + style.css 분리 |
| 결과물 복잡도 | 높음 | 낮음 |

PRD를 얼마나 상세하게 쓰냐에 따라 결과물이 달라진다는 걸 보여주는 비교 예시.

---

## 실행 방법

```bash
open index.html
```
