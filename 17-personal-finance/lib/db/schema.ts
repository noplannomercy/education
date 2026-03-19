import {
  pgTable,
  uuid,
  varchar,
  decimal,
  date,
  timestamp,
  text,
  jsonb,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core'

// ========== Enums ==========
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense'])
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'transfer'])
export const insightTypeEnum = pgEnum('insight_type', [
  'spending_pattern',
  'budget_suggestion',
  'anomaly_detection',
  'savings_advice',
])

// ========== Categories ==========
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 7 }).notNull().default('#6366f1'),
  icon: varchar('icon', { length: 50 }).notNull().default('receipt'),
  monthlyBudget: decimal('monthly_budget', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ========== Transactions ==========
export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    date: date('date').notNull(),
    type: transactionTypeEnum('type').notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull().default('card'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_tx_date').on(table.date),
    index('idx_tx_type').on(table.type),
    index('idx_tx_category').on(table.category),
  ]
)

// ========== Budgets ==========
export const budgets = pgTable('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  month: varchar('month', { length: 7 }).notNull().unique(),
  totalBudget: decimal('total_budget', { precision: 12, scale: 2 }).notNull(),
  categoryBudgets: jsonb('category_budgets').$type<Record<string, number>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========== AI Insights ==========
export const aiInsights = pgTable(
  'ai_insights',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: insightTypeEnum('type').notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    content: text('content').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    month: varchar('month', { length: 7 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_insights_month').on(table.month),
  ]
)

// ========== Types ==========
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Budget = typeof budgets.$inferSelect
export type NewBudget = typeof budgets.$inferInsert
export type AiInsight = typeof aiInsights.$inferSelect
export type NewAiInsight = typeof aiInsights.$inferInsert
