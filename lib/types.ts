import type { Category } from './db/schema'

export type { Category }

export interface ServiceDTO {
  id: string
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
  lastUpdated: string
  distance?: number
  isOpen?: boolean
  closesAt?: string
}

export interface GeoPosition {
  lat: number
  lng: number
}

export const DEFAULT_POSITION: GeoPosition = { lat: 48.8566, lng: 2.3522 } // Paris
