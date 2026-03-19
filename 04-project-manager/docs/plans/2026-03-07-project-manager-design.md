# Project Manager App - Design Doc

Date: 2026-03-07

## Overview

HTML/CSS/JS 단일 파일 로컬스토리지 기반 프로젝트 관리 앱.

## Architecture

- **구현 방식**: 단일 `index.html` 파일 (CSS/JS 인라인)
- **저장소**: `localStorage` (`projects` 키)
- **의존성**: 없음 (순수 Vanilla JS)

## Data Model

```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "프로젝트명",
      "createdAt": "ISO8601",
      "tasks": [
        {
          "id": "uuid",
          "title": "태스크명",
          "status": "todo | inprogress | done",
          "createdAt": "ISO8601"
        }
      ]
    }
  ]
}
```

## UI Layout

2-패널 레이아웃:
- **왼쪽 패널**: 프로젝트 목록 + 추가 버튼
- **오른쪽 패널**: 선택된 프로젝트의 태스크 목록 + 추가 버튼

## Features

### 프로젝트 CRUD
- Create: 이름 입력 후 추가
- Read: 사이드바 목록 표시
- Update: 인라인 편집 (더블클릭 또는 편집 버튼)
- Delete: 삭제 버튼 (확인 없이 즉시 삭제)

### 태스크 CRUD
- Create: 제목 입력 후 추가
- Read: 오른쪽 패널에 목록 표시
- Update: 인라인 제목 편집 + 상태 드롭다운 변경
- Delete: 삭제 버튼

### 태스크 상태
- 할일 / 진행중 / 완료 (드롭다운 선택)
- 상태별 색상 구분

## Files

- `index.html` — 단일 파일 (HTML + CSS + JS)
- `docs/PRD.md` — 핵심 요구사항
