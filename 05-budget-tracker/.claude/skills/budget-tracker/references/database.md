# Database

## 기술 스택

- **ORM**: Drizzle ORM
- **DB**: SQLite (better-sqlite3)
- **마이그레이션**: drizzle-kit

## 연결 설정 (`src/lib/db/index.ts`)

```ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('./budget.db');
export const db = drizzle(sqlite, { schema });
```

## better-auth 설정 (`src/lib/auth.ts`)

```ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';

// src/proxy.ts — Next.js 16에서 middleware.ts 대신 proxy.ts 사용
// export function proxy(request: NextRequest) { ... }

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: { enabled: true },
});
```

## 스키마 패턴

better-auth 필수 테이블 (schema.ts에 반드시 포함, 실제 필드 포함):
```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
```

앱 테이블:
- `categories`: id, userId, name, type, color, createdAt, updatedAt
- `transactions`: id, userId, categoryId, amount, type, description, date, createdAt, updatedAt

type enum (categories): `'income' | 'expense'`
type enum (transactions): `'income' | 'expense'`

### 전체 스키마 예시

```ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  color: text('color').notNull().default('#6366f1'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  categoryId: text('category_id').references(() => categories.id),
  amount: real('amount').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  description: text('description'),
  date: text('date').notNull(), // 'YYYY-MM-DD' 형식
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

## 마이그레이션

```bash
npx drizzle-kit generate   # 마이그레이션 파일 생성
npx drizzle-kit migrate    # 마이그레이션 실행
```

## 쿼리 패턴

```ts
// 목록 조회 (소유권 필터 필수)
const txList = await db.select().from(transactions)
  .where(eq(transactions.userId, userId))
  .orderBy(desc(transactions.date));

// 단건 조회 + 소유권 검증
const tx = await db.select().from(transactions)
  .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
  .limit(1);

// 월별 합계
const summary = await db.select({
  type: transactions.type,
  total: sql<number>`sum(${transactions.amount})`,
}).from(transactions)
  .where(and(
    eq(transactions.userId, userId),
    like(transactions.date, `${year}-${month}-%`),
  ))
  .groupBy(transactions.type);
```

## drizzle.config.ts

```ts
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: { url: './budget.db' },
});
```
