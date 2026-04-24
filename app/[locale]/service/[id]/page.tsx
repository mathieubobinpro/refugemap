import { notFound } from 'next/navigation'
import { DetailScreen } from '@/components/services/DetailScreen'
import type { ServiceDTO } from '@/lib/types'

async function getService(id: string): Promise<ServiceDTO | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/services/${id}`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = await getService(id)
  if (!service) notFound()
  return <DetailScreen service={service} />
}
