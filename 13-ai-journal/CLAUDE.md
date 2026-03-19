# AI Journal

## Tech Stack
Next.js 14 (App Router), TypeScript (strict), PostgreSQL (localhost:5435), Drizzle ORM, shadcn/ui, Recharts, AI SDK + Open Router, Model: `anthropic/claude-sonnet-4-20250514`

## Commands
```bash
npm run dev          # Dev server
npx drizzle-kit push # DB migrate
npx drizzle-kit studio # DB GUI
npm run build        # Build (MUST pass)
```

## Development Workflow
**CRITICAL: Phase-based development from PRD Section 7**
1. Complete phase fully → 2. `npm run build` → 3. Commit if pass → 4. Next phase

## AI Integration Rules
**IMPORTANT:** API key in `.env.local` as `OPENROUTER_API_KEY`

**YOU MUST:**
- Use AI SDK `generateText()` with Open Router provider
- Implement 3 prompts: emotion analysis, summary, weekly insight (see PRD 5.4)
- Handle errors gracefully with try-catch
- Show loading states during AI calls
- Validate JSON responses before storing
- Store all AI results in DB (prevent re-requests)

**NEVER:**
- Expose API key to client
- Skip error handling for AI calls
- Call AI from Client Components (use Server Actions)

## Database Rules
**YOU MUST:**
- Use existing PostgreSQL container (port 5435)
- Run `npx drizzle-kit push` before coding features
- Verify tables with Drizzle Studio
- Use `$inferSelect` / `$inferInsert` types from schema

**NEVER:**
- Query DB in Client Components
- Skip migrations
- Use raw SQL (use Drizzle query builder)

## File Structure
```
app/           → Pages, layouts
components/    → React components (journal/, calendar/, stats/, insight/)
db/            → schema.ts, index.ts
actions/       → Server Actions (journal.ts, emotion.ts, insight.ts)
lib/ai/        → client.ts, prompts.ts, analyze-emotion.ts
```

## Testing
**ALWAYS after each Phase:**
- `npm run build` must pass with 0 errors
- Manual browser testing
- Verify AI responses are valid JSON
- Check charts render correctly

## Critical Rules
- **ALWAYS** run `npm run build` after completing each Phase
- **ALWAYS** validate emotion scores are 1-10
- **ALWAYS** wrap AI JSON parsing in try-catch
- **NEVER** proceed to next Phase if build fails
