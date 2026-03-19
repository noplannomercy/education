# Unit Converter Lite - PRD

## 주요 기능
- 6개 카테고리 단위 환산: 길이, 무게, 온도, 부피, 넓이, 속도
- 실시간 변환 (입력 즉시 결과 표시)
- From/To 단위 스왑 버튼
- 최근 변환 기록 5건 표시

## 화면 구성
- 상단: 카테고리 탭 (길이 / 무게 / 온도 / 부피 / 넓이 / 속도)
- 중앙: From [단위 선택][값 입력] → To [단위 선택][결과]
- 스왑 버튼 (⇄)
- 하단: 최근 변환 기록 목록

## 로컬스토리지 저장 항목
- `uc_lastCategory`: 마지막 선택 카테고리 (string)
- `uc_lastUnits`: 카테고리별 from/to 단위 (JSON object)
- `uc_history`: 최근 5건 변환 기록 (JSON array)
