import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { services } from '@/lib/db/schema'
import type { ServiceDTO } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const lat = parseFloat(searchParams.get('lat') ?? '48.8566')
  const lng = parseFloat(searchParams.get('lng') ?? '2.3522')
  const radius = Math.min(parseInt(searchParams.get('radius') ?? '5000'), 50000)
  const category = searchParams.get('category')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  try {
    const rows = await db.execute(sql`
      SELECT
        s.id,
        s.source,
        s.name,
        s.category,
        s.subcategory,
        ST_Y(s.location::geometry) AS lat,
        ST_X(s.location::geometry) AS lng,
        s.address,
        s.city,
        s.postal_code AS "postalCode",
        s.phone,
        s.email,
        s.website,
        s.hours,
        s.conditions,
        s.languages,
        s.description,
        s.source_url AS "sourceUrl",
        s.last_updated AS "lastUpdated",
        ST_Distance(
          s.location::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) AS distance
      FROM services s
      WHERE ST_DWithin(
        s.location::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radius}
      )
      ${category ? sql`AND s.category = ${category}` : sql``}
      ORDER BY distance ASC
      LIMIT ${limit}
    `)

    const result: ServiceDTO[] = (rows as any[]).map((row) => ({
      ...row,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      distance: parseFloat(row.distance),
      lastUpdated: row.lastUpdated?.toISOString?.() ?? row.lastUpdated,
    }))

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' },
    })
  } catch (err) {
    console.error('[/api/services]', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
