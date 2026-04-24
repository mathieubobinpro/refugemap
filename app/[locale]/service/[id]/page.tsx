import { notFound } from 'next/navigation'
import { DetailScreen } from '@/components/services/DetailScreen'
import { supabaseAdmin } from '@/lib/db/supabase'
import type { ServiceDTO } from '@/lib/types'

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data, error } = await supabaseAdmin().rpc('get_service_by_id', {
    service_id: id,
  })

  if (error) {
    console.error('[ServicePage] get_service_by_id error:', error)
    notFound()
  }

  if (!data?.length) notFound()

  const row = data[0]
  const service: ServiceDTO = {
    id:          row.id,
    source:      row.source,
    name:        row.name,
    category:    row.category as any,
    subcategory: row.subcategory ?? undefined,
    lat:         row.lat,
    lng:         row.lng,
    address:     row.address,
    city:        row.city,
    postalCode:  row.postal_code ?? undefined,
    phone:       row.phone ?? undefined,
    email:       row.email ?? undefined,
    website:     row.website ?? undefined,
    hours:       row.hours ?? undefined,
    conditions:  row.conditions ?? undefined,
    languages:   row.languages ?? undefined,
    description: row.description ?? undefined,
    sourceUrl:   row.source_url ?? undefined,
    lastUpdated: row.last_updated,
  }

  return <DetailScreen service={service} />
}
