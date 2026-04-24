#!/usr/bin/env node
/**
 * Daily ingestion script — run via GitHub Actions or manually:
 *   npx tsx scripts/ingest/run.ts
 *
 * Requires DATABASE_URL env var.
 */
import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { db } from '../../lib/db/client'
import { fetchOsmServices } from '../../lib/connectors/osm'
import { loadCommunityServices } from '../../lib/connectors/community'
import { toDbService } from '../../lib/normalizers'

async function upsertService(raw: ReturnType<typeof toDbService>) {
  await db.execute(sql`
    INSERT INTO services (
      id, external_id, source, name, category, subcategory,
      location, address, city, postal_code,
      phone, email, website, hours, conditions, languages,
      description, source_url, last_updated
    ) VALUES (
      gen_random_uuid(),
      ${raw.externalId},
      ${raw.source},
      ${raw.name},
      ${raw.category},
      ${raw.subcategory ?? null},
      ST_GeomFromText(${`POINT(${(raw.location as string).replace('SRID=4326;POINT(', '').replace(')', '')}`}, 4326),
      ${raw.address},
      ${raw.city},
      ${raw.postalCode ?? null},
      ${raw.phone ?? null},
      ${raw.email ?? null},
      ${raw.website ?? null},
      ${raw.hours ? JSON.stringify(raw.hours) : null}::jsonb,
      ${raw.conditions ?? null},
      ${raw.languages ?? null},
      ${raw.description ?? null},
      ${raw.sourceUrl ?? null},
      NOW()
    )
    ON CONFLICT (source, external_id)
    DO UPDATE SET
      name         = EXCLUDED.name,
      category     = EXCLUDED.category,
      location     = EXCLUDED.location,
      address      = EXCLUDED.address,
      city         = EXCLUDED.city,
      phone        = EXCLUDED.phone,
      website      = EXCLUDED.website,
      hours        = EXCLUDED.hours,
      description  = EXCLUDED.description,
      last_updated = NOW()
  `)
}

async function main() {
  console.log('🔄 RefugeMap ingestion started', new Date().toISOString())

  const connectors = [
    { name: 'OSM', fetch: () => fetchOsmServices() },
    { name: 'Community', fetch: async () => loadCommunityServices() },
  ]

  for (const connector of connectors) {
    try {
      console.log(`⏳ Fetching ${connector.name}…`)
      const raws = await connector.fetch()
      console.log(`  → ${raws.length} records fetched`)

      let ok = 0, err = 0
      for (const raw of raws) {
        try {
          await upsertService(toDbService(raw))
          ok++
        } catch (e) {
          err++
          if (err <= 3) console.error('  ✗ upsert error:', e)
        }
      }
      console.log(`  ✓ ${ok} upserted, ${err} errors`)
    } catch (e) {
      console.error(`✗ ${connector.name} failed:`, e)
    }
  }

  console.log('✅ Ingestion complete', new Date().toISOString())
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
