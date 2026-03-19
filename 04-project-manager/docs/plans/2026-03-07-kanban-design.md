# Kanban Board - Design Doc

Date: 2026-03-07

## Overview

기존 플랫 태스크 리스트를 3컬럼 칸반 보드로 교체. 카드 드래그앤드롭으로 컬럼 간 이동.

## Architecture

- **변경 범위**: `index.html` 단일 파일 수정 (오른쪽 태스크 패널 교체)
- **드래그 방식**: HTML5 Drag & Drop API (순수 JS, 외부 라이브러리 없음)
- **데이터 모델**: 변경 없음 (tasks[].status 그대로 활용)

## UI Layout

```
[왼쪽: 프로젝트 패널] | [오른쪽: 칸반 보드]
                      |  [헤더: 프로젝트명 + 태스크 추가폼]
                      |  [할일] [진행중] [완료]
                      |  카드   카드     카드
                      |  카드            카드
```

## Kanban Columns

- 3컬럼 CSS Grid (`grid-template-columns: 1fr 1fr 1fr`)
- 각 컬럼: 헤더(컬럼명 + 카운트 배지) + 드롭존 영역 + 카드 목록
- 컬럼별 배경색으로 상태 구분

## Cards

- 제목 표시, 더블클릭으로 인라인 편집 (기존 유지)
- 삭제 버튼 (기존 유지)
- status select 드롭다운 제거 (드래그로 대체)
- `draggable="true"` 속성

## Drag & Drop

- `dragstart`: taskId를 dataTransfer에 저장
- `dragover`: preventDefault() + 드롭존 하이라이트
- `dragleave`: 하이라이트 제거
- `drop`: taskId로 task 찾아 status 업데이트 → saveToStorage → renderTasks

## Task 추가

- 헤더 영역 입력폼 유지 → 항상 "할일(todo)" 상태로 추가
