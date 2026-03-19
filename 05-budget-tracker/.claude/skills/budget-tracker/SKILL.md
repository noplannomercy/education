# budget-tracker 프로젝트 스킬

이 프로젝트의 표준을 기반으로 작업한다.

## 참고 문서 사용 규칙

작업 전 반드시 해당 문서를 읽고 시작할 것:

- **DB 스키마/쿼리/마이그레이션** → `references/database.md` 읽기
- **API 엔드포인트 설계/구현** → `references/api.md` 읽기
- **레이어 구조/파일 위치/설계 결정** → `references/architecture.md` 읽기
- **코드 작성 전반** → `references/conventions.md` 읽기

여러 영역에 걸친 작업(예: API + DB 동시)은 관련 문서 모두 읽기.

## 라이브러리 스펙

Drizzle ORM, Next.js, React 등 라이브러리 최신 API가 불확실하면
context7으로 확인 후 진행할 것.

## 작업 원칙

- 표준 문서에 정의된 패턴을 벗어나지 말 것
- 새로운 패턴이 필요하면 먼저 사용자에게 확인
- 문서에 없는 케이스는 기존 패턴에서 추론해서 일관성 유지
