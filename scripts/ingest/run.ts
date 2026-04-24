#!/usr/bin/env node
/**
 * Daily ingestion script — run via GitHub Actions or manually:
 *   npx tsx scripts/ingest/run.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY env vars.
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { fetchOsmServices } from '../../lib/connectors/osm'
import { loadCommunityServices } from '../../lib/connectors/community'
import type { RawService } from '../../lib/normalizers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function upsertService(raw: RawService) {
  const { error } = await supabase.rpc('upsert_service', {
    p_external_id: raw.externalId,
    p_source:      raw.source,
    p_name:        raw.name,
    p_category:    raw.category,
    p_subcategory: raw.subcategory ?? null,
    p_lat:         raw.lat,
    p_lng:         raw.lng,
    p_address:     raw.address,
    p_city:        raw.city,
    p_postal_code: raw.postalCode ?? null,
    p_phone:       raw.phone ?? null,
    p_email:       raw.email ?? null,
    p_website:     raw.website ?? null,
    p_hours:       raw.hours ? JSON.stringify(raw.hours) : null,
    p_conditions:  raw.conditions ?? null,
    p_languages:   raw.languages ?? null,
    p_description: raw.description ?? null,
    p_source_url:  raw.sourceUrl ?? null,
  })
  if (error) throw error
}

async function main() {
  console.log('🔄 RefugeMap ingestion started', new Date().toISOString())

  // Vérification de la connexion
  const { error: pingError } = await supabase.from('services').select('id').limit(1)
  if (pingError) {
    console.error('✗ Impossible de se connecter à Supabase :', pingError.message)
    process.exit(1)
  }
  console.log('✅ Connexion Supabase OK')

  const connectors = [
    { name: 'OSM (France)',  fetch: () => fetchOsmServices() },
    { name: 'Community',     fetch: async () => loadCommunityServices() },
  ]

  for (const connector of connectors) {
    try {
      console.log(`⏳ Fetching ${connector.name}…`)
      const raws = await connector.fetch()
      console.log(`  → ${raws.length} records fetched`)

      let ok = 0, err = 0
      for (const raw of raws) {
        try {
          await upsertService(raw)
          ok++
        } catch (e: any) {
          err++
          if (err <= 3) console.error('  ✗', e?.message ?? e)
        }
      }
      console.log(`  ✓ ${ok} upserted, ${err} errors`)
    } catch (e: any) {
      console.error(`✗ ${connector.name} failed:`, e?.message ?? e)
    }
  }

  console.log('✅ Ingestion complete', new Date().toISOString())
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
