-- PostGIS doit être activé avant cette migration
-- Activez-le dans Supabase : Extensions → postgis → Enable
-- ou via SQL Editor : CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text,
	"source" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"location" geometry(Point, 4326) NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"postal_code" text,
	"phone" text,
	"email" text,
	"website" text,
	"hours" jsonb,
	"conditions" text,
	"languages" text[],
	"description" text,
	"source_url" text,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Index spatial GIST (obligatoire pour ST_DWithin avec de la perf)
CREATE INDEX "services_location_gist_idx" ON "services" USING GIST ("location");
--> statement-breakpoint

-- Index btree standards
CREATE INDEX "services_source_external_id_idx" ON "services" USING btree ("source","external_id");
--> statement-breakpoint
CREATE INDEX "services_category_idx" ON "services" USING btree ("category");
--> statement-breakpoint
CREATE INDEX "services_city_idx" ON "services" USING btree ("city");
--> statement-breakpoint

-- Contrainte d'unicité pour les upserts quotidiens (source + id externe)
ALTER TABLE "services"
  ADD CONSTRAINT "services_source_external_id_unique" UNIQUE ("source", "external_id");
