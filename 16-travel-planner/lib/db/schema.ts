// src/lib/db/schema.ts

import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  time,
  timestamp,
  decimal,
  integer,
  boolean,
  jsonb,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// ============================================================================
// Enums
// ============================================================================

export const tripTypeEnum = pgEnum('trip_type', [
  'vacation',
  'business',
  'adventure',
  'backpacking',
]);

export const tripStatusEnum = pgEnum('trip_status', [
  'planning',
  'ongoing',
  'completed',
]);

export const destinationCategoryEnum = pgEnum('destination_category', [
  'attraction',
  'restaurant',
  'accommodation',
  'shopping',
  'activity',
]);

export const priorityEnum = pgEnum('priority', [
  'high',
  'medium',
  'low',
]);

export const expenseCategoryEnum = pgEnum('expense_category', [
  'transport',
  'accommodation',
  'food',
  'activity',
  'shopping',
  'other',
]);

export const aiRecommendationTypeEnum = pgEnum('ai_recommendation_type', [
  'itinerary',
  'place',
  'budget',
  'optimization',
  'insight',
]);

// ============================================================================
// Tables
// ============================================================================

// 1. trips (여행)
export const trips = pgTable(
  'trips',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 }).notNull(), // 멀티 유저 지원
    name: varchar('name', { length: 255 }).notNull(),
    destination: varchar('destination', { length: 255 }).notNull(),
    country: varchar('country', { length: 100 }).notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    budget: decimal('budget', { precision: 12, scale: 2 }).notNull().default('0'),
    actualSpent: decimal('actual_spent', { precision: 12, scale: 2 }).notNull().default('0'),
    travelers: integer('travelers').notNull().default(1),
    tripType: tripTypeEnum('trip_type').notNull(),
    status: tripStatusEnum('status').notNull().default('planning'),
    version: integer('version').notNull().default(1), // Optimistic locking
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()), // Auto-update
  },
  (table) => ({
    userIdIdx: index('trips_user_id_idx').on(table.userId),
    startDateIdx: index('trips_start_date_idx').on(table.startDate),
    statusIdx: index('trips_status_idx').on(table.status),
    destinationIdx: index('trips_destination_idx').on(table.destination),
    tripTypeIdx: index('trips_trip_type_idx').on(table.tripType),
  })
);

// 2. destinations (목적지)
export const destinations = pgTable(
  'destinations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    country: varchar('country', { length: 100 }).notNull(),
    category: destinationCategoryEnum('category').notNull(),
    averageCost: decimal('average_cost', { precision: 10, scale: 2 }).notNull().default('0'),
    recommendedDuration: integer('recommended_duration').notNull().default(60), // 분
    description: text('description'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    cityIdx: index('destinations_city_idx').on(table.city),
    countryIdx: index('destinations_country_idx').on(table.country),
    categoryIdx: index('destinations_category_idx').on(table.category),
    cityCategoryIdx: index('destinations_city_category_idx').on(table.city, table.category),
  })
);

// 3. itineraries (일정)
export const itineraries = pgTable(
  'itineraries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    destinationId: uuid('destination_id').references(() => destinations.id, {
      onDelete: 'set null',
    }),
    activity: varchar('activity', { length: 500 }).notNull(),
    notes: text('notes'),
    priority: priorityEnum('priority').notNull().default('medium'),
    completed: boolean('completed').notNull().default(false),
    order: integer('order').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tripIdIdx: index('itineraries_trip_id_idx').on(table.tripId),
    dateIdx: index('itineraries_date_idx').on(table.date),
    tripDateIdx: index('itineraries_trip_date_idx').on(table.tripId, table.date),
    tripOrderIdx: index('itineraries_trip_order_idx').on(table.tripId, table.order),
  })
);

// 4. expenses (지출)
export const expenses = pgTable(
  'expenses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    category: expenseCategoryEnum('category').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('KRW'),
    description: varchar('description', { length: 500 }).notNull(),
    date: date('date').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tripIdIdx: index('expenses_trip_id_idx').on(table.tripId),
    categoryIdx: index('expenses_category_idx').on(table.category),
    dateIdx: index('expenses_date_idx').on(table.date),
    tripCategoryIdx: index('expenses_trip_category_idx').on(table.tripId, table.category),
  })
);

// 5. ai_recommendations (AI 추천)
export const aiRecommendations = pgTable(
  'ai_recommendations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    type: aiRecommendationTypeEnum('type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    metadata: jsonb('metadata'),
    applied: boolean('applied').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tripIdIdx: index('ai_recs_trip_id_idx').on(table.tripId),
    typeIdx: index('ai_recs_type_idx').on(table.type),
    appliedIdx: index('ai_recs_applied_idx').on(table.applied),
    tripTypeIdx: index('ai_recs_trip_type_idx').on(table.tripId, table.type),
  })
);

// ============================================================================
// Relations
// ============================================================================

export const tripsRelations = relations(trips, ({ many }) => ({
  itineraries: many(itineraries),
  expenses: many(expenses),
  aiRecommendations: many(aiRecommendations),
}));

export const destinationsRelations = relations(destinations, ({ many }) => ({
  itineraries: many(itineraries),
}));

export const itinerariesRelations = relations(itineraries, ({ one }) => ({
  trip: one(trips, {
    fields: [itineraries.tripId],
    references: [trips.id],
  }),
  destination: one(destinations, {
    fields: [itineraries.destinationId],
    references: [destinations.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  trip: one(trips, {
    fields: [expenses.tripId],
    references: [trips.id],
  }),
}));

export const aiRecommendationsRelations = relations(aiRecommendations, ({ one }) => ({
  trip: one(trips, {
    fields: [aiRecommendations.tripId],
    references: [trips.id],
  }),
}));

// ============================================================================
// Type Inference
// ============================================================================

// Select types (DB → TypeScript)
export type Trip = InferSelectModel<typeof trips>;
export type Destination = InferSelectModel<typeof destinations>;
export type Itinerary = InferSelectModel<typeof itineraries>;
export type Expense = InferSelectModel<typeof expenses>;
export type AIRecommendation = InferSelectModel<typeof aiRecommendations>;

// Insert types (TypeScript → DB)
export type NewTrip = InferInsertModel<typeof trips>;
export type NewDestination = InferInsertModel<typeof destinations>;
export type NewItinerary = InferInsertModel<typeof itineraries>;
export type NewExpense = InferInsertModel<typeof expenses>;
export type NewAIRecommendation = InferInsertModel<typeof aiRecommendations>;

// With relations types
export type TripWithRelations = Trip & {
  itineraries: Itinerary[];
  expenses: Expense[];
  aiRecommendations: AIRecommendation[];
};

export type ItineraryWithRelations = Itinerary & {
  trip: Trip;
  destination: Destination | null;
};
