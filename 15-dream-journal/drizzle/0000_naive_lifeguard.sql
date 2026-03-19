CREATE TYPE "public"."emotion" AS ENUM('positive', 'neutral', 'negative');--> statement-breakpoint
CREATE TYPE "public"."pattern_type" AS ENUM('theme', 'person', 'place', 'emotion');--> statement-breakpoint
CREATE TYPE "public"."symbol_category" AS ENUM('person', 'place', 'object', 'action', 'emotion');--> statement-breakpoint
CREATE TABLE "dreams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"date" date NOT NULL,
	"emotion" "emotion" NOT NULL,
	"vividness" integer NOT NULL,
	"lucid" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interpretations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dream_id" uuid NOT NULL,
	"interpretation" text NOT NULL,
	"psychological" text,
	"symbolic" text,
	"message" text,
	"analyzed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interpretations_dream_id_unique" UNIQUE("dream_id")
);
--> statement-breakpoint
CREATE TABLE "patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "pattern_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"occurrences" integer DEFAULT 1 NOT NULL,
	"dream_ids" text[] NOT NULL,
	"significance" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "symbols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dream_id" uuid NOT NULL,
	"symbol" varchar(100) NOT NULL,
	"category" "symbol_category" NOT NULL,
	"meaning" text,
	"frequency" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_dream_id_dreams_id_fk" FOREIGN KEY ("dream_id") REFERENCES "public"."dreams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symbols" ADD CONSTRAINT "symbols_dream_id_dreams_id_fk" FOREIGN KEY ("dream_id") REFERENCES "public"."dreams"("id") ON DELETE cascade ON UPDATE no action;