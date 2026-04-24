import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import type { ServiceDTO } from '@/lib/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const rows = await db.execute(sql`
      SELECT
        id, source, name, category, subcategory,
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lng,
        address, city, postal_code AS "postalCode",
        phone, email, website, hours, conditions, languages,
        description, source_url AS "sourceUrl",
        last_updated AS "lastUpdated"
      FROM services
      WHERE id = ${id}::uuid
      LIMIT 1
    `)

    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const row: any = rows[0]
    const service: ServiceDTO = {
      ...row,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      lastUpdated: row.lastUpdated?.toISOString?.() ?? row.lastUpdated,
    }

    return NextResponse.json(service, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    })
  } catch (err) {
    console.error('[/api/services/:id]', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
