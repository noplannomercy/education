import { pgTable, uuid, varchar, text, integer, boolean, timestamp, date, pgEnum, unique } from 'drizzle-orm/pg-core'

// Category enum
export const categoryEnum = pgEnum('category', ['health', 'learning', 'exercise', 'other'])

// Habits table
export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: categoryEnum('category').notNull().default('other'),
  color: varchar('color', { length: 7 }).notNull().default('#3B82F6'),
  icon: varchar('icon', { length: 50 }),
  targetFrequency: integer('target_frequency').notNull().default(7),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Habit logs table
export const habitLogs = pgTable('habit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habit_id')
    .notNull()
    .references(() => habits.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  completedAt: timestamp('completed_at').notNull().defaultNow(),
  memo: text('memo'),
}, (table) => ({
  // Unique constraint: same habit cannot be checked twice on the same day
  uniqueHabitDate: unique().on(table.habitId, table.date),
}))

// TypeScript types
export type Habit = typeof habits.$inferSelect
export type NewHabit = typeof habits.$inferInsert
export type HabitLog = typeof habitLogs.$inferSelect
export type NewHabitLog = typeof habitLogs.$inferInsert
