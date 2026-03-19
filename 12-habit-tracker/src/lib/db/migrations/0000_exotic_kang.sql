CREATE TYPE "public"."category" AS ENUM('health', 'learning', 'exercise', 'other');--> statement-breakpoint
CREATE TABLE "habit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"habit_id" uuid NOT NULL,
	"date" date NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"memo" text,
	CONSTRAINT "habit_logs_habit_id_date_unique" UNIQUE("habit_id","date")
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"category" "category" DEFAULT 'other' NOT NULL,
	"color" varchar(7) DEFAULT '#3B82F6' NOT NULL,
	"icon" varchar(50),
	"target_frequency" integer DEFAULT 7 NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- CHECK constraints (data integrity)
ALTER TABLE "habits"
ADD CONSTRAINT "check_target_frequency"
CHECK (target_frequency >= 1 AND target_frequency <= 7);--> statement-breakpoint
ALTER TABLE "habits"
ADD CONSTRAINT "check_color_format"
CHECK (color ~ '^#[0-9A-Fa-f]{6}$');--> statement-breakpoint
ALTER TABLE "habit_logs"
ADD CONSTRAINT "check_date_not_future"
CHECK (date <= CURRENT_DATE);--> statement-breakpoint
-- Basic indexes
CREATE INDEX "idx_habits_archived" ON "habits"("is_archived");--> statement-breakpoint
CREATE INDEX "idx_habits_category" ON "habits"("category");--> statement-breakpoint
CREATE INDEX "idx_habit_logs_habit_id" ON "habit_logs"("habit_id");--> statement-breakpoint
CREATE INDEX "idx_habit_logs_date" ON "habit_logs"("date" DESC);--> statement-breakpoint
-- Advanced indexes (PERFORMANCE BOOST)
-- Partial index for active habits (most common query - 90% of queries)
CREATE INDEX "idx_habits_active_created" ON "habits"("created_at" DESC)
WHERE is_archived = false;--> statement-breakpoint
-- Composite index for streak calculation (optimizes ORDER BY habit_id, date DESC)
CREATE INDEX "idx_habit_logs_habit_date" ON "habit_logs"("habit_id", "date" DESC);