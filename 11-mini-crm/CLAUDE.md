# Mini CRM - Project Status

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- PostgreSQL + Drizzle ORM
- shadcn/ui + Tailwind CSS
- @dnd-kit (Kanban), Recharts

## ✅ ALL PHASES COMPLETED

### Phase 1: Database Setup
- 8개 테이블 스키마 완성
- Drizzle ORM 설정 완료

### Phase 2: Company & Contact
- API: `/api/companies`, `/api/contacts` (CRUD)
- UI: `/companies`, `/contacts` 페이지

### Phase 3: Deal & Pipeline
- API: `/api/deals` (CRUD + stage update)
- UI: `/deals` 칸반 보드 (DnD)

### Phase 4: Activity & Task
- API: `/api/activities`, `/api/tasks` (CRUD + complete)
- UI: `/activities`, `/tasks` 페이지

### Phase 5: Tag & Search
- API: `/api/tags`, `/api/search`
- API: Tag assignment for contacts/companies/deals
- UI: `/tags` 페이지, TagBadge 컴포넌트

### Phase 6: Dashboard & Templates
- API: `/api/email-templates` (CRUD)
- API: `/api/stats` (통계)
- UI: `/` 대시보드 (통계 카드, 파이프라인 요약, 오늘 활동, 최근 활동)
- UI: `/email-templates` 템플릿 관리 (변수 치환 지원)

## 📊 구현된 기능 (15개)
1. ✅ Contact Management (CRUD)
2. ✅ Company Management (CRUD)
3. ✅ Contact-Company Linking
4. ✅ Deal Management (CRUD)
5. ✅ Pipeline Stages (6단계)
6. ✅ Deal Stage Change (DnD)
7. ✅ Activity Log
8. ✅ Activity Scheduling
9. ✅ Task Assignment
10. ✅ Notes & Memos
11. ✅ Tag System
12. ✅ Advanced Search & Filter
13. ✅ Email Templates (변수 치환)
14. ✅ Statistics & Reports
15. ✅ Dashboard

## Commands
```bash
npm run dev           # 개발 서버
npm run build         # 빌드
npm run type-check    # 타입 체크
npm run db:push       # DB 스키마 푸시
npm run db:studio     # Drizzle Studio
```

## Project Complete! 🎉
