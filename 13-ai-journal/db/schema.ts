// db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  timestamp,
  integer,
  jsonb,
  primaryKey,
  unique,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==================== Tables ====================

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  date: date('date').notNull(),
  summary: text('summary'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  dateIdx: index('idx_journal_entries_date').on(table.date),
}));

export const emotionAnalyses = pgTable('emotion_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  journalId: uuid('journal_id')
    .references(() => journalEntries.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  primaryEmotion: varchar('primary_emotion', { length: 50 }).notNull(),
  emotionScore: integer('emotion_score').notNull(),
  emotions: jsonb('emotions').notNull().$type<EmotionsType>(),
  keywords: jsonb('keywords').notNull().$type<string[]>(),
  analyzedAt: timestamp('analyzed_at').defaultNow(),
}, (table) => ({
  journalIdx: index('idx_emotion_analyses_journal').on(table.journalId),
}));

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 7 }).notNull().default('#3B82F6'),
});

export const journalTags = pgTable('journal_tags', {
  journalId: uuid('journal_id')
    .references(() => journalEntries.id, { onDelete: 'cascade' })
    .notNull(),
  tagId: uuid('tag_id')
    .references(() => tags.id, { onDelete: 'cascade' })
    .notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.journalId, table.tagId] }),
  journalIdx: index('idx_journal_tags_journal').on(table.journalId),
  tagIdx: index('idx_journal_tags_tag').on(table.tagId),
}));

export const weeklyInsights = pgTable('weekly_insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  weekStart: date('week_start').notNull(),
  weekEnd: date('week_end').notNull(),
  insight: text('insight').notNull(),
  emotionSummary: jsonb('emotion_summary').notNull().$type<EmotionSummaryType>(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueWeek: unique().on(table.weekStart, table.weekEnd),
}));

// ==================== Relations ====================

export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  emotionAnalysis: one(emotionAnalyses, {
    fields: [journalEntries.id],
    references: [emotionAnalyses.journalId],
  }),
  journalTags: many(journalTags),
}));

export const emotionAnalysesRelations = relations(emotionAnalyses, ({ one }) => ({
  journal: one(journalEntries, {
    fields: [emotionAnalyses.journalId],
    references: [journalEntries.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  journalTags: many(journalTags),
}));

export const journalTagsRelations = relations(journalTags, ({ one }) => ({
  journal: one(journalEntries, {
    fields: [journalTags.journalId],
    references: [journalEntries.id],
  }),
  tag: one(tags, {
    fields: [journalTags.tagId],
    references: [tags.id],
  }),
}));

// ==================== Types ====================

export type EmotionsType = {
  happiness: number;
  sadness: number;
  anger: number;
  anxiety: number;
  calm: number;
  gratitude: number;
};

export type EmotionSummaryType = {
  averageScore: number;
  dominantEmotion: string;
  emotionCounts: Record<string, number>;
};

// Inferred types
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type EmotionAnalysis = typeof emotionAnalyses.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type WeeklyInsight = typeof weeklyInsights.$inferSelect;
