import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/supabase'
import type { ServiceDTO } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const lat      = parseFloat(searchParams.get('lat')    ?? '48.8566')
  const lng      = parseFloat(searchParams.get('lng')    ?? '2.3522')
  const radius   = Math.min(parseInt(searchParams.get('radius') ?? '5000'), 50000)
  const category = searchParams.get('category') || null
  const limit    = Math.min(parseInt(searchParams.get('limit')  ?? '50'), 200)

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin().rpc('search_services', {
    user_lat:        lat,
    user_lng:        lng,
    radius_m:        radius,
    filter_category: category,
    result_limit:    limit,
  })

  if (error) {
    console.error('[/api/services]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result: ServiceDTO[] = (data ?? []).map((row: any) => ({
    ...row,
    postalCode:  row.postal_code,
    sourceUrl:   row.source_url,
    lastUpdated: row.last_updated,
  }))

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' },
  })
}
