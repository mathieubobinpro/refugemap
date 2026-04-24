import type { NewService, Category } from '@/lib/db/schema'

export interface RawService {
  externalId: string
  source: string
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

export function toDbService(raw: RawService): NewService {
  return {
    externalId: raw.externalId,
    source: raw.source as any,
    name: raw.name.trim(),
    category: raw.category,
    subcategory: raw.subcategory,
    // PostGIS WKT — inserted via ST_GeomFromText in the upsert
    location: `SRID=4326;POINT(${raw.lng} ${raw.lat})` as any,
    address: raw.address,
    city: raw.city,
    postalCode: raw.postalCode,
    phone: raw.phone,
    email: raw.email,
    website: raw.website,
    hours: raw.hours,
    conditions: raw.conditions,
    languages: raw.languages,
    description: raw.description,
    sourceUrl: raw.sourceUrl,
    lastUpdated: new Date(),
  }
}
