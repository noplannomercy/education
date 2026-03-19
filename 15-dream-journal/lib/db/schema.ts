// lib/db/schema.ts
import { pgTable, uuid, varchar, text, date, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// ========================================
// Enums
// ========================================

export const emotionEnum = pgEnum('emotion', ['positive', 'neutral', 'negative'])
export const symbolCategoryEnum = pgEnum('symbol_category', ['person', 'place', 'object', 'action', 'emotion'])
export const patternTypeEnum = pgEnum('pattern_type', ['theme', 'person', 'place', 'emotion'])

// ========================================
// Tables
// ========================================

// 1. dreams 테이블
export const dreams = pgTable('dreams', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  date: date('date').notNull(),
  emotion: emotionEnum('emotion').notNull(),
  vividness: integer('vividness').notNull(), // 1-5
  lucid: boolean('lucid').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 2. interpretations 테이블
export const interpretations = pgTable('interpretations', {
  id: uuid('id').defaultRandom().primaryKey(),
  dreamId: uuid('dream_id')
    .notNull()
    .references(() => dreams.id, { onDelete: 'cascade' })
    .unique(), // 1:1 관계
  interpretation: text('interpretation').notNull(),
  psychological: text('psychological'),
  symbolic: text('symbolic'),
  message: text('message'),
  analyzedAt: timestamp('analyzed_at').defaultNow().notNull(),
})

// 3. symbols 테이블
export const symbols = pgTable('symbols', {
  id: uuid('id').defaultRandom().primaryKey(),
  dreamId: uuid('dream_id')
    .notNull()
    .references(() => dreams.id, { onDelete: 'cascade' }),
  symbol: varchar('symbol', { length: 100 }).notNull(),
  category: symbolCategoryEnum('category').notNull(),
  meaning: text('meaning'),
  frequency: integer('frequency').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 4. patterns 테이블
export const patterns = pgTable('patterns', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: patternTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  occurrences: integer('occurrences').default(1).notNull(),
  dreamIds: text('dream_ids').array().notNull(), // TEXT[] 배열
  significance: text('significance'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========================================
// Relations
// ========================================

export const dreamsRelations = relations(dreams, ({ one, many }) => ({
  interpretation: one(interpretations, {
    fields: [dreams.id],
    references: [interpretations.dreamId],
  }),
  symbols: many(symbols),
}))

export const interpretationsRelations = relations(interpretations, ({ one }) => ({
  dream: one(dreams, {
    fields: [interpretations.dreamId],
    references: [dreams.id],
  }),
}))

export const symbolsRelations = relations(symbols, ({ one }) => ({
  dream: one(dreams, {
    fields: [symbols.dreamId],
    references: [dreams.id],
  }),
}))

// ========================================
// Zod Schemas (Validation)
// ========================================

// Insert Schemas
export const insertDreamSchema = createInsertSchema(dreams, {
  title: z.string().min(1, '제목을 입력해주세요').max(255, '제목은 255자 이하여야 합니다'),
  content: z.string().min(10, '내용은 최소 10자 이상 입력해주세요').max(10000, '내용은 10,000자 이하여야 합니다'),
  date: z.coerce.date().max(new Date(), '미래 날짜는 선택할 수 없습니다'),
  emotion: z.enum(['positive', 'neutral', 'negative']),
  vividness: z.number().int().min(1).max(5, '생생함은 1-5 사이여야 합니다'),
  lucid: z.boolean().default(false),
})

export const insertInterpretationSchema = createInsertSchema(interpretations, {
  dreamId: z.string().uuid(),
  interpretation: z.string().min(1),
})

export const insertSymbolSchema = createInsertSchema(symbols, {
  dreamId: z.string().uuid(),
  symbol: z.string().min(1).max(100),
  category: z.enum(['person', 'place', 'object', 'action', 'emotion']),
  frequency: z.number().int().min(1).default(1),
})

export const insertPatternSchema = createInsertSchema(patterns, {
  type: z.enum(['theme', 'person', 'place', 'emotion']),
  name: z.string().min(1).max(255),
  dreamIds: z.array(z.string().uuid()).min(1, '최소 하나의 꿈 ID가 필요합니다'),
  occurrences: z.number().int().min(1).default(1),
})

// Select Schemas
export const selectDreamSchema = createSelectSchema(dreams)
export const selectInterpretationSchema = createSelectSchema(interpretations)
export const selectSymbolSchema = createSelectSchema(symbols)
export const selectPatternSchema = createSelectSchema(patterns)

// ========================================
// Type Inference
// ========================================

// Insert Types (클라이언트에서 데이터 생성 시 사용)
export type InsertDream = z.infer<typeof insertDreamSchema>
export type InsertInterpretation = z.infer<typeof insertInterpretationSchema>
export type InsertSymbol = z.infer<typeof insertSymbolSchema>
export type InsertPattern = z.infer<typeof insertPatternSchema>

// Select Types (DB에서 데이터 조회 시 사용)
export type Dream = z.infer<typeof selectDreamSchema>
export type Interpretation = z.infer<typeof selectInterpretationSchema>
export type Symbol = z.infer<typeof selectSymbolSchema>
export type Pattern = z.infer<typeof selectPatternSchema>

// Joined Types (관계 포함)
export type DreamWithInterpretation = Dream & {
  interpretation?: Interpretation | null
}

export type DreamWithSymbols = Dream & {
  symbols: Symbol[]
}

export type DreamWithAll = Dream & {
  interpretation?: Interpretation | null
  symbols: Symbol[]
}
