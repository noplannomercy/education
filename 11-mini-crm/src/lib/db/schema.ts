import { pgTable, uuid, varchar, text, timestamp, integer, bigint, pgEnum, boolean, index, primaryKey, check } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ===========================
// ENUMS
// ===========================

export const dealStageEnum = pgEnum('deal_stage', [
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]);

export const activityTypeEnum = pgEnum('activity_type', [
  'call',
  'email',
  'meeting',
  'note',
]);

export const priorityEnum = pgEnum('priority', [
  'low',
  'medium',
  'high',
]);

// ===========================
// ENTITY TABLES
// ===========================

export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  industry: varchar('industry', { length: 100 }),
  website: varchar('website', { length: 255 }),
  address: text('address'),
  employeeCount: integer('employee_count'),
  memo: text('memo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('idx_companies_name').on(table.name),
  // pg_trgm index for fuzzy search (will be created in migration SQL)
}));

export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  position: varchar('position', { length: 100 }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
  memo: text('memo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('idx_contacts_name').on(table.name),
  emailIdx: index('idx_contacts_email').on(table.email),
  companyIdIdx: index('idx_contacts_company_id').on(table.companyId),
  // pg_trgm index for fuzzy search (will be created in migration SQL)
}));

export const deals = pgTable('deals', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull().default(0),
  stage: dealStageEnum('stage').notNull().default('lead'),
  expectedCloseDate: timestamp('expected_close_date'),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
  memo: text('memo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  titleIdx: index('idx_deals_title').on(table.title),
  stageIdx: index('idx_deals_stage').on(table.stage),
  contactIdIdx: index('idx_deals_contact_id').on(table.contactId),
  companyIdIdx: index('idx_deals_company_id').on(table.companyId),
  expectedCloseDateIdx: index('idx_deals_expected_close_date').on(table.expectedCloseDate),
  // pg_trgm index for fuzzy search (will be created in migration SQL)
}));

export const activities = pgTable('activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: activityTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  scheduledAt: timestamp('scheduled_at'),
  completedAt: timestamp('completed_at'),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('idx_activities_type').on(table.type),
  scheduledAtIdx: index('idx_activities_scheduled_at').on(table.scheduledAt),
  contactIdIdx: index('idx_activities_contact_id').on(table.contactId),
  companyIdIdx: index('idx_activities_company_id').on(table.companyId),
  dealIdIdx: index('idx_activities_deal_id').on(table.dealId),
  createdAtIdx: index('idx_activities_created_at').on(table.createdAt),
  // CHECK constraint: at least one parent FK must be non-null
  chkActivityHasParent: check(
    'chk_activity_has_parent',
    sql`contact_id IS NOT NULL OR company_id IS NOT NULL OR deal_id IS NOT NULL`
  ),
}));

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  priority: priorityEnum('priority').notNull().default('medium'),
  isCompleted: boolean('is_completed').notNull().default(false),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  priorityIdx: index('idx_tasks_priority').on(table.priority),
  dueDateIdx: index('idx_tasks_due_date').on(table.dueDate),
  isCompletedIdx: index('idx_tasks_is_completed').on(table.isCompleted),
  contactIdIdx: index('idx_tasks_contact_id').on(table.contactId),
  companyIdIdx: index('idx_tasks_company_id').on(table.companyId),
  dealIdIdx: index('idx_tasks_deal_id').on(table.dealId),
}));

export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 7 }).notNull(), // Hex color: #RRGGBB
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  nameIdx: index('idx_tags_name').on(table.name),
}));

export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===========================
// JUNCTION TABLES (M:N)
// ===========================

export const contactTags = pgTable('contact_tags', {
  contactId: uuid('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.contactId, table.tagId] }),
  contactIdIdx: index('idx_contact_tags_contact_id').on(table.contactId),
  tagIdIdx: index('idx_contact_tags_tag_id').on(table.tagId),
}));

export const companyTags = pgTable('company_tags', {
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.companyId, table.tagId] }),
  companyIdIdx: index('idx_company_tags_company_id').on(table.companyId),
  tagIdIdx: index('idx_company_tags_tag_id').on(table.tagId),
}));

export const dealTags = pgTable('deal_tags', {
  dealId: uuid('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.dealId, table.tagId] }),
  dealIdIdx: index('idx_deal_tags_deal_id').on(table.dealId),
  tagIdIdx: index('idx_deal_tags_tag_id').on(table.tagId),
}));

// ===========================
// RELATIONS
// ===========================

export const companiesRelations = relations(companies, ({ many }) => ({
  contacts: many(contacts),
  deals: many(deals),
  activities: many(activities),
  tasks: many(tasks),
  tags: many(companyTags),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  deals: many(deals),
  activities: many(activities),
  tasks: many(tasks),
  tags: many(contactTags),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [deals.contactId],
    references: [contacts.id],
  }),
  company: one(companies, {
    fields: [deals.companyId],
    references: [companies.id],
  }),
  activities: many(activities),
  tasks: many(tasks),
  tags: many(dealTags),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  contact: one(contacts, {
    fields: [activities.contactId],
    references: [contacts.id],
  }),
  company: one(companies, {
    fields: [activities.companyId],
    references: [companies.id],
  }),
  deal: one(deals, {
    fields: [activities.dealId],
    references: [deals.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  contact: one(contacts, {
    fields: [tasks.contactId],
    references: [contacts.id],
  }),
  company: one(companies, {
    fields: [tasks.companyId],
    references: [companies.id],
  }),
  deal: one(deals, {
    fields: [tasks.dealId],
    references: [deals.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  contacts: many(contactTags),
  companies: many(companyTags),
  deals: many(dealTags),
}));

export const contactTagsRelations = relations(contactTags, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactTags.contactId],
    references: [contacts.id],
  }),
  tag: one(tags, {
    fields: [contactTags.tagId],
    references: [tags.id],
  }),
}));

export const companyTagsRelations = relations(companyTags, ({ one }) => ({
  company: one(companies, {
    fields: [companyTags.companyId],
    references: [companies.id],
  }),
  tag: one(tags, {
    fields: [companyTags.tagId],
    references: [tags.id],
  }),
}));

export const dealTagsRelations = relations(dealTags, ({ one }) => ({
  deal: one(deals, {
    fields: [dealTags.dealId],
    references: [deals.id],
  }),
  tag: one(tags, {
    fields: [dealTags.tagId],
    references: [tags.id],
  }),
}));

// ===========================
// TYPE EXPORTS
// ===========================

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;
