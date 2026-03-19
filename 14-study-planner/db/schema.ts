import { pgTable, serial, varchar, integer, text, timestamp, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }).notNull().default('#3b82f6'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const studySessions = pgTable('study_sessions', {
  id: serial('id').primaryKey(),
  subjectId: integer('subject_id')
    .notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  durationMinutes: integer('duration_minutes').notNull(),
  comprehension: integer('comprehension').notNull(), // 1-5
  notes: text('notes'),
  studiedAt: timestamp('studied_at').notNull().defaultNow(),
});

export const learningPlans = pgTable('learning_plans', {
  id: serial('id').primaryKey(),
  subjectId: integer('subject_id')
    .notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  studyGoal: text('study_goal').notNull(),
  weeksAvailable: integer('weeks_available').notNull(),
  aiPlan: text('ai_plan').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, completed, cancelled
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const reviewSchedules = pgTable('review_schedules', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .notNull()
    .references(() => studySessions.id, { onDelete: 'cascade' }),
  nextReviewDate: date('next_review_date').notNull(),
  repetitionCount: integer('repetition_count').notNull().default(0),
  comprehension: integer('comprehension'), // Stored for re-evaluation
  completedAt: timestamp('completed_at'),
});

export const motivations = pgTable('motivations', {
  id: serial('id').primaryKey(),
  aiMessage: text('ai_message').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const subjectsRelations = relations(subjects, ({ many }) => ({
  studySessions: many(studySessions),
  learningPlans: many(learningPlans),
}));

export const studySessionsRelations = relations(studySessions, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [studySessions.subjectId],
    references: [subjects.id],
  }),
  reviewSchedules: many(reviewSchedules),
}));

export const learningPlansRelations = relations(learningPlans, ({ one }) => ({
  subject: one(subjects, {
    fields: [learningPlans.subjectId],
    references: [subjects.id],
  }),
}));

export const reviewSchedulesRelations = relations(reviewSchedules, ({ one }) => ({
  session: one(studySessions, {
    fields: [reviewSchedules.sessionId],
    references: [studySessions.id],
  }),
}));

// Type inference for TypeScript
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

export type StudySession = typeof studySessions.$inferSelect;
export type NewStudySession = typeof studySessions.$inferInsert;

export type LearningPlan = typeof learningPlans.$inferSelect;
export type NewLearningPlan = typeof learningPlans.$inferInsert;

export type ReviewSchedule = typeof reviewSchedules.$inferSelect;
export type NewReviewSchedule = typeof reviewSchedules.$inferInsert;

export type Motivation = typeof motivations.$inferSelect;
export type NewMotivation = typeof motivations.$inferInsert;
