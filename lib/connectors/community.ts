import { readFileSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'
import type { RawService } from '../normalizers'
import type { Category } from '../db/schema'

interface CommunityEntry {
  id?: string
  name: string
  category: Category
  subcategory?: string
  lat: number
  lng: number
  address: string
  city: string
  postalCode?: string
  phone?: string
  email?: string
  website?: string
  hours?: Array<{ day: string; time: string }>
  conditions?: string
  languages?: string[]
  description?: string
  sourceUrl?: string
}

export function loadCommunityServices(): RawService[] {
  const filePath = join(process.cwd(), 'public', 'data', 'community.yaml')
  let raw: string
  try {
    raw = readFileSync(filePath, 'utf-8')
  } catch {
    return []
  }

  const data = yaml.load(raw) as { services?: CommunityEntry[] }
  if (!data?.services) return []

  return data.services.map((entry, i) => ({
    externalId: entry.id ?? `community-${i}`,
    source: 'community',
    name: entry.name,
    category: entry.category,
    subcategory: entry.subcategory,
    lat: entry.lat,
    lng: entry.lng,
    address: entry.address,
    city: entry.city,
    postalCode: entry.postalCode,
    phone: entry.phone,
    email: entry.email,
    website: entry.website,
    hours: entry.hours,
    conditions: entry.conditions,
    languages: entry.languages,
    description: entry.description,
    sourceUrl: entry.sourceUrl,
  }))
}
