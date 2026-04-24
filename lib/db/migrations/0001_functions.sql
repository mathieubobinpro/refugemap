-- ================================================================
-- RefugeMap — Fonctions PostgreSQL pour l'API et l'ingestion
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- ================================================================

-- ── 1. Recherche géospatiale ────────────────────────────────────
-- Appelée via supabase.rpc('search_services', { user_lat, user_lng, ... })
CREATE OR REPLACE FUNCTION search_services(
  user_lat       double precision,
  user_lng       double precision,
  radius_m       integer          DEFAULT 5000,
  filter_category text            DEFAULT NULL,
  result_limit   integer          DEFAULT 50
)
RETURNS TABLE (
  id           uuid,
  source       text,
  name         text,
  category     text,
  subcategory  text,
  lat          double precision,
  lng          double precision,
  address      text,
  city         text,
  postal_code  text,
  phone        text,
  email        text,
  website      text,
  hours        jsonb,
  conditions   text,
  languages    text[],
  description  text,
  source_url   text,
  last_updated timestamptz,
  distance     double precision
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    s.id, s.source, s.name, s.category, s.subcategory,
    ST_Y(s.location::geometry)  AS lat,
    ST_X(s.location::geometry)  AS lng,
    s.address, s.city, s.postal_code,
    s.phone, s.email, s.website,
    s.hours, s.conditions, s.languages,
    s.description, s.source_url, s.last_updated,
    ST_Distance(
      s.location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance
  FROM services s
  WHERE ST_DWithin(
    s.location::geography,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_m
  )
  AND (filter_category IS NULL OR s.category = filter_category)
  ORDER BY distance ASC
  LIMIT result_limit;
$$;

-- ── 2. Upsert d'un service (ingestion) ─────────────────────────
-- Appelée via supabase.rpc('upsert_service', { p_external_id, ... })
CREATE OR REPLACE FUNCTION upsert_service(
  p_external_id  text,
  p_source       text,
  p_name         text,
  p_category     text,
  p_subcategory  text             DEFAULT NULL,
  p_lat          double precision DEFAULT NULL,
  p_lng          double precision DEFAULT NULL,
  p_address      text             DEFAULT '',
  p_city         text             DEFAULT '',
  p_postal_code  text             DEFAULT NULL,
  p_phone        text             DEFAULT NULL,
  p_email        text             DEFAULT NULL,
  p_website      text             DEFAULT NULL,
  p_hours        jsonb            DEFAULT NULL,
  p_conditions   text             DEFAULT NULL,
  p_languages    text[]           DEFAULT NULL,
  p_description  text             DEFAULT NULL,
  p_source_url   text             DEFAULT NULL
)
RETURNS void
LANGUAGE sql SECURITY DEFINER
AS $$
  INSERT INTO services (
    id, external_id, source, name, category, subcategory,
    location, address, city, postal_code,
    phone, email, website, hours, conditions, languages,
    description, source_url, last_updated
  ) VALUES (
    gen_random_uuid(),
    p_external_id, p_source, p_name, p_category, p_subcategory,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326),
    p_address, p_city, p_postal_code,
    p_phone, p_email, p_website,
    p_hours, p_conditions, p_languages,
    p_description, p_source_url,
    NOW()
  )
  ON CONFLICT (source, external_id) DO UPDATE SET
    name         = EXCLUDED.name,
    category     = EXCLUDED.category,
    location     = EXCLUDED.location,
    address      = EXCLUDED.address,
    city         = EXCLUDED.city,
    phone        = EXCLUDED.phone,
    website      = EXCLUDED.website,
    hours        = EXCLUDED.hours,
    description  = EXCLUDED.description,
    last_updated = NOW();
$$;

-- ── 3. Détail d'un service par ID ──────────────────────────────
CREATE OR REPLACE FUNCTION get_service_by_id(service_id uuid)
RETURNS TABLE (
  id uuid, source text, name text, category text, subcategory text,
  lat double precision, lng double precision,
  address text, city text, postal_code text,
  phone text, email text, website text,
  hours jsonb, conditions text, languages text[],
  description text, source_url text, last_updated timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    s.id, s.source, s.name, s.category, s.subcategory,
    ST_Y(s.location::geometry) AS lat,
    ST_X(s.location::geometry) AS lng,
    s.address, s.city, s.postal_code,
    s.phone, s.email, s.website,
    s.hours, s.conditions, s.languages,
    s.description, s.source_url, s.last_updated
  FROM services s
  WHERE s.id = service_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_service_by_id TO anon;
GRANT EXECUTE ON FUNCTION get_service_by_id TO authenticated;

-- ── 4. Row Level Security ───────────────────────────────────────
-- Lecture publique (anon key), écriture réservée au service role
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read" ON services;
CREATE POLICY "public read" ON services
  FOR SELECT USING (true);

-- Les fonctions SECURITY DEFINER s'exécutent avec les droits du créateur
-- donc l'anon key peut appeler search_services sans accès direct à la table
GRANT EXECUTE ON FUNCTION search_services TO anon;
GRANT EXECUTE ON FUNCTION search_services TO authenticated;
